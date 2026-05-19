import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerModule } from '@app/customer';
import { AppController, CustomerController } from './app.controller';
import { dataSourceOptions } from './data-source';
import { validationSchema } from './config/validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema,
    }),
    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      autoLoadEntities: true,
    }),
    CustomerModule,
  ],
  controllers: [AppController, CustomerController],
})
export class AppModule {}
