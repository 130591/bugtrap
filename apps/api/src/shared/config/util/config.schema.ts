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

export const configSchema = z.object({
  env: z.string(),
  api_version: z.string(),
  base_url: z.string(),
  port: z.coerce.number().positive().int(),
  email_service: z.string(),
  redis: redisSchema,
  database: databaseSchema,
  storage: storageSchema,
})
