import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerModule } from '@app/customer';
import { TransactionModule } from '@app/transaction';
import { AppController } from './app.controller';
import { CustomerController } from './controllers/customer/customer.controller';
import { TransactionController } from './controllers/transaction/transaction.controller';
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
    TransactionModule,
  ],
  controllers: [AppController, CustomerController, TransactionController],
})
export class AppModule {}
