import { Module } from '@nestjs/common';
import { PaymentOutgoingService } from './payment-outgoing.service';
import { PaymentOutgoingController } from './payment-outgoing.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { OrganizationsModule } from '../../organizations/organizations.module';

@Module({
  imports: [PrismaModule, OrganizationsModule],
  controllers: [PaymentOutgoingController],
  providers: [PaymentOutgoingService],
  exports: [PaymentOutgoingService],
})
export class PaymentOutgoingModule {}
