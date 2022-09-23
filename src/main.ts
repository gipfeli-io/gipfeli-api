import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import { SentryInterceptor } from './shared/interceptors/SentryInterceptor';
import { ConfigService } from '@nestjs/config';
import GroupedExceptionFactory from './shared/validation/GroupedExceptionFactory';
import helmet from 'helmet';
import swaggerSetup from './shared/swagger-setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('environment.port');
  const environment = configService.get<string>('environment.environment');

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

  // Setup swagger.
  swaggerSetup(app, environment);

  await app.listen(port);
}

bootstrap();
