import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException('User is not authenticated');
    }

    // Fast-path: Super Admin has unconditional access
    if (user.roles?.includes('SUPER_ADMIN') || user.role === 'SUPER_ADMIN') {
      return true;
    }

    // Check permissions already attached to JWT user object
    let userPermissions: string[] = user.permissions || [];

    // If not present in token, resolve from database
    if (userPermissions.length === 0 && user.id) {
      const assignments = await this.prisma.userRoleAssignment.findMany({
        where: { userId: user.id },
        include: {
          role: {
            include: {
              rolePermissions: {
                include: { permission: true },
              },
            },
          },
        },
      });

      for (const assignment of assignments) {
        if (assignment.role.code === 'SUPER_ADMIN') {
          return true;
        }
        for (const rp of assignment.role.rolePermissions) {
          userPermissions.push(rp.permission.code);
        }
      }
      user.permissions = userPermissions;
    }

    const hasAll = requiredPermissions.every((perm) => userPermissions.includes(perm));
    if (!hasAll) {
      throw new ForbiddenException(
        `Access denied. Missing required permission(s): ${requiredPermissions.filter((p) => !userPermissions.includes(p)).join(', ')}`,
      );
    }

    return true;
  }
}
