import { Entity, Column, OneToMany, Index, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Transaction } from './transaction.entity';

@Entity('customers')
@Unique(['email', 'merchant_id'])
export class Customer extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({
    type: 'bigint',
    default: 0,
    comment: 'Wallet balance in cents',
    transformer: { to: (v: number) => v, from: (v: string | number) => Number(v) },
  })
  wallet_balance: number;

  @Column({ type: 'uuid' })
  @Index()
  merchant_id: string;

  @OneToMany(() => Transaction, (transaction) => transaction.customer)
  transactions: Transaction[];
}
