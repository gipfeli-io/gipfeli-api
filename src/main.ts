import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import { SentryInterceptor } from './shared/interceptors/SentryInterceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;
  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });

  // Setup global pipe to enforce type validation on all routes
  app.useGlobalPipes(
    new ValidationPipe({
      validationError: { target: true, value: true },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Initialize sentry if DSN is set
  const sentryDsn = process.env.SENTRY_DSN;
  if (sentryDsn !== '') {
    const sentryEnvironment = process.env.SENTRY_ENVIRONMENT
    Sentry.init({
      integrations: [
        // Setup tracing integration to measure performance
        new Tracing.Integrations.Express({
          app: app.getHttpServer(),
        }),
      ],
      dsn: sentryDsn,
      environment: sentryEnvironment ?? 'localhost',
      // set trace samplerate to low on production to not impact performance
      tracesSampleRate: sentryEnvironment === 'production' ? 0.01 : 0.2,
    });

    app.use(Sentry.Handlers.tracingHandler());
    app.useGlobalInterceptors(new SentryInterceptor());
  }

  await app.listen(port);
}

bootstrap();
