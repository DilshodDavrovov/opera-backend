import { Module } from '@nestjs/common';
import { GoodsWriteOffService } from './goods-write-off.service';
import { GoodsWriteOffController } from './goods-write-off.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { OrganizationsModule } from '../../organizations/organizations.module';

@Module({
  imports: [PrismaModule, OrganizationsModule],
  controllers: [GoodsWriteOffController],
  providers: [GoodsWriteOffService],
  exports: [GoodsWriteOffService],
})
export class GoodsWriteOffModule {}
