import { ConflictException, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import * as jwt from 'jsonwebtoken'
import * as jwksClient from 'jwks-rsa'
import { ConfigService } from '@src/shared/config/service/config.service'
import { firstValueFrom } from 'rxjs'


@Injectable()
export class ExternalAuth0Client {

  private readonly logger = new Logger(ExternalAuth0Client.name)

	private readonly auth0Secret: string = process.env.AUTH0_SECRET
	private readonly auth0Domain: string
  private readonly auth0ApiUrl: string
  private readonly auth0ClientId: string
  private readonly auth0ClientSecret: string
	private readonly clientJwt: jwksClient.JwksClient
  constructor(
    private readonly configService: ConfigService,
		private readonly client: HttpService
  ) {
		this.auth0Domain = this.configService.get('auth_config').auth_domain
    this.auth0ApiUrl = `https://${this.auth0Domain}/api/v2/`
    this.auth0ClientId = this.configService.get('auth_config').auth_client_id
    this.auth0ClientSecret = this.configService.get('auth_config').auth_client_secret
		this.auth0Secret = this.configService.get('auth_config').auth_client_secret
		this.clientJwt = jwksClient({
			jwksUri: `https://${this.configService.get('auth_config').auth_domain}/.well-known/jwks.json`,
		})
	}

	private async getAuth0ManagementApiToken(): Promise<string> {
    try {
      const url = `https://${this.auth0Domain}/oauth/token`;

      const response = await firstValueFrom(
        this.client.post(
          url,
          {
            client_id: this.auth0ClientId,
            client_secret: this.auth0ClientSecret,
            audience: `https://${this.auth0Domain}/api/v2/`,
            grant_type: 'client_credentials',
          },
        ),
      )
  
      return response.data.access_token
    } catch (error) {
      throw new HttpException('Failed to get Auth0 API token', HttpStatus.UNAUTHORIZED)
    }
  }

	async getUserClaims(token: string) {
    try {
      const decodedHeader: any = jwt.decode(token, { complete: true })
      if (!decodedHeader || !decodedHeader.header.kid) {
        throw new Error('Token header is missing "kid"')
      }
      const keys = await this.clientJwt.getSigningKeys()
      const signingKey = keys.find(key => key.kid === decodedHeader.header.kid)
      if (!signingKey) {
        throw new Error('Signing key not found')
      }

      const publicKey = signingKey.getPublicKey()
      const decodedToken = jwt.verify(token, publicKey)

      return {
        email: decodedToken['email'],
        name: decodedToken['name'],
        first_name: decodedToken['given_name'],
        last_name: decodedToken['family_name'],
        sub: decodedToken['sub'],
        roles: decodedToken['roles'],
      }
    } catch (error) {
      throw new Error('Failed to decode the token: ' + error)
    }
  }

	async getUserByAuth0Email(email: string): Promise<any> {
    try {
      const url = `${this.auth0ApiUrl}users-by-email`
      const token = await this.getAuth0ManagementApiToken()
      const response = await firstValueFrom(
        this.client.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            email: email,
          },
        }),
      )

      return response.data[0]
    } catch (error) {
      throw new HttpException('Failed to retrieve user by email from Auth0', HttpStatus.BAD_REQUEST)
    }
  }

  async createUserInAuth0(email: string, password: string): Promise<any> {
    try {
      const url = `${this.auth0ApiUrl}users`
      const token = await this.getAuth0ManagementApiToken()
  
      const response = await firstValueFrom(
        this.client.post(
          url,
          {
            email,
            password,
            connection: 'Username-Password-Authentication',
            verify_email: true,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        )
      )
  
      return response.data
    } catch (error) {
      throw new HttpException(
        `Failed to create user in Auth0: ${error.response?.data?.message || error.message}`,
        HttpStatus.BAD_REQUEST
      )
    }
  }

  async inviteUserWithPasswordSetup(email: string): Promise<string> {
    try {
      const token = await this.getAuth0ManagementApiToken()
      const createUserResponse = await firstValueFrom(
        this.client.post(
          `${this.auth0ApiUrl}users`,
          {
            email,
            connection: 'Username-Password-Authentication',
            email_verified: false,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        )
      )
  
      const userId = createUserResponse.data.user_id
      const ticketResponse = await firstValueFrom(
        this.client.post(
          `${this.auth0ApiUrl}tickets/password-change`,
          {
            result_url: 'https://meuapp.com/login',
            user_id: userId,
            client_id: this.auth0ClientId,
            connection: 'Username-Password-Authentication',
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        )
      );
  
      return ticketResponse.data.ticket
    } catch (error) {
      throw new HttpException(
        `Failed to invite user with password setup: ${error.response?.data?.message || error.message}`,
        HttpStatus.BAD_REQUEST
      )
    }
  }


  async deleteUserByEmail(email: string): Promise<void> {
    try {
      const user = await this.getUserByAuth0Email(email)
      if (!user) {
        throw new Error('User not found on Auth0')
      }
  
      const url = `${this.auth0ApiUrl}users/${user.user_id}`
      const token = await this.getAuth0ManagementApiToken()
  
      await firstValueFrom(
        this.client.delete(url, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
  
      this.logger.log(`User ${email} deleted from Auth0`)
    } catch (error) {
      throw new HttpException(`Erro ao excluir usuário: ${error.message}`, HttpStatus.BAD_REQUEST)
    }
  }

  async loginWithEmailAndPassword(email: string, password: string): Promise<string> {
    try {
      const url = `https://${this.auth0Domain}/oauth/token`
  
      const response = await firstValueFrom(
        this.client.post(
          url,
          {
            grant_type: 'password',
            client_id: this.auth0ClientId,
            client_secret: this.auth0ClientSecret,
            username: email,
            password: password,
            audience: `https://${this.auth0Domain}/api/v2/`,
            scope: 'openid profile email',
            connection: 'Username-Password-Authentication',
          },
          {
            headers: { 'Content-Type': 'application/json' },
          }
        )
      )
  
      return response.data.access_token
    } catch (error) {
      this.logger.error(`Login failed: ${error.response?.data?.error_description || error.message}`)
      throw new HttpException(
        `Login failed: ${error.response?.data?.error_description || error.message}`,
        HttpStatus.UNAUTHORIZED
      )
    }
  }


  async requestPasswordReset(email: string): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.client.post(
          `https://${this.auth0Domain}/dbconnections/change_password`,
          {
            client_id: this.auth0ClientId,
            email: email,
            connection: 'Username-Password-Authentication',
          },
          {
            headers: { 'Content-Type': 'application/json' },
          }
        )
      )

      if (response.status !== 200) {
        throw new ConflictException('Erro ao tentar resetar a senha no Auth0')
      }
    } catch (error) {
      throw new ConflictException('Erro ao comunicar com Auth0: ' + error.message)
    }
  }
}