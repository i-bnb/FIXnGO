import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'fieldops-jwt-super-secret-key-2026-demo',
    });
  }

  async validate(payload: { sub: string; email: string }) {
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
        employee: true,
      },
    });

    if (!user || !user.isActive || user.deletedAt) {
      throw new UnauthorizedException('User is not authorized or has been deactivated');
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

    // Also look up if customer contact is linked by email or phone
    const customer = await this.prisma.customer.findFirst({
      where: {
        OR: [
          { email: user.email },
          { contacts: { some: { email: user.email } } },
        ],
      },
    });

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      role: primaryRole,
      roles,
      permissions,
      employeeId: user.employee?.id,
      employee: user.employee,
      customerId: customer?.id,
      customer,
    };
  }
}
