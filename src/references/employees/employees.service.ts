import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrganizationsService } from '../../organizations/organizations.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeResponseDto } from './dto/employee-response.dto';

@Injectable()
export class EmployeesService {
  constructor(
    private prisma: PrismaService,
    private organizationsService: OrganizationsService,
  ) {}

  async create(
    userId: string,
    organizationId: string,
    createDto: CreateEmployeeDto,
  ): Promise<EmployeeResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const employee = await this.prisma.employee.create({
      data: {
        organizationId,
        firstName: createDto.firstName,
        lastName: createDto.lastName,
        middleName: createDto.middleName,
        position: createDto.position,
        phone: createDto.phone,
        email: createDto.email,
        isActive: createDto.isActive ?? true,
      },
    });

    return employee as EmployeeResponseDto;
  }

  async findAll(
    userId: string,
    organizationId: string,
    includeInactive = false,
  ): Promise<EmployeeResponseDto[]> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const where: any = { organizationId };
    if (!includeInactive) {
      where.isActive = true;
    }

    const employees = await this.prisma.employee.findMany({
      where,
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });

    return employees as EmployeeResponseDto[];
  }

  async findOne(
    userId: string,
    organizationId: string,
    employeeId: string,
  ): Promise<EmployeeResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const employee = await this.prisma.employee.findFirst({
      where: {
        id: employeeId,
        organizationId,
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee as EmployeeResponseDto;
  }

  async update(
    userId: string,
    organizationId: string,
    employeeId: string,
    updateDto: UpdateEmployeeDto,
  ): Promise<EmployeeResponseDto> {
    await this.organizationsService.checkAccess(userId, organizationId);

    await this.findOne(userId, organizationId, employeeId);

    const updated = await this.prisma.employee.update({
      where: { id: employeeId },
      data: updateDto,
    });

    return updated as EmployeeResponseDto;
  }

  async remove(
    userId: string,
    organizationId: string,
    employeeId: string,
  ): Promise<void> {
    await this.organizationsService.checkAccess(userId, organizationId);

    const employee = await this.findOne(userId, organizationId, employeeId);

    // Проверяем, используется ли сотрудник в документах
    const [
      receiptCount,
      saleCount,
      transferCount,
      writeOffCount,
      productionCount,
      receiptOrderCount,
      expenseOrderCount,
    ] = await Promise.all([
      this.prisma.goodsReceipt.count({ where: { employeeId } }),
      this.prisma.goodsSale.count({ where: { employeeId } }),
      this.prisma.goodsTransfer.count({ where: { employeeId } }),
      this.prisma.goodsWriteOff.count({ where: { employeeId } }),
      this.prisma.goodsProduction.count({ where: { employeeId } }),
      this.prisma.cashReceiptOrder.count({ where: { employeeId } }),
      this.prisma.cashExpenseOrder.count({ where: { employeeId } }),
    ]);

    if (
      receiptCount > 0 ||
      saleCount > 0 ||
      transferCount > 0 ||
      writeOffCount > 0 ||
      productionCount > 0 ||
      receiptOrderCount > 0 ||
      expenseOrderCount > 0
    ) {
      throw new BadRequestException(
        'Cannot delete employee: they are used in documents',
      );
    }

    await this.prisma.employee.delete({
      where: { id: employeeId },
    });
  }
}
