import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import { SentryInterceptor } from './shared/interceptors/SentryInterceptor';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('environment.port');
  app.enableCors({
    origin: configService.get<string>('security.corsOrigin'),
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

  await app.listen(port);
}

bootstrap();
