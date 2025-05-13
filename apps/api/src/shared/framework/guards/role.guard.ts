import { Injectable, CanActivate, ExecutionContext, ForbiddenException, BadRequestException } from '@nestjs/common'
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
    const isAuth = await super.canActivate(context)
    if (!isAuth) {
      return false
    }

    const roles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler())
    if (!roles) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const accountId = request.headers['x-account-id']
    const user = request.user

    if (!isUUID(accountId)) {
      throw new BadRequestException('Invalid account ID')
    }

    const hasAccess = await this.cache.userHasAccess(user.id, accountId)
    if (!hasAccess) {
      throw new ForbiddenException('User does not have access to this account')
    }

    request.accountId = accountId
  
    return roles.some(role => user.permissions?.includes(role))
  }
}