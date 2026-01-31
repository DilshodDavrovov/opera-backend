import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AccountResponseDto } from './dto/account-response.dto';
import { AccountType } from '../common/types/account-type.type';

@Injectable()
export class AccountsService {
  constructor(
    private prisma: PrismaService,
    private organizationsService: OrganizationsService,
  ) {}

  async create(
    userId: string,
    organizationId: string,
    createDto: CreateAccountDto,
  ): Promise<AccountResponseDto> {
    // Проверяем доступ к организации
    await this.organizationsService.checkAccess(userId, organizationId);

    // Проверяем уникальность кода в организации
    const existing = await this.prisma.account.findUnique({
      where: {
        organizationId_code: {
          organizationId,
          code: createDto.code,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        'Account with this code already exists in this organization',
      );
    }

    // Если указан родительский счет, проверяем его существование
    if (createDto.parentId) {
      const parent = await this.prisma.account.findUnique({
        where: { id: createDto.parentId },
      });

      if (!parent) {
        throw new NotFoundException('Parent account not found');
      }

      if (parent.organizationId !== organizationId) {
        throw new BadRequestException(
          'Parent account belongs to different organization',
        );
      }
    }

    const account = await this.prisma.account.create({
      data: {
        code: createDto.code,
        name: createDto.name,
        type: createDto.type as AccountType,
        organizationId,
        parentId: createDto.parentId,
        isActive: createDto.isActive ?? true,
      },
    });

    return account as AccountResponseDto;
  }

  async findAll(
    userId: string,
    organizationId: string,
    includeInactive = false,
  ): Promise<AccountResponseDto[]> {
    // Проверяем доступ к организации
    await this.organizationsService.checkAccess(userId, organizationId);

    const accounts = await this.prisma.account.findMany({
      where: {
        organizationId,
        ...(includeInactive ? {} : { isActive: true }),
      },
      orderBy: [{ code: 'asc' }],
    });

    return accounts as AccountResponseDto[];
  }

  async findOne(
    userId: string,
    organizationId: string,
    accountId: string,
  ): Promise<AccountResponseDto> {
    // Проверяем доступ к организации
    await this.organizationsService.checkAccess(userId, organizationId);

    const account = await this.prisma.account.findFirst({
      where: {
        id: accountId,
        organizationId,
      },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account as AccountResponseDto;
  }

  async update(
    userId: string,
    organizationId: string,
    accountId: string,
    updateDto: UpdateAccountDto,
  ): Promise<AccountResponseDto> {
    // Проверяем доступ к организации
    await this.organizationsService.checkAccess(userId, organizationId);

    // Проверяем существование счета
    const account = await this.prisma.account.findFirst({
      where: {
        id: accountId,
        organizationId,
      },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    // Если меняется код, проверяем уникальность
    if (updateDto.code && updateDto.code !== account.code) {
      const existing = await this.prisma.account.findUnique({
        where: {
          organizationId_code: {
            organizationId,
            code: updateDto.code,
          },
        },
      });

      if (existing) {
        throw new ConflictException(
          'Account with this code already exists in this organization',
        );
      }
    }

    // Если меняется родительский счет, проверяем его
    if (updateDto.parentId !== undefined) {
      if (updateDto.parentId === accountId) {
        throw new BadRequestException('Account cannot be its own parent');
      }

      if (updateDto.parentId) {
        const parent = await this.prisma.account.findUnique({
          where: { id: updateDto.parentId },
        });

        if (!parent) {
          throw new NotFoundException('Parent account not found');
        }

        if (parent.organizationId !== organizationId) {
          throw new BadRequestException(
            'Parent account belongs to different organization',
          );
        }
      }
    }

    // Если меняется тип счета, проверяем что нет связанных проводок
    // (в реальной системе можно добавить более строгую проверку)
    if (updateDto.type && updateDto.type !== account.type) {
      const transactionsCount = await this.prisma.transaction.count({
        where: {
          organizationId,
          OR: [
            { debitAccountId: accountId },
            { creditAccountId: accountId },
          ],
        },
      });

      if (transactionsCount > 0) {
        throw new BadRequestException(
          'Cannot change account type: account has associated transactions. Consider creating a new account instead.',
        );
      }
    }

    const updated = await this.prisma.account.update({
      where: { id: accountId },
      data: updateDto,
    });

    return updated as AccountResponseDto;
  }

  async remove(
    userId: string,
    organizationId: string,
    accountId: string,
  ): Promise<void> {
    // Проверяем доступ к организации
    await this.organizationsService.checkAccess(userId, organizationId);

    // Проверяем существование счета
    const account = await this.prisma.account.findFirst({
      where: {
        id: accountId,
        organizationId,
      },
      include: {
        children: true,
        debitTransactions: true,
        creditTransactions: true,
      },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    // Нельзя удалить счет с дочерними счетами
    if (account.children.length > 0) {
      throw new BadRequestException(
        'Cannot delete account with child accounts',
      );
    }

    // Нельзя удалить счет с проводками
    if (
      account.debitTransactions.length > 0 ||
      account.creditTransactions.length > 0
    ) {
      throw new BadRequestException(
        'Cannot delete account with transactions',
      );
    }

    await this.prisma.account.delete({
      where: { id: accountId },
    });
  }
}
