import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest()
    const userOrgId = request.user.organizationId
    const bodyOrgId = request.body.organizationId

    if (!bodyOrgId || userOrgId !== bodyOrgId) {
      new ForbiddenException('You do not have permission to perform this operation.')
    }
    
    return super.canActivate(context)
  }
}