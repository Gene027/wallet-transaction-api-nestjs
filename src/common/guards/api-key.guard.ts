import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { decryptApiKey } from '../crypto/api-key';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey || typeof apiKey !== 'string') {
      throw new UnauthorizedException('Missing x-api-key header');
    }

    const secret = this.configService.getOrThrow<string>('API_KEY_SECRET');

    try {
      const merchantId = decryptApiKey(apiKey, secret);
      (request as Request & { merchantId: string }).merchantId = merchantId;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid API key');
    }
  }
}
