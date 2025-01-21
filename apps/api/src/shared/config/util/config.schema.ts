import { z } from 'zod';

export const environmentSchema = z.enum(['test', 'development', 'production']);

export const zendeskSchema = z.object({
  url: z.string().url(),
  auth_usuario: z.string(),
  auth_token: z.string(),
  token_jwt: z.string(),
});

export const databaseSchema = z.object({
  host: z.string(),
  database: z.string(),
  password: z.string(),
  port: z.coerce.number(),
  url: z.string().optional(),
  username: z.string(),
});

export const storageSchema = z.object({
  project_id: z.string(),
  key_file_name: z.string(),
});

export const configSchema = z.object({
  env: z.string(),
  temp_dir: z.string(),
  api_version: z.string(),
  port: z.coerce.number().positive().int(),
  graphql_url: z.string(),
  jwt_token: z.string(),
  database: databaseSchema,
  zendesk: zendeskSchema,
  storage: storageSchema,
  auth_url: z.string(),
});
