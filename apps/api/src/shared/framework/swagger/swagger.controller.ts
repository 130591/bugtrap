import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from "@nestjs/swagger";
import { injectDocumentComponents } from './injection';
import { removeEndpointsWithoutApiKey, transformDocument } from "./opem.api.component";

const options = new DocumentBuilder()
.setTitle('BugTrap API')
.setDescription('BugTrap REST API. Please see https://docs.novu.co/api-reference for more details.')
.setVersion('1.0')
.setContact('BugTrap Support', 'https://discord.gg/bugtrap', 'support@bugtrap.co')

function sdkSetup(app: INestApplication, document: OpenAPIObject) {
  document['x-speakeasy-name-override'] = [
    { operationId: '^.*get.*', methodNameOverride: 'retrieve' },
    { operationId: '^.*retrieve.*', methodNameOverride: 'retrieve' },
    { operationId: '^.*create.*', methodNameOverride: 'create' },
    { operationId: '^.*update.*', methodNameOverride: 'update' },
    { operationId: '^.*list.*', methodNameOverride: 'list' },
    { operationId: '^.*delete.*', methodNameOverride: 'delete' },
    { operationId: '^.*remove.*', methodNameOverride: 'delete' },
  ];
  document['x-speakeasy-retries'] = {
    strategy: 'backoff',
    backoff: {
      initialInterval: 500,
      maxInterval: 30000,
      maxElapsedTime: 3600000,
      exponent: 1.5,
    },
    statusCodes: ['408', '409', '429', '5XX'],
    retryConnectionErrors: true,
  };

  SwaggerModule.setup('openapi.sdk', app, transformDocument(document), {
    jsonDocumentUrl: 'openapi.sdk.json',
    yamlDocumentUrl: 'openapi.sdk.yaml',
    explorer: process.env.NODE_ENV !== 'production',
  });
}

export const setupSwagger = (app: INestApplication) => {
	const document = injectDocumentComponents(
		SwaggerModule.createDocument(app, options.build(), {
			operationIdFactory: (controllerKey: string, methodKey: string) => `${controllerKey}_${methodKey}`,
			deepScanRoutes: true,
      ignoreGlobalPrefix: false,
      include: [],
      extraModels: [],
		})
	)

	SwaggerModule.setup('api', app, {
    ...document,
    info: {
      ...document.info,
      title: `DEPRECATED: ${document.info.title}. Use /openapi.{json,yaml} instead.`,
    },
  });
  SwaggerModule.setup('openapi', app, removeEndpointsWithoutApiKey(document), {
    jsonDocumentUrl: 'openapi.json',
    yamlDocumentUrl: 'openapi.yaml',
    explorer: process.env.NODE_ENV !== 'production',
  });
  sdkSetup(app, document);
};