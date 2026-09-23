import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  Query,
  Headers,
  Logger,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AssistantService } from './assistant.service';
import { UserContext } from './tools/assistant-tools.service';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface ChatRequestBody {
  query: string;
  role?: string;
}

@ApiTags('AI Operations Assistant')
@Controller('api/assistant')
export class AssistantController {
  private readonly logger = new Logger(AssistantController.name);

  constructor(
    private assistantService: AssistantService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  /**
   * Resolves the authenticated UserContext from JWT token or demo role
   */
  private async resolveUser(req: Request, body?: ChatRequestBody): Promise<UserContext> {
    const authHeader = req.headers.authorization;
    let userContext: UserContext | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET || 'fieldops-jwt-super-secret-key-2026-demo',
        });

        // Look up full permissions from DB
        const user = await this.prisma.user.findUnique({
          where: { id: decoded.sub },
          include: {
            userRoles: {
              include: {
                role: {
                  include: {
                    rolePermissions: {
                      include: { permission: true },
                    },
                  },
                },
              },
            },
          },
        });

        if (user) {
          const roles = user.userRoles.map((ur) => ur.role.code);
          const permissions: string[] = [];
          for (const ur of user.userRoles) {
            for (const rp of ur.role.rolePermissions) {
              if (!permissions.includes(rp.permission.code)) {
                permissions.push(rp.permission.code);
              }
            }
          }

          userContext = {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: roles[0] || 'SUPER_ADMIN',
            roles,
            permissions,
          };
        }
      } catch (err) {
        this.logger.warn(`JWT verification failed: ${(err as Error).message}`);
      }
    }

    // Support demo role header or body in development/demo mode
    const requestedRole = (req.headers['x-demo-role'] as string) || body?.role;
    if (requestedRole) {
      const roleUpper = requestedRole.toUpperCase();
      // Match seeded user for this role
      let seededEmail = 'admin@fieldops.ae';
      if (roleUpper === 'ACCOUNTANT') seededEmail = 'finance@fieldops.ae';
      else if (roleUpper === 'DISPATCHER') seededEmail = 'dispatch@fieldops.ae';
      else if (roleUpper === 'OPS_MANAGER') seededEmail = 'ops@fieldops.ae';
      else if (roleUpper === 'STOREKEEPER') seededEmail = 'inventory@fieldops.ae';

      const seededUser = await this.prisma.user.findUnique({
        where: { email: seededEmail },
        include: {
          userRoles: {
            include: {
              role: {
                include: { rolePermissions: { include: { permission: true } } },
              },
            },
          },
        },
      });

      if (seededUser) {
        const roles = seededUser.userRoles.map((ur) => ur.role.code);
        const permissions: string[] = [];
        for (const ur of seededUser.userRoles) {
          for (const rp of ur.role.rolePermissions) {
            if (!permissions.includes(rp.permission.code)) {
              permissions.push(rp.permission.code);
            }
          }
        }

        userContext = {
          id: seededUser.id,
          email: seededUser.email,
          fullName: seededUser.fullName,
          role: roleUpper,
          roles,
          permissions,
        };
      } else {
        userContext = {
          id: `demo-${roleUpper.toLowerCase()}`,
          email: `${roleUpper.toLowerCase()}@fieldops.ae`,
          fullName: roleUpper === 'ACCOUNTANT' ? 'Fatima Al-Zahra (Senior Accountant)' : 'Sara Al Hashimi (Dispatcher)',
          role: roleUpper,
          roles: [roleUpper],
          permissions: roleUpper === 'ACCOUNTANT' ? ['finance.view', 'invoice.view', 'work_order.view'] : ['work_order.view', 'work_order.assign'],
        };
      }
    }

    if (!userContext) {
      throw new UnauthorizedException('Authentication token or valid role required to access Ask FIXnGO AI assistant.');
    }

    return userContext;
  }

  /**
   * POST /api/assistant/chat (and /assistant/chat)
   * Streams the AI assistant response via Server-Sent Events (SSE)
   */
  @Post('chat')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Stream AI assistant answer with live tool execution (SSE)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        query: { type: 'string', example: 'Which jobs lost money this month?' },
        role: { type: 'string', example: 'SUPER_ADMIN', enum: ['SUPER_ADMIN', 'ACCOUNTANT', 'DISPATCHER', 'OPS_MANAGER'] },
      },
      required: ['query'],
    },
  })
  async chat(@Body() body: ChatRequestBody, @Req() req: Request, @Res() res: Response) {
    if (!body?.query || typeof body.query !== 'string') {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'Query string is required' });
      return;
    }

    const user = await this.resolveUser(req, body);

    // Initialize Server-Sent Events headers
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    if (res.flushHeaders) res.flushHeaders();

    const stream$ = this.assistantService.streamChat(body.query.trim(), user);

    const subscription = stream$.subscribe({
      next: (event) => {
        res.write(`event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`);
      },
      error: (err) => {
        res.write(`event: error\ndata: ${JSON.stringify(err.message || 'Stream error')}\n\n`);
        res.end();
      },
      complete: () => {
        res.end();
      },
    });

    req.on('close', () => {
      subscription.unsubscribe();
    });
  }

  /**
   * GET /api/assistant/history
   * Retrieve recent conversation history for user
   */
  @Get('history')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current conversation turns for user' })
  async getHistory(@Req() req: Request) {
    try {
      const user = await this.resolveUser(req);
      const history = this.assistantService.getHistory(user.id || user.email || 'guest-admin');
      return { history };
    } catch {
      return { history: [] };
    }
  }

  /**
   * POST /api/assistant/clear
   * Clear session history
   */
  @Post('clear')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Clear current assistant session memory' })
  async clearHistory(@Req() req: Request) {
    try {
      const user = await this.resolveUser(req);
      this.assistantService.clearHistory(user.id || user.email || 'guest-admin');
      return { success: true, message: 'Session history cleared' };
    } catch {
      return { success: true };
    }
  }

  /**
   * GET /api/assistant/token
   * Convenience endpoint for UI role switching to retrieve signed JWT token
   */
  @Get('token')
  @ApiOperation({ summary: 'Generate JWT token for demo role persona' })
  async getDemoToken(@Query('role') role: string = 'SUPER_ADMIN') {
    const roleUpper = role.toUpperCase();
    let email = 'admin@fieldops.ae';
    let name = 'Sultan Al-Falasi';

    if (roleUpper === 'ACCOUNTANT') {
      email = 'finance@fieldops.ae';
      name = 'Fatima Al-Zahra';
    } else if (roleUpper === 'DISPATCHER') {
      email = 'dispatch@fieldops.ae';
      name = 'Mariam Al-Kaabi';
    } else if (roleUpper === 'OPS_MANAGER') {
      email = 'ops@fieldops.ae';
      name = 'Tariq Mansoor';
    }

    const payload = {
      sub: `demo-${roleUpper.toLowerCase()}`,
      email,
      fullName: name,
      role: roleUpper,
      roles: [roleUpper],
    };

    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'fieldops-jwt-super-secret-key-2026-demo',
      expiresIn: '7d',
    });

    return { token, user: payload };
  }
}
