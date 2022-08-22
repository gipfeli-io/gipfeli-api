import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import { SentryInterceptor } from './shared/interceptors/SentryInterceptor';
import { ConfigService } from '@nestjs/config';
import GroupedExceptionFactory from './shared/validation/GroupedExceptionFactory';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  GenericStatusResponseWithContent,
  ValidationError,
} from './utils/types/response';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('environment.port');

  // enable helmet protection for adding various security-related headers
  app.use(helmet());

  // enable CORS for specific resources only
  app.enableCors({
    origin: configService.get<string>('security.corsOrigin'),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });

  // Setup global pipe to enforce type validation on all routes
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: GroupedExceptionFactory,
      validationError: { target: true, value: true },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Initialize sentry if DSN is set
  const sentryDsn = configService.get<string>('integrations.sentry.dsn');
  if (sentryDsn !== '') {
    const environment = configService.get<string>('environment.environment');
    Sentry.init({
      integrations: [
        // Setup tracing integration to measure performance
        new Tracing.Integrations.Express({
          app: app.getHttpServer(),
        }),
      ],
      dsn: sentryDsn,
      environment: environment ?? 'localhost',
      // set trace samplerate to low on production to not impact performance
      tracesSampleRate: environment === 'production' ? 0.01 : 0.2,
    });

    app.use(Sentry.Handlers.tracingHandler());
    app.useGlobalInterceptors(new SentryInterceptor());
  }

  // Setup swagger. Todo: do we want this in production and staging?
  const config = new DocumentBuilder()
    .setTitle('gipfeli.io')
    .setDescription(
      'API Documentation for the gipfeli.io backend API.\n\nPlase note that error codes 429 (too many request) and 500 are not displayed, since they apply to all.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [GenericStatusResponseWithContent, ValidationError],
  });
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'gipfeli.io API Documentation',
    swaggerOptions: {
      operationsSorter: 'alpha',
      tagsSorter: 'alpha',
    },
  });

  await app.listen(port);
}

bootstrap();
