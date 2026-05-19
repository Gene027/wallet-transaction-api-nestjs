import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { swaggerConfig } from './config/swagger';
import { GlobalExceptionFilter } from './common/filters/exception.filter';

async function bootstrap() {
  const logger = new Logger('WalletTransactionApi');
  const app = await NestFactory.create(AppModule);
  const port = parseInt(process.env.PORT ?? '8000', 10);

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const document = SwaggerModule.createDocument(app, swaggerConfig());
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(port);
  logger.log(`HTTP server running on port ${port}`);
  logger.log(`Swagger docs available at http://localhost:${port}/docs`);
}
void bootstrap();
