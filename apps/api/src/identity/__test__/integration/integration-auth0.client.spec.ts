import { HttpException } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { of, throwError } from 'rxjs'
import nock from 'nock'
import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { ExternalAuth0Client } from "@src/identity/integration/integration-auth0.client"
import { ConfigService } from "@src/shared/config/service/config.service"
import { auth0ApiUrl, createTestingModule, mockToken } from "../fixtures/integration-testing-module"

jest.mock('jwks-rsa', () => ({
  JwksClient: jest.fn().mockImplementation(() => ({
    getSigningKeys: jest.fn().mockResolvedValue([{ kid: '123', getPublicKey: () => 'fake-public-key' }])
  }))
}))

describe('ExternalAuth0Client', () => {
  let service: ExternalAuth0Client
  let httpService: HttpService
  let configService: ConfigService
	let auth0Domain: string

	jest.spyOn(httpService, 'post').mockImplementation(() =>
		of({ data: { access_token: mockToken } } as AxiosResponse)
	)

  beforeEach(async () => {
    const module = await createTestingModule()
    service = module.get<ExternalAuth0Client>(ExternalAuth0Client)
    httpService = module.get<HttpService>(HttpService)
    configService = module.get<ConfigService>(ConfigService)
		auth0Domain = configService.get('auth_config').auth_domain
  })

  afterEach(() => {
    nock.cleanAll()
    jest.clearAllMocks()
  })

  it('should retrieve an authentication token from Auth0', async () => {
    nock(`https://${auth0Domain}`)
      .post('/oauth/token')
      .reply(200, { access_token: mockToken })

		of({
      data: { access_token: mockToken },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    } as AxiosResponse)
  
    const token = await service["getAuth0ManagementApiToken"]()
    expect(token).toBe(mockToken)
  })

  it('should throw an exception when failing to retrieve the authentication token', async () => {
    nock(`https://${auth0Domain}`)
      .post('/oauth/token')
      .reply(400)

			jest.spyOn(httpService, 'post').mockReturnValue(
				throwError(() => ({
					response: {
						status: 400,
						statusText: 'Bad Request',
						headers: {},
						config: {},
						data: { message: 'Invalid request' }
					}
				}))
			)

    await expect(service["getAuth0ManagementApiToken"]()).rejects.toThrow(HttpException)
  })


	it('should fetch a user by email from Auth0', async () => {
		const email = 'user@example.com'
		const mockUser = { email, user_id: 'auth0|12345' }

		nock(auth0ApiUrl)
			.get('/users-by-email')
			.query({ email })
			.reply(200, [mockUser])

			const mockAxiosResponse: AxiosResponse<{ email: string; user_id: string }[]> = {
				data: [mockUser],
				status: 200,
				statusText: 'OK',
				headers: {},
				config: {} as InternalAxiosRequestConfig,
			}
		
		jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse))
		const user = await service.getUserByAuth0Email(email)

		expect(user).toEqual(mockUser)
	})


  it('should create a user in Auth0', async () => {
    const email = 'newuser@example.com'
    const password = 'password123'
    const mockResponse = { user_id: 'auth0|67890', email }

    nock(auth0ApiUrl)
      .post('/users')
      .reply(201, mockResponse)

     const mockAxiosResponse: AxiosResponse<typeof mockResponse> = {
			data: mockResponse,
			status: 201,
			statusText: 'Created',
			headers: {},
			config: {} as InternalAxiosRequestConfig,
		}

    jest.spyOn(httpService, 'post').mockReturnValue(of(mockAxiosResponse))
    const user = await service.createUserInAuth0(email, password)

    expect(user).toEqual(mockResponse)
  })

  it('should throw an exception when failing to create a user', async () => {
    nock(auth0ApiUrl)
      .post('/users')
      .reply(400, { message: 'Invalid request' })

			const mockAxiosError: AxiosError = {
				isAxiosError: true,
				response: {
					status: 400,
					statusText: 'Bad Request',
					data: { message: 'Invalid request' },
					headers: {},
					config: {} as any,
				},
				config: {} as any,
				toJSON: () => ({}),
				name: 'AxiosError',
				message: 'Request failed with status code 400',
			};
		
			jest.spyOn(httpService, 'post').mockReturnValue(throwError(() => mockAxiosError))

    await expect(service.createUserInAuth0('fail@example.com', 'password'))
      .rejects.toThrow(HttpException)
  })
})
