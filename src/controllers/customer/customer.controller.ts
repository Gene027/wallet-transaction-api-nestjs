import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { CustomerService, CreateCustomerDto, GetCustomerResponseDto } from '@app/customer';
import { TransactionService, TransactionQueryDto, GetTransactionHistoryResponseDto } from '@app/transaction';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { MerchantId } from '../../common/decorators/merchant-id.decorator';
import { GenericStatus } from '../../common/response/generic-status';
import { PaginatedResult } from '../../common/response/paginated-result';
import { Customer } from '../../entities';

@ApiTags('Customers')
@ApiSecurity('ApiKey')
@UseGuards(ApiKeyGuard)
@Controller('customers')
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly transactionService: TransactionService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a customer for the authenticated merchant' })
  @ApiResponse({ status: 201, description: 'Customer created' })
  @ApiResponse({ status: 401, description: 'Invalid or missing API key' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  async createCustomer(
    @Body() dto: CreateCustomerDto,
    @MerchantId() merchantId: string,
  ): Promise<GenericStatus<Customer>> {
    const customer = await this.customerService.create(dto, merchantId);
    return new GenericStatus({
      statusCode: HttpStatus.CREATED,
      description: 'Customer created successfully',
      data: customer,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer details and wallet balance' })
  @ApiParam({ name: 'id', description: 'Customer UUID' })
  @ApiResponse({ status: 200, description: 'Customer retrieved' })
  @ApiResponse({ status: 401, description: 'Invalid or missing API key' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async getCustomer(
    @Param('id', ParseUUIDPipe) id: string,
    @MerchantId() merchantId: string,
  ): Promise<GenericStatus<GetCustomerResponseDto>> {
    const customer = await this.customerService.findById(id, merchantId);
    return new GenericStatus({
      description: 'Customer retrieved successfully',
      data: customer,
    });
  }

  @Get(':id/transactions')
  @ApiOperation({ summary: 'Get paginated transaction history for a customer' })
  @ApiParam({ name: 'id', description: 'Customer UUID' })
  @ApiResponse({ status: 200, description: 'Transaction history retrieved' })
  @ApiResponse({ status: 401, description: 'Invalid or missing API key' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async getTransactionHistory(
    @Param('id', ParseUUIDPipe) id: string,
    @MerchantId() merchantId: string,
    @Query() query: TransactionQueryDto,
  ): Promise<GenericStatus<PaginatedResult<GetTransactionHistoryResponseDto>>> {
    // check if the customer exists before getting the transaction history to avoid unnecessary database queries and ensure empty rows are returned only if the customer actually does not have any transactions
    await this.customerService.findById(id, merchantId);

    const result = await this.transactionService.getTransactionHistory(id, query);
    return new GenericStatus({
      description: 'Transaction history retrieved successfully',
      data: result,
    });
  }
}
