import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrganizationsService } from '../../organizations/organizations.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { BankAccountResponseDto } from './dto/bank-account-response.dto';

@Injectable()
export class BankAccountsService {
  constructor(
    private prisma: PrismaService,
    private organizationsService: OrganizationsService,
  ) {}

  async create(
    userId: string,
    organizationId: string,
    createDto: CreateBankAccountDto,
  ): Promise<BankAccountResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const bankAccount = await this.prisma.bankAccount.create({
      data: {
        organizationId,
        name: createDto.name,
        accountNumber: createDto.accountNumber,
        bankName: createDto.bankName,
        bik: createDto.bik,
        corrAccount: createDto.corrAccount,
        isActive: createDto.isActive ?? true,
      },
    });

    return bankAccount as BankAccountResponseDto;
  }

  async findAll(
    userId: string,
    organizationId: string,
    includeInactive = false,
  ): Promise<BankAccountResponseDto[]> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const where: any = { organizationId };
    if (!includeInactive) {
      where.isActive = true;
    }

    const bankAccounts = await this.prisma.bankAccount.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return bankAccounts as BankAccountResponseDto[];
  }

  async findOne(
    userId: string,
    organizationId: string,
    bankAccountId: string,
  ): Promise<BankAccountResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const bankAccount = await this.prisma.bankAccount.findFirst({
      where: {
        id: bankAccountId,
        organizationId,
      },
    });

    if (!bankAccount) {
      throw new NotFoundException('Bank account not found');
    }

    return bankAccount as BankAccountResponseDto;
  }

  async update(
    userId: string,
    organizationId: string,
    bankAccountId: string,
    updateDto: UpdateBankAccountDto,
  ): Promise<BankAccountResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    await this.findOne(userId, organizationId, bankAccountId);

    const updated = await this.prisma.bankAccount.update({
      where: { id: bankAccountId },
      data: updateDto,
    });

    return updated as BankAccountResponseDto;
  }

  async remove(
    userId: string,
    organizationId: string,
    bankAccountId: string,
  ): Promise<void> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const bankAccount = await this.findOne(userId, organizationId, bankAccountId);

    // Проверяем, используется ли банковский счет в документах
    const [incomingCount, outgoingCount] = await Promise.all([
      this.prisma.paymentIncoming.count({
        where: { bankAccountId },
      }),
      this.prisma.paymentOutgoing.count({
        where: { bankAccountId },
      }),
    ]);

    if (incomingCount > 0 || outgoingCount > 0) {
      throw new BadRequestException(
        'Cannot delete bank account: it is used in documents',
      );
    }

    await this.prisma.bankAccount.delete({
      where: { id: bankAccountId },
    });
  }
}
