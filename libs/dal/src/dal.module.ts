import { Module } from '@nestjs/common';
import { DalService } from './dal.service';

@Module({
  providers: [DalService],
  exports: [DalService],
})
export class DalModule {}
