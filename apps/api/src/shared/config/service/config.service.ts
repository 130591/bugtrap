import { Injectable } from '@nestjs/common';
// eslint-disable-next-line no-restricted-imports
import {
  ConfigService as NestConfigService,
  Path,
  PathValue,
} from '@nestjs/config';
import { Config } from '../util/config.type';

@Injectable()
export class ConfigService<C = Config> extends NestConfigService<C, true> {
  // TODO: [Production Readiness] In production, replace direct secret retrieval
  // with a secure solution like AWS Secrets Manager or AWS Systems Manager Parameter Store
  // to prevent hardcoding or insecure exposure of sensitive credentials.
  override get<P extends Path<C>>(propertyPath: P): PathValue<C, P> {
    return super.get(propertyPath, { infer: true });
  }
}
