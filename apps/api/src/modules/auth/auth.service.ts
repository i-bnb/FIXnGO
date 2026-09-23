import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  companyName?: string;
  trn?: string;
  siteName?: string;
  address?: string;
  emirate?: string;
  area?: string;
  latitude?: number;
  longitude?: number;
}

export interface LoginInput {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private auditService: AuditService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
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
        employee: true,
      },
    });

    if (!user || user.deletedAt || !user.isActive) {
      return null;
    }

    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      return null;
    }

    return user;
  }

  async login(input: LoginInput) {
    const user = await this.validateUser(input.email, input.password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const roles = user.userRoles.map((ur) => ur.role.code);
    const primaryRole = roles[0] || 'CUSTOMER_PORTAL';
    const permissions: string[] = [];
    for (const ur of user.userRoles) {
      for (const rp of ur.role.rolePermissions) {
        if (!permissions.includes(rp.permission.code)) {
          permissions.push(rp.permission.code);
        }
      }
    }

    const payload = {
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
      role: primaryRole,
      roles,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'fieldops-jwt-super-secret-key-2026-demo',
      expiresIn: '1d',
    });

    const refreshTokenString = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'fieldops-jwt-refresh-secret-key-2026-demo',
      expiresIn: '7d',
    });

    // Save refresh token record
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    const tokenHash = await bcrypt.hash(refreshTokenString, 8);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    await this.auditService.log({
      actorUserId: user.id,
      actorName: user.fullName,
      actorRole: primaryRole,
      action: 'LOGIN',
      entityName: 'User',
      entityId: user.id,
      details: { email: user.email, roles },
    });

    return {
      accessToken,
      refreshToken: refreshTokenString,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        roles,
        primaryRole,
        permissions,
        employeeId: user.employee?.id,
      },
    };
  }

  async register(input: RegisterInput) {
    const existing = await this.prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existing) {
      throw new BadRequestException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    // Get or create CUSTOMER_PORTAL role
    let customerRole = await this.prisma.role.findUnique({
      where: { code: 'CUSTOMER_PORTAL' },
    });
    if (!customerRole) {
      customerRole = await this.prisma.role.create({
        data: {
          code: 'CUSTOMER_PORTAL',
          name: 'Customer Portal User',
          description: 'Self-service customer booking & portal access',
          isSystem: true,
        },
      });
    }

    // Create User
    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        fullName: input.fullName,
        phone: input.phone,
        userRoles: {
          create: {
            roleId: customerRole.id,
          },
        },
      },
    });

    // Create Customer profile
    const customer = await this.prisma.customer.create({
      data: {
        customerType: input.companyName ? 'COMPANY' : 'INDIVIDUAL',
        name: input.companyName || input.fullName,
        trn: input.trn || null,
        email: input.email,
        phone: input.phone,
        contacts: {
          create: {
            name: input.fullName,
            phone: input.phone,
            email: input.email,
            isPrimary: true,
          },
        },
      },
    });

    // Create default site if address/coordinates provided
    if (input.address || input.siteName || (input.latitude && input.longitude)) {
      await this.prisma.customerSite.create({
        data: {
          customerId: customer.id,
          siteName: input.siteName || 'Primary Residence / Office',
          address: input.address || 'Dubai, United Arab Emirates',
          emirate: input.emirate || 'Dubai',
          area: input.area || 'Dubai',
          latitude: input.latitude || 25.2048,
          longitude: input.longitude || 55.2708,
        },
      });
    }

    await this.auditService.log({
      actorUserId: user.id,
      actorName: user.fullName,
      actorRole: 'CUSTOMER_PORTAL',
      action: 'REGISTER',
      entityName: 'Customer',
      entityId: customer.id,
      details: { email: user.email, name: customer.name },
    });

    return this.login({ email: input.email, password: input.password });
  }

  async refreshToken(refreshTokenString: string) {
    try {
      const payload = this.jwtService.verify(refreshTokenString, {
        secret: process.env.JWT_REFRESH_SECRET || 'fieldops-jwt-refresh-secret-key-2026-demo',
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
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

      if (!user || !user.isActive || user.deletedAt) {
        throw new UnauthorizedException('User no longer valid');
      }

      const roles = user.userRoles.map((ur) => ur.role.code);
      const primaryRole = roles[0] || 'CUSTOMER_PORTAL';

      const newAccessToken = this.jwtService.sign(
        {
          sub: user.id,
          email: user.email,
          fullName: user.fullName,
          role: primaryRole,
          roles,
        },
        {
          secret: process.env.JWT_SECRET || 'fieldops-jwt-super-secret-key-2026-demo',
          expiresIn: '1d',
        },
      );

      return {
        accessToken: newAccessToken,
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { success: true, message: 'Logged out successfully' };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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
        employee: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const roles = user.userRoles.map((ur) => ur.role.code);
    const permissions: string[] = [];
    for (const ur of user.userRoles) {
      for (const rp of ur.role.rolePermissions) {
        if (!permissions.includes(rp.permission.code)) {
          permissions.push(rp.permission.code);
        }
      }
    }

    const customer = await this.prisma.customer.findFirst({
      where: {
        OR: [
          { email: user.email },
          { contacts: { some: { email: user.email } } },
        ],
      },
      include: {
        sites: true,
        assets: true,
      },
    });

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      roles,
      primaryRole: roles[0] || 'CUSTOMER_PORTAL',
      permissions,
      employee: user.employee,
      customer,
    };
  }
}
