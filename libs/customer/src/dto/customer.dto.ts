import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Praise Blupay' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'praise@example.com' })
  @IsEmail()
  @MaxLength(255)
  email: string;
}

export class GetCustomerResponseDto {
  @ApiProperty({ description: 'The id of the customer' })
  id: string;

  @ApiProperty({ description: 'The name of the customer' })
  name: string;

  @ApiProperty({ description: 'The email of the customer' })
  email: string;

  @ApiProperty({ description: 'The wallet balance of the customer in cents' })
  wallet_balance: number;

  @ApiProperty({ description: 'The created at timestamp of the customer' })
  created_at: Date;
}
