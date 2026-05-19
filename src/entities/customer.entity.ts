import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Transaction } from './transaction.entity';

@Entity('customers')
export class Customer extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  email: string;

  @Column({ type: 'bigint', default: 0, comment: 'Wallet balance in cents' })
  wallet_balance: number;

  @Column({ type: 'uuid' })
  @Index()
  merchant_id: string;

  @OneToMany(() => Transaction, (transaction) => transaction.customer)
  transactions: Transaction[];
}
