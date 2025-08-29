import { z } from 'zod'

export const environmentSchema = z.enum(['test', 'development', 'production'])

export const databaseSchema = z.object({
  host: z.string(),
  database: z.string(),
  password: z.string(),
  port: z.coerce.number(),
  url: z.string().optional(),
  username: z.string()
})

export const redisSchema = z.object({
  host: z.string(),
  port: z.number(),
})

export const storageSchema = z.object({
  project_id: z.string(),
  key_file_name: z.string(),
})

export const authSchema = z.object({
  auth_domain: z.string(),
  auth_client_id: z.string(),
  auth_client_secret: z.string(),
  auth_audience: z.string()
})

export const posthogSchema = z.object({
  api_key: z.string(),
  host: z.string().optional().default('https://app.posthog.com'),
})

export const configSchema = z.object({
  env: z.string(),
  api_version: z.string(),
  broker_uri: z.string(),
  base_url: z.string(),
  auth_config: authSchema,
  secret_token: z.string(),
  refresh_secret: z.string(),
  port: z.coerce.number().positive().int(),
  email_service: z.string(),
  redis: redisSchema,
  database: databaseSchema,
  storage: storageSchema,
  posthog: posthogSchema,
})
