import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      message =
        typeof body === 'string'
          ? body
          : ((body as Record<string, unknown>).message as string | string[]) ??
            exception.message;
    } else if (isDbError(exception)) {
      ({ status, message } = mapDbError(exception.code));
    }

    this.logger.error(`[${request.method} ${request.url}] ${status}`, {
      exception: exception instanceof Error ? exception.stack : exception,
    });

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

function isDbError(e: unknown): e is { code: string } {
  return typeof e === 'object' && e !== null && 'code' in e;
}

function mapDbError(code: string): { status: number; message: string } {
  switch (code) {
    case '23505':
      return { status: HttpStatus.CONFLICT, message: 'Duplicate data detected' };
    case '23503':
      return { status: HttpStatus.BAD_REQUEST, message: 'Referenced data not found' };
    case '23502':
      return { status: HttpStatus.BAD_REQUEST, message: 'Required field missing' };
    default:
      return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Internal server error' };
  }
}
