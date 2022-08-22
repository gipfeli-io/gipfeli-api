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

const swaggerSetup = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle(API_TITLE)
    .setDescription(API_DESCRIPTION)
    .setLicense(API_LICENSE.name, API_LICENSE.url)
    .setVersion(API_VERSION)
    .addBearerAuth()
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
    },
  });
};

export default swaggerSetup;
