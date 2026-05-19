import { ApiProperty } from '@nestjs/swagger';

export class GenericStatus<T> {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Operation successful' })
  description: string;

  @ApiProperty({ nullable: true })
  data?: T;

  constructor({
    statusCode,
    description,
    data,
  }: {
    statusCode?: number;
    description: string;
    data?: T;
  }) {
    this.statusCode = statusCode ?? 200;
    this.description = description;
    this.data = data;
  }
}
