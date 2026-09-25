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
  portal?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private auditService: AuditService,
  ) {}

    // Remove in-memory lockout; use persistent LoginAttempt model
    // Record a failed login attempt for the given email.
    private async recordFailedAttempt(email: string) {
      const normalizedEmail = email.toLowerCase();
      const attempt = await this.prisma.loginAttempt.upsert({
        where: { email_ipAddress: { email: normalizedEmail, ipAddress: 'unknown' } },
        update: {
          failedCount: { increment: 1 },
          lockedUntil:
            this.prisma.loginAttempt.updateMany({
              where: {
                email: normalizedEmail,
                ipAddress: 'unknown',
                failedCount: { gte: 5 },
                lockedUntil: null,
              },
              data: { lockedUntil: new Date(Date.now() + 15 * 60 * 1000) },
            })?.then(() => new Date(Date.now() + 15 * 60 * 1000)),
        },
        create: {
          email: normalizedEmail,
          ipAddress: 'unknown',
          failedCount: 1,
        },
      });
    }

    // Clear lockout after successful login
    private async clearFailedAttempts(email: string) {
      const normalizedEmail = email.toLowerCase();
      await this.prisma.loginAttempt.deleteMany({
        where: { email: normalizedEmail, ipAddress: 'unknown' },
      });
    }

    async validateUser(email: string, pass: string) {
      const normalizedEmail = (email || '').trim().toLowerCase();

      // Check persistent lockout
      const attempt = await this.prisma.loginAttempt.findFirst({
        where: { email: normalizedEmail, ipAddress: 'unknown' },
      });
      if (attempt?.lockedUntil && attempt.lockedUntil.getTime() > Date.now()) {
        const remainingMins = Math.ceil((attempt.lockedUntil.getTime() - Date.now()) / 60000);
        throw new UnauthorizedException(
          `Account locked due to 5 failed attempts. Please try again in ${remainingMins} minute(s) or reset your password.`,
        );
      }

      const user = await this.prisma.user.findFirst({
        where: { email: { equals: normalizedEmail, mode: 'insensitive' }, deletedAt: null },
        include: { userRoles: { include: { role: { include: { rolePermissions: { include: { permission: true } } } } } }, employee: true },
      });

      if (!user || !user.isActive) {
        await this.recordFailedAttempt(normalizedEmail);
        return null;
      }

      const isMatch = await bcrypt.compare(pass, user.passwordHash);
      if (!isMatch) {
        await this.recordFailedAttempt(normalizedEmail);
        return null;
      }

      // Successful login: clear any failed attempts
      await this.clearFailedAttempts(normalizedEmail);
      return user;
    }
    const normalizedEmail = (email || '').trim().toLowerCase();

    // Check 15-minute lockout after 5 failed attempts
    const attempt = this.failedAttempts.get(normalizedEmail);
    if (attempt?.lockedUntil && attempt.lockedUntil.getTime() > Date.now()) {
      const remainingMins = Math.ceil((attempt.lockedUntil.getTime() - Date.now()) / 60000);
      throw new UnauthorizedException(
        `Account locked due to 5 failed attempts. Please try again in ${remainingMins} minute(s) or reset your password.`,
      );
    }

    const user = await this.prisma.user.findFirst({
      where: {
        email: { equals: normalizedEmail, mode: 'insensitive' },
        deletedAt: null,
      },
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

    if (!user || !user.isActive) {
      this.recordFailedAttempt(normalizedEmail);
      return null;
    }

    let isMatch = await bcrypt.compare(pass, user.passwordHash);
    // Demo password support removed for security

    if (!isMatch) {
      this.recordFailedAttempt(normalizedEmail);
      return null;
    }

    // Login succeeded: clear failed attempt count
    this.failedAttempts.delete(normalizedEmail);

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

  async forgotPassword(email: string) {
    const normalizedEmail = (email || '').trim().toLowerCase();
    const user = await this.prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' }, deletedAt: null },
    });

    // Generate a secure random token (32 bytes hex) and hash it
    const crypto = await import('crypto');
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store token hash in DB (associate with user if exists)
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user?.id,
        tokenHash,
        expiresAt,
      },
    });

    // In demo mode, write the raw token to the admin outbox for visibility
    if (process.env.DEMO_MODE === 'true') {
      await this.auditService.log({
        actorName: user?.fullName || 'Anonymous',
        actorRole: 'ANONYMOUS',
        action: 'DEMO_PASSWORD_RESET_TOKEN',
        entityName: 'User',
        entityId: user?.id || 'unknown',
        details: { rawToken },
      });
    }

    // Log the forgot password request (generic, no token disclosed)
    await this.auditService.log({
      actorName: user?.fullName || 'Anonymous',
      actorRole: 'ANONYMOUS',
      action: 'FORGOT_PASSWORD_REQUEST',
      entityName: 'User',
      entityId: user?.id || 'unknown',
      details: { email: normalizedEmail },
    });

    return {
      success: true,
      message: 'Password reset link sent to your email (valid for 1 hour).',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters long');
    }

    // Compute hash of the raw token
    const crypto = await import('crypto');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find token record
    const tokenRecord = await this.prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        expiresAt: { gt: new Date() },
        usedAt: null,
      },
    });
    if (!tokenRecord) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    // Get user
    const user = await this.prisma.user.findUnique({
      where: { id: tokenRecord.userId },
    });
    if (!user) {
      throw new NotFoundException('User associated with reset token not found');
    }

    // Update password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Mark token used
    await this.prisma.passwordResetToken.update({
      where: { id: tokenRecord.id },
      data: { usedAt: new Date() },
    });

    // Revoke refresh tokens
    await this.prisma.refreshToken.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    // Clear lockout
    await this.clearFailedAttempts(user.email);

    // Audit log
    await this.auditService.log({
      actorUserId: user.id,
      actorName: user.fullName,
      action: 'PASSWORD_RESET_SUCCESS',
      entityName: 'User',
      entityId: user.id,
      details: { email: user.email },
    });

    return { success: true, message: 'Password has been reset successfully. You can now sign in with your new password.' };
  }

}
