import { ConfigException } from '../exception/config.exception'
import { configSchema } from './config.schema'
import { Config } from './config.type'

export const factory = (): Config => {
  const result = configSchema.safeParse({
    env: process.env.NODE_ENV,
    port: parseInt(process.env.PORT!),
    api_version: process.env.API_VERSION,
    base_url: process.env.BASE_URL,
    email_service: process.env.EMAIL_SERVICE,
    secret_token: process.env.SECRET_JWT,
    broker_uri: process.env.BROKER_URI,
    redis: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    },
    database: {
      host: process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT!),
      url: process.env.DB_URL,
      username: process.env.DB_USERNAME,
    },
    storage: {
      project_id: process.env.PROJECT_ID,
      key_file_name: process.env.KEY_FILE_NAME,
    },
    auth_config: {
      auth_domain: process.env.AUTH0_DOMAIN,
      auth_audience: process.env.AUTH0_AUDIENCE,
      auth_client_id: process.env.AUTH0_CLIENT_ID,
      auth_client_secret: process.env.AUTH0_CLIENT_SECRET
    }
  })

  if (result.success) {
    return result.data;
  }

  throw new ConfigException(
    `Invalid application configuration: ${result.error.message}`,
  )
}
