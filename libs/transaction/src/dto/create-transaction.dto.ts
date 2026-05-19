import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, MaxLength, NotEquals } from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'Customer UUID' })
  @IsUUID()
  customer_id: string;

  @ApiProperty({
    example: -5000,
    description: 'Amount in cents. Positive = credit, negative = debit. Must be non-zero.',
  })
  @IsInt()
  @NotEquals(0)
  amount: number;

  @ApiPropertyOptional({
    example: 'transaction_id_12345',
    description:
      'Unique key or ID for the transaction to prevent duplicate transactions. ' +
      'If omitted, one is auto-generated per customer + amount + 15 s window.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  idempotency_key?: string;
}
