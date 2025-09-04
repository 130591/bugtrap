import { registerAs } from '@nestjs/config';
import { IsString, IsNumber, IsOptional, validateSync } from 'class-validator';
import { Transform, plainToInstance } from 'class-transformer';

class CacheConfig {
  @IsString()
  @IsOptional()
  REDIS_HOST: string = 'localhost'

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  REDIS_PORT: number = 6379

  @IsString()
  @IsOptional()
  REDIS_PASSWORD?: string

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  REDIS_DB: number = 0

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  CACHE_DEFAULT_TTL: number = 300

  @IsString()
  @IsOptional()
  NODE_ID: string = `node-${Math.random().toString(36).substr(2, 9)}`
}

export default registerAs('cache', () => {;
  const config = plainToInstance(CacheConfig, process.env);
  const errors = validateSync(config);
  
  if (errors.length > 0) {
    throw new Error(`Cache configuration validation failed: ${errors.toString()}`);
  }
  
  return config;
})
