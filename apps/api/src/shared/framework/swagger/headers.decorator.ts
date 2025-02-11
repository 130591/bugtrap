import { OpenAPIObject } from '@nestjs/swagger';

export const injectReusableHeaders = (
  document: OpenAPIObject,
): OpenAPIObject => {
  const newDocument = { ...document };
  return newDocument;
};
