import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private organizationsService: OrganizationsService,
  ) {}

  async create(
    userId: string,
    organizationId: string,
    createDto: CreateTransactionDto,
  ): Promise<TransactionResponseDto> {
    // Проверяем доступ к организации
    await this.organizationsService.checkAccess(userId, organizationId);

    // Валидация двойной записи: дебет и кредит не должны совпадать
    if (createDto.debitAccountId === createDto.creditAccountId) {
      throw new BadRequestException(
        'Debit and credit accounts cannot be the same',
      );
    }

    // Проверяем существование счетов и их принадлежность к организации
    const [debitAccount, creditAccount] = await Promise.all([
      this.prisma.account.findFirst({
        where: {
          id: createDto.debitAccountId,
          organizationId,
        },
      }),
      this.prisma.account.findFirst({
        where: {
          id: createDto.creditAccountId,
          organizationId,
        },
      }),
    ]);

    if (!debitAccount) {
      throw new NotFoundException('Debit account not found');
    }

    if (!creditAccount) {
      throw new NotFoundException('Credit account not found');
    }

    // Проверяем, что счета активны
    if (!debitAccount.isActive) {
      throw new BadRequestException('Debit account is not active');
    }

    if (!creditAccount.isActive) {
      throw new BadRequestException('Credit account is not active');
    }

    // Создаем проводку
    const transaction = await this.prisma.transaction.create({
      data: {
        organizationId,
        debitAccountId: createDto.debitAccountId,
        creditAccountId: createDto.creditAccountId,
        amount: createDto.amount,
        description: createDto.description,
        date: createDto.date ? new Date(createDto.date) : new Date(),
      },
    });

    return {
      ...transaction,
      amount: transaction.amount.toNumber(),
      description: transaction.description || undefined,
    };
  }

  async findAll(
    userId: string,
    organizationId: string,
    filters?: {
      accountId?: string;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<TransactionResponseDto[]> {
    // Проверяем доступ к организации
    await this.organizationsService.checkAccess(userId, organizationId);

    const where: any = {
      organizationId,
    };

    if (filters?.accountId) {
      where.OR = [
        { debitAccountId: filters.accountId },
        { creditAccountId: filters.accountId },
      ];
    }

    if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.date.lte = filters.endDate;
      }
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });

    return transactions.map((t) => ({
      ...t,
      amount: t.amount.toNumber(),
      description: t.description || undefined,
    }));
  }

  async findOne(
    userId: string,
    organizationId: string,
    transactionId: string,
  ): Promise<TransactionResponseDto> {
    // Проверяем доступ к организации
    await this.organizationsService.checkAccess(userId, organizationId);

    const transaction = await this.prisma.transaction.findFirst({
      where: {
        id: transactionId,
        organizationId,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return {
      ...transaction,
      amount: transaction.amount.toNumber(),
      description: transaction.description || undefined,
    };
  }

  async update(
    userId: string,
    organizationId: string,
    transactionId: string,
    updateDto: UpdateTransactionDto,
  ): Promise<TransactionResponseDto> {
    // Проверяем доступ к организации
    await this.organizationsService.checkAccess(userId, organizationId);

    // Проверяем существование проводки
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        id: transactionId,
        organizationId,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // Если обновляются счета, проверяем их
    const debitAccountId = updateDto.debitAccountId || transaction.debitAccountId;
    const creditAccountId =
      updateDto.creditAccountId || transaction.creditAccountId;

    // Валидация двойной записи
    if (debitAccountId === creditAccountId) {
      throw new BadRequestException(
        'Debit and credit accounts cannot be the same',
      );
    }

    // Если меняются счета, проверяем их существование и активность
    if (updateDto.debitAccountId || updateDto.creditAccountId) {
      const [debitAccount, creditAccount] = await Promise.all([
        this.prisma.account.findFirst({
          where: {
            id: debitAccountId,
            organizationId,
          },
        }),
        this.prisma.account.findFirst({
          where: {
            id: creditAccountId,
            organizationId,
          },
        }),
      ]);

      if (!debitAccount) {
        throw new NotFoundException('Debit account not found');
      }

      if (!creditAccount) {
        throw new NotFoundException('Credit account not found');
      }

      if (!debitAccount.isActive) {
        throw new BadRequestException('Debit account is not active');
      }

      if (!creditAccount.isActive) {
        throw new BadRequestException('Credit account is not active');
      }
    }

    const updated = await this.prisma.transaction.update({
      where: { id: transactionId },
      data: {
        ...updateDto,
        date: updateDto.date ? new Date(updateDto.date) : undefined,
      },
    });

    return {
      ...updated,
      amount: updated.amount.toNumber(),
      description: updated.description || undefined,
    };
  }

  async remove(
    userId: string,
    organizationId: string,
    transactionId: string,
  ): Promise<void> {
    // Проверяем доступ к организации
    await this.organizationsService.checkAccess(userId, organizationId);

    // Проверяем существование проводки
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        id: transactionId,
        organizationId,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    await this.prisma.transaction.delete({
      where: { id: transactionId },
    });
  }
}
