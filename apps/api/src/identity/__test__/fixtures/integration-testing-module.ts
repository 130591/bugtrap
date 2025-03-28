import { HttpService } from "@nestjs/axios"
import { Test, TestingModule } from "@nestjs/testing"
import { ExternalAuth0Client } from "@src/identity/http/integration/integration-auth0.client"
import { ConfigService } from "@src/shared/config/service/config.service"

export const auth0Domain = 'test-auth0.com'
export const auth0ApiUrl = `https://${auth0Domain}/api/v2/`
export const mockToken = 'mocked-jwt-token'

export const createTestingModule = async (): Promise<TestingModule> => {
  return Test.createTestingModule({
    providers: [
      ExternalAuth0Client,
      {
        provide: ConfigService,
        useValue: {
          get: jest.fn((key) => {
            if (key === 'auth_config') {
              return {
                auth_domain: auth0Domain,
                auth_client_id: 'client-id',
                auth_client_secret: 'client-secret'
              }
            }
            return null
          })
        }
      },
      {
        provide: HttpService,
        useValue: {
          post: jest.fn(),
          get: jest.fn(),
          delete: jest.fn()
        }
      }
    ]
  }).compile()
}