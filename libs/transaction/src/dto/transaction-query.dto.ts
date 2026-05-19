import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '../../../../src/common/dto/pagination.dto';
import { TransactionStatus, TransactionType } from '../../../../src/entities/transaction.entity';

export class TransactionQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: TransactionStatus, description: 'Filter by transaction status' })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @ApiPropertyOptional({ enum: TransactionType, description: 'Filter by transaction type' })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiPropertyOptional({
    example: '2026-01-01T00:00:00.000Z',
    description: 'Return transactions created on or after this ISO 8601 datetime',
  })
  @IsOptional()
  @IsDateString()
  date_from?: string;

  @ApiPropertyOptional({
    example: '2027-12-31T23:59:59.999Z',
    description: 'Return transactions created on or before this ISO 8601 datetime',
  })
  @IsOptional()
  @IsDateString()
  date_to?: string;
}

export class GetTransactionHistoryResponseDto {
  @ApiProperty({ description: 'The id of the transaction' })
  id: string;

  @ApiProperty({ description: 'The transaction amount in cents' })
  amount: number;

  @ApiProperty({ description: 'The type of the transaction' })
  type: TransactionType;

  @ApiProperty({ description: 'The status of the transaction' })
  status: TransactionStatus;

  @ApiProperty({ description: 'The failure reason of the transaction' })
  failure_reason: string | null;

  @ApiProperty({ description: 'The idempotency key of the transaction' })
  idempotency_key: string | null;

  @ApiProperty({ description: 'The created at timestamp of the transaction' })
  created_at: Date;

  @ApiProperty({ description: 'The customer id of the transaction' })
  customer_id: string;
}