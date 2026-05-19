import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Customer } from './customer.entity';

export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export enum TransactionStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

@Entity('transactions')
export class Transaction extends BaseEntity {
  @Column({ type: 'uuid' })
  @Index()
  customer_id: string;

  @Column({
    type: 'bigint',
    comment: 'Amount in cents (positive for credit, negative for debit)',
    transformer: { to: (v: number) => v, from: (v: string | number) => Number(v) },
  })
  amount: number;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
  })
  status: TransactionStatus;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  @Index()
  idempotency_key: string | null;

  @Column({ type: 'text', nullable: true })
  failure_reason: string | null;

  @ManyToOne(() => Customer, (customer) => customer.transactions)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;
}
