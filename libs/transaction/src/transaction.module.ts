import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from '../../../src/entities/transaction.entity';
import { Customer } from '../../../src/entities/customer.entity';
import { TransactionService } from './transaction.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Customer])],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}
