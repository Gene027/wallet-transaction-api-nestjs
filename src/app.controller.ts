import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { CustomerService } from '@app/customer';
import { CreateCustomerDto } from '@app/customer';
import { ApiKeyGuard } from './common/guards/api-key.guard';
import { MerchantId } from './common/decorators/merchant-id.decorator';
import { GenericStatus } from './common/response/generic-status';
import { Customer } from './entities';

@ApiTags('Health')
@Controller('healthz')
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  getHealth(): GenericStatus<{ status: string }> {
    return new GenericStatus({ description: 'Service is healthy', data: { status: 'ok' } });
  }
}

@ApiTags('Customers')
@ApiSecurity('ApiKey')
@UseGuards(ApiKeyGuard)
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

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
}
