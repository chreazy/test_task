import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');
  app.getHttpAdapter().getInstance().set('strict routing', false);

  const swaggerDoc = new DocumentBuilder()
    .setTitle('Журнал работ')
    .setDescription('REST API. Префикс `/api`.')
    .setVersion('1.0')
    .addTag('Системное')
    .addTag('Каталог')
    .addTag('Журнал')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerDoc);
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'Журнал работ — Swagger',
    jsonDocumentUrl: 'docs-json',
    /** Иначе UI окажется на `/docs`, а не `/api/docs` (глобальный префикс не применяется по умолчанию). */
    useGlobalPrefix: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.enableCors({ origin: true });
  const port = parseInt(process.env.PORT ?? '3000', 10);
  await app.listen(port, '0.0.0.0');
}
void bootstrap();
