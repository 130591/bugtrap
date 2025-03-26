import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import * as jwksRsa from 'jwks-rsa'
import { ConfigService } from '@src/shared/config/service/config.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: jwksRsa.expressJwtSecret({
        jwksUri: `https://${configService.get('auth_config').auth_domain}/.well-known/jwks.json`,
        cache: true,
        rateLimit: true,
      }),
      audience: configService.get('auth_config').auth_audience,
      issuer: `https://${configService.get('auth_config').auth_domain}`,
      algorithms: ['RS256'],
    })
  }

  async validate(payload: any) {
    return payload
  }
}
