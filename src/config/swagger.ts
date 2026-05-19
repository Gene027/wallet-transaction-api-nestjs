import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = () =>
  new DocumentBuilder()
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
