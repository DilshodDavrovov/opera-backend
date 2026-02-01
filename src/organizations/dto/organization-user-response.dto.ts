export interface OrganizationUserResponseDto {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  createdAt: Date;
}
