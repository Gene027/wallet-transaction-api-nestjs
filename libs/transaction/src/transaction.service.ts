import { createHash } from 'crypto';
import { ConflictException, Injectable, Logger, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  Transaction,
  TransactionType,
  TransactionStatus,
} from '../../../src/entities/transaction.entity';
import { Customer } from '../../../src/entities/customer.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { GetTransactionHistoryResponseDto, TransactionQueryDto } from './dto/transaction-query.dto';
import { PaginatedResult } from '../../../src/common/response/paginated-result';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  private get duplicateWindowMs(): number {
    return this.configService.get<number>('DUPLICATE_WINDOW_SECS', 15) * 1000;
  }

  private buildAutoKey(customerId: string, amount: number): string {
    const bucket = Math.floor(Date.now() / this.duplicateWindowMs);
    const digest = createHash('sha256')
      .update(`${customerId}:${amount}:${bucket}`)
      .digest('hex')
      .slice(0, 32);
    return `auto_${digest}`;
  }

  async createTransaction(
    dto: CreateTransactionDto,
    merchantId: string,
  ): Promise<Transaction> {
    const type = Number(dto.amount) > 0 ? TransactionType.CREDIT : TransactionType.DEBIT;
    const idempotencyKey = dto.idempotency_key ?? this.buildAutoKey(dto.customer_id, dto.amount);

    const existing = await this.findByIdempotencyKey(idempotencyKey);

    if (existing) {
      if (dto.idempotency_key) {
        this.logger.log(`Replaying idempotent transaction.`, { idempotencyKey });
        return existing;
      }

      if (existing.status === TransactionStatus.SUCCESS) {
        const elapsedMs = Date.now() - new Date(existing.created_at).getTime();
        const retryAfterSec = Math.max(
          1,
          Math.ceil((this.duplicateWindowMs - elapsedMs) / 1000),
        );
        
        this.logger.warn(`Duplicate transaction detected. Retry after ${retryAfterSec}s.`, {
          idempotencyKey,
          existing,
        });

        throw new ConflictException(
          `Duplicate transaction detected. Retry after ${retryAfterSec}s.`,
        );
      }
    }

    return this.applyWalletDelta(dto, merchantId, idempotencyKey, type);
  }

  private async applyWalletDelta(
    dto: CreateTransactionDto,
    merchantId: string,
    idempotencyKey: string,
    type: TransactionType,
  ): Promise<Transaction> {
    return this.dataSource.transaction(async (manager) => {
      // Pessimistic write lock prevents concurrent balance races
      const customer = await manager.findOne(Customer, {
        where: { id: dto.customer_id, merchant_id: merchantId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!customer) {
        throw new NotFoundException('Customer not found');
      }

      const balance = Number(customer.wallet_balance);

      if (balance + Number(dto.amount) < 0) {
        await manager.save(
          Transaction,
          manager.create(Transaction, {
            customer_id: dto.customer_id,
            amount: dto.amount,
            type: TransactionType.DEBIT,
            status: TransactionStatus.FAILED,
            failure_reason: 'Insufficient balance',
            idempotency_key: idempotencyKey,
          }),
        );
        throw new UnprocessableEntityException('Insufficient balance');
      }

      customer.wallet_balance = balance + dto.amount;
      await manager.save(Customer, customer);

      return manager.save(
        Transaction,
        manager.create(Transaction, {
          customer_id: dto.customer_id,
          amount: dto.amount,
          type,
          status: TransactionStatus.SUCCESS,
          idempotency_key: idempotencyKey,
        }),
      );
    });
  }

  async getTransactionHistory(
    customerId: string,
    query: TransactionQueryDto,
  ): Promise<PaginatedResult<GetTransactionHistoryResponseDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.transactionRepository
      .createQueryBuilder('t')
      .select([
        't.id',
        't.amount',
        't.type',
        't.status',
        't.failure_reason',
        't.idempotency_key',
        't.created_at',
        't.customer_id',
      ])
      .where('t.customer_id = :customerId', { customerId })
      .orderBy('t.created_at', 'DESC')
      .offset((page - 1) * limit)
      .limit(limit);

    if (query.status) {
      qb.andWhere('t.status = :status', { status: query.status });
    }

    if (query.type) {
      qb.andWhere('t.type = :type', { type: query.type });
    }

    if (query.date_from) {
      qb.andWhere('t.created_at >= :date_from', { date_from: new Date(query.date_from) });
    }

    if (query.date_to) {
      qb.andWhere('t.created_at <= :date_to', { date_to: new Date(query.date_to) });
    }

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      meta: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async findByIdempotencyKey(key: string): Promise<Transaction | null> {
    return this.transactionRepository.findOne({
      where: { idempotency_key: key },
    });
  }
}
