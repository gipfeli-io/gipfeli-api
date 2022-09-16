import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  GenericStatusResponseWithContent,
  ValidationError,
} from '../utils/types/response';
import { INestApplication } from '@nestjs/common';

const API_PATH = 'api';
const API_TITLE = 'gipfeli.io - API Documentation';
const API_DESCRIPTION = `API Documentation for the gipfeli.io backend API.\n\nPlase note that error codes 429 (too many request) and 500 are not displayed, since they apply to all.\n\nYou may also download the JSON version of this spec <a href="/${API_PATH}-json">here</a> (e.g. to import into postman).`;
const API_VERSION = '1.0';
const API_LICENSE = {
  name: 'MIT',
  url: 'https://github.com/gipfeli-io/gipfeli-api/blob/stage/LICENSE',
};

const DisableTryItOutPlugin = () => {
  return {
    statePlugins: {
      spec: {
        wrapSelectors: {
          allowTryItOutFor: () => () => false,
        },
      },
    },
  };
};

const DisableAuthorizePlugin = function () {
  return {
    wrapComponents: {
      authorizeBtn: () => () => null,
    },
  };
};

const swaggerSetup = (app: INestApplication, environment: string) => {
  // Disable tryout buttons and authorize on staging/production only
  const plugins =
    environment === 'production' || environment === 'staging'
      ? [DisableTryItOutPlugin, DisableAuthorizePlugin]
      : [];

  const config = new DocumentBuilder()
    .setTitle(API_TITLE)
    .setDescription(API_DESCRIPTION)
    .setLicense(API_LICENSE.name, API_LICENSE.url)
    .setVersion(API_VERSION)
    .addBearerAuth(
      {
        type: 'http',
        bearerFormat: 'JWT',
        description: 'Used for endpoints that require a valid user.',
      },
      'default',
    )
    .addBearerAuth(
      {
        type: 'http',
        description:
          'User for endpoints that perform maintenance jobs. Require the secret as defined in CLEAN_UP_TOKEN environment variable.',
      },
      'maintenance',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey, methodKey) => methodKey,
    extraModels: [GenericStatusResponseWithContent, ValidationError],
  });

  SwaggerModule.setup(API_PATH, app, document, {
    customSiteTitle: API_TITLE,
    swaggerOptions: {
      operationsSorter: 'alpha',
      tagsSorter: 'alpha',
      plugins,
    },
  });
};

export default swaggerSetup;
