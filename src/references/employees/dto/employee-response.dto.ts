export class EmployeeResponseDto {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  position: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
