import { Injectable, CanActivate, ExecutionContext, ForbiddenException, BadRequestException, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { CacheService } from '@src/shared/module/cache'
import { isUUID } from 'class-validator'
import { ROLES_KEY } from '../decorators/role-decorator'
import { JwtAuthGuard } from './auth.guard'


@Injectable()
export class RoleGuard extends JwtAuthGuard implements CanActivate {
  constructor(private reflector: Reflector, private cache: CacheService) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isAuthenticated = await super.canActivate(context)
    if (!isAuthenticated) return false

    const roles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler())
    if (!roles) return true

    const request = context.switchToHttp().getRequest()
    const organizationId = request.user.organizationId
    const user = request.user

    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated')
    }

    if (!organizationId || !isUUID(organizationId)) {
      throw new ForbiddenException('You do not have permission to perform this operation.')
    }

    // const hasAccess = await this.cache.userHasAccess(user.id, organizationId)
    // if (!hasAccess) {
    //   throw new ForbiddenException('User without permission on this account')
    // }

    // const tokenRevoked = await this.cache.isTokenRevoked(user.jti)
    // if (tokenRevoked) {
    //   throw new UnauthorizedException('Expired or revoked token')
    // }

    if (!Array.isArray(user.permissions) || user.permissions.length === 0) {
      throw new ForbiddenException('Permissions not defined for the user')
    }

    const hasRequiredRole = roles.some(role => user.permissions.includes(role))
    if (!hasRequiredRole) {
      throw new ForbiddenException('User not allowed for this operation')
    }

    if (['POST', 'PATCH', 'DELETE'].includes(request.method)) {
      if (typeof request.body === 'object') {
        request.body.organizationId = organizationId
      }
    }

    if (request.method === 'GET') {
      request.query.organizationId = user.organizationId
    }

    return true
  }
}