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
    const accountId = request.headers['x-account-id']
    const user = request.user

    if (!user || !user.id) {
      throw new UnauthorizedException('Usuário não autenticado')
    }

    if (!isUUID(accountId)) {
      throw new BadRequestException('ID da conta inválido')
    }

    const hasAccess = await this.cache.userHasAccess(user.id, accountId)
    if (!hasAccess) {
      throw new ForbiddenException('Usuário sem permissão nesta conta')
    }

    const tokenRevoked = await this.cache.isTokenRevoked(user.sub)
    if (tokenRevoked) {
      throw new UnauthorizedException('Token expirado ou revogado')
    }

    if (!Array.isArray(user.permissions) || user.permissions.length === 0) {
      throw new ForbiddenException('Permissões não definidas para o usuário')
    }

    const hasRequiredRole = roles.some(role => user.permissions.includes(role))
    if (!hasRequiredRole) {
      throw new ForbiddenException('Usuário sem permissão para esta operação')
    }

    request.accountId = accountId

    return true
  }
}