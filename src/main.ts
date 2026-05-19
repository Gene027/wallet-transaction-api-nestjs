import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('WalletTransactionApi');
  const app = await NestFactory.create(AppModule);
  const port = parseInt(process.env.PORT ?? '3000', 10);

  const config = new DocumentBuilder()
    .setTitle('Wallet Transaction API')
    .setDescription('Wallet Transaction API HTTP API')
    .setVersion('1.0')
    .addApiKey(
      {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
        description: 'Merchant API key',
      },
      'ApiKey',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);
  logger.log(`HTTP server running on port ${port}`);
  logger.log(`Swagger docs available at http://localhost:${port}/docs`);
}
void bootstrap();
