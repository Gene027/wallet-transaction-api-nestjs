import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GenericStatus } from './common/response/generic-status';

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
