import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService, LoginInput, RegisterInput } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Authentication')
@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Authenticate user with email and password' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'admin@fieldops.ae' },
        password: { type: 'string', example: 'DemoPassword123!' },
      },
      required: ['email', 'password'],
    },
  })
  async login(@Body() body: LoginInput) {
    return this.authService.login(body);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new customer account' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'client@dubaimall.ae' },
        password: { type: 'string', example: 'SecurePass123!' },
        fullName: { type: 'string', example: 'Hamdan Al-Maktoum' },
        phone: { type: 'string', example: '+971501122334' },
        companyName: { type: 'string', example: 'Dubai Mall Retail Corp' },
        trn: { type: 'string', example: '100998877600003' },
        siteName: { type: 'string', example: 'Dubai Mall Unit 104' },
        address: { type: 'string', example: 'Downtown Dubai, UAE' },
        latitude: { type: 'number', example: 25.1972 },
        longitude: { type: 'number', example: 55.2744 },
      },
      required: ['email', 'password', 'fullName', 'phone'],
    },
  })
  async register(@Body() body: RegisterInput) {
    return this.authService.register(body);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh JWT access token using refresh token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: { type: 'string' },
      },
      required: ['refreshToken'],
    },
  })
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke active refresh tokens and log out' })
  async logout(@CurrentUser('id') userId: string) {
    return this.authService.logout(userId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile, roles, and permissions' })
  async getMe(@CurrentUser('id') userId: string) {
    return this.authService.getMe(userId);
  }
}
