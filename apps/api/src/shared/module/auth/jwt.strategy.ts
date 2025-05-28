import { Injectable } from '@nestjs/common'
import { MESSAGES } from '@nestjs/core/constants'
import { PassportStrategy } from '@nestjs/passport'
import { ConfigService } from '@src/shared/config/service/config.service'
import { ExtractJwt, Strategy } from 'passport-jwt'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('secret_token'),
    })
  }

  async validate(payload: any) {
    return { 
      userId: payload.sub, 
      email: payload.email, 
      permissions: payload.permissions 
    }
  }
}
