import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  Transaction,
  TransactionType,
  TransactionStatus,
} from '../../../src/entities/transaction.entity';
import { Customer } from '../../../src/entities/customer.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly dataSource: DataSource,
  ) {}

  async creditWallet(
    customerId: string,
    amount: number,
    idempotencyKey?: string,
  ): Promise<Transaction> {
    if (idempotencyKey) {
      const existing = await this.findByIdempotencyKey(idempotencyKey);
      if (existing) return existing;
    }

    // Always use a transaction to ensure data consistency and rollback in case of error
    return this.dataSource.transaction(async (manager) => {
      const customer = await manager.findOne(Customer, {
        where: { id: customerId },
      });

      if (!customer) {
        throw new BadRequestException('Customer not found');
      }

      customer.wallet_balance += amount;
      await manager.save(Customer, customer);

      const transaction = manager.create(Transaction, {
        customer_id: customerId,
        amount,
        type: TransactionType.CREDIT,
        status: TransactionStatus.SUCCESS,
        idempotency_key: idempotencyKey || null,
      });

      return await manager.save(Transaction, transaction);
    });
  }

  async debitWallet(
    customerId: string,
    amount: number,
    idempotencyKey?: string,
  ): Promise<Transaction> {
    if (idempotencyKey) {
      const existing = await this.findByIdempotencyKey(idempotencyKey);
      if (existing) return existing;
    }

    // Always use a transaction to ensure data consistency and rollback in case of error
    return this.dataSource.transaction(async (manager) => {
      const customer = await manager.findOne(Customer, {
        where: { id: customerId },
      });

      if (!customer) {
        throw new BadRequestException('Customer not found');
      }

      if (customer.wallet_balance < amount) {
        const failedTransaction = manager.create(Transaction, {
          customer_id: customerId,
          amount: -amount,
          type: TransactionType.DEBIT,
          status: TransactionStatus.FAILED,
          failure_reason: 'Insufficient balance',
          idempotency_key: idempotencyKey || null,
        });
        return await manager.save(Transaction, failedTransaction);
      }

      customer.wallet_balance -= amount;
      await manager.save(Customer, customer);

      const transaction = manager.create(Transaction, {
        customer_id: customerId,
        amount: -amount,
        type: TransactionType.DEBIT,
        status: TransactionStatus.SUCCESS,
        idempotency_key: idempotencyKey || null,
      });

      return await manager.save(Transaction, transaction);
    });
  }

  async findByIdempotencyKey(key: string): Promise<Transaction | null> {
    return this.transactionRepository.findOne({
      where: { idempotency_key: key },
    });
  }
}
