import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtAuthGuard } from './auth.guard'
import { ROLES_KEY } from '../decorators/role-decorator'

@Injectable()
export class RoleGuard extends JwtAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {
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
    const user = request.user

    return roles.some(role => user.permissions?.includes(role))
  }
}