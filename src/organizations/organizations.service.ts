import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { AddUserToOrganizationDto } from './dto/add-user-to-organization.dto';
import { OrganizationResponseDto } from './dto/organization-response.dto';
import { Role, RoleType } from '../common/types/role.type';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    createDto: CreateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    // Создаем организацию
    const organization = await this.prisma.organization.create({
      data: {
        name: createDto.name,
      },
    });

    // Автоматически добавляем создателя как OWNER
    await this.prisma.userOrganization.create({
      data: {
        userId,
        organizationId: organization.id,
        role: Role.OWNER as RoleType,
      },
    });

    return organization;
  }

  async findAll(userId: string): Promise<OrganizationResponseDto[]> {
    // Получаем все организации пользователя
    const userOrganizations = await this.prisma.userOrganization.findMany({
      where: { userId },
      include: {
        organization: true,
      },
    });

    return userOrganizations.map((uo) => uo.organization);
  }

  async findOne(
    userId: string,
    organizationId: string,
  ): Promise<OrganizationResponseDto> {
    // Проверяем доступ
    await this.checkAccess(userId, organizationId);

    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async update(
    userId: string,
    organizationId: string,
    updateDto: UpdateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    // Проверяем доступ (только OWNER может изменять)
    await this.checkAccess(userId, organizationId, [Role.OWNER as RoleType]);

    const organization = await this.prisma.organization.update({
      where: { id: organizationId },
      data: updateDto,
    });

    return organization;
  }

  async remove(userId: string, organizationId: string): Promise<void> {
    // Только OWNER может удалять
    await this.checkAccess(userId, organizationId, [Role.OWNER as RoleType]);

    await this.prisma.organization.delete({
      where: { id: organizationId },
    });
  }

  async addUser(
    userId: string,
    organizationId: string,
    addUserDto: AddUserToOrganizationDto,
  ): Promise<void> {
    // Проверяем, что текущий пользователь имеет право добавлять пользователей
    await this.checkAccess(userId, organizationId, [
      Role.OWNER as RoleType,
      Role.ACCOUNTANT as RoleType,
    ]);

    // Находим пользователя по email
    const user = await this.prisma.user.findUnique({
      where: { email: addUserDto.email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Проверяем, не добавлен ли уже пользователь
    const existing = await this.prisma.userOrganization.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('User is already added to this organization');
    }

    // Добавляем пользователя
    await this.prisma.userOrganization.create({
      data: {
        userId: user.id,
        organizationId,
        role: addUserDto.role,
      },
    });
  }

  async getUsers(
    userId: string,
    organizationId: string,
  ): Promise<any[]> {
    // Проверяем доступ
    await this.checkAccess(userId, organizationId);

    const userOrganizations = await this.prisma.userOrganization.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return userOrganizations;
  }

  async removeUser(
    userId: string,
    organizationId: string,
    targetUserId: string,
  ): Promise<void> {
    // Проверяем доступ
    await this.checkAccess(userId, organizationId, [Role.OWNER as RoleType]);

    // Нельзя удалить самого себя
    if (userId === targetUserId) {
      throw new ForbiddenException('Cannot remove yourself from organization');
    }

    await this.prisma.userOrganization.delete({
      where: {
        userId_organizationId: {
          userId: targetUserId,
          organizationId,
        },
      },
    });
  }

  async getUserRole(
    userId: string,
    organizationId: string,
  ): Promise<RoleType | null> {
    const userOrganization = await this.prisma.userOrganization.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });

    return userOrganization?.role || null;
  }

  async checkAccess(
    userId: string,
    organizationId: string,
    allowedRoles?: RoleType[],
  ): Promise<void> {
    const userOrganization = await this.prisma.userOrganization.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });

    if (!userOrganization) {
      throw new ForbiddenException('No access to this organization');
    }

    if (allowedRoles && !allowedRoles.includes(userOrganization.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }
  }
}
