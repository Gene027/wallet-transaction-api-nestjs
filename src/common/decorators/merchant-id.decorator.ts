import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const MerchantId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request & { merchantId: string }>();
    return request.merchantId;
  },
);
