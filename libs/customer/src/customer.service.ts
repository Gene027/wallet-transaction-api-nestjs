import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../../../src/entities/customer.entity';
import { CreateCustomerDto, GetCustomerResponseDto } from './dto/customer.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async findById(id: string, merchantId: string): Promise<GetCustomerResponseDto> {
    const customer = await this.customerRepository.findOne({
      where: { id, merchant_id: merchantId },
      select: {
        id: true,
        name: true,
        email: true,
        wallet_balance: true,
      },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  async create(dto: CreateCustomerDto, merchantId: string): Promise<Customer> {
    const existing = await this.customerRepository.findOne({
      where: { email: dto.email, merchant_id: merchantId },
    });
    if (existing) {
      throw new ConflictException(`Customer with email ${dto.email} already exists`);
    }

    const customer = this.customerRepository.create({
      name: dto.name,
      email: dto.email,
      merchant_id: merchantId,
    });

    return await this.customerRepository.save(customer);
  }
}
