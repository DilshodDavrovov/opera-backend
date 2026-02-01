import { Module } from '@nestjs/common';
import { PaymentIncomingService } from './payment-incoming.service';
import { PaymentIncomingController } from './payment-incoming.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { OrganizationsModule } from '../../organizations/organizations.module';

@Module({
  imports: [PrismaModule, OrganizationsModule],
  controllers: [PaymentIncomingController],
  providers: [PaymentIncomingService],
  exports: [PaymentIncomingService],
})
export class PaymentIncomingModule {}
