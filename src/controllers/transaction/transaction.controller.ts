import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { CreateTransactionDto, TransactionService } from '@app/transaction';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { MerchantId } from '../../common/decorators/merchant-id.decorator';
import { GenericStatus } from '../../common/response/generic-status';
import { Transaction } from '../../entities';

@ApiTags('Transactions')
@ApiSecurity('ApiKey')
@UseGuards(ApiKeyGuard)
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a credit or debit transaction for a customer' })
  @ApiResponse({ status: 201, description: 'Transaction created (check status field for outcome)' })
  @ApiResponse({ status: 401, description: 'Invalid or missing API key' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiResponse({ status: 409, description: 'Duplicate transaction within the active window — retry after the indicated seconds' })
  async createTransaction(
    @Body() dto: CreateTransactionDto,
    @MerchantId() merchantId: string,
  ): Promise<GenericStatus<Transaction>> {
    const transaction = await this.transactionService.createTransaction(dto, merchantId);
    return new GenericStatus({
      statusCode: HttpStatus.CREATED,
      description: 'Transaction created successfully',
      data: transaction,
    });
  }
}
