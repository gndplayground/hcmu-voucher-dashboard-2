export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
  COMPANY = "COMPANY",
}

export interface User {
  id: number;
  email: string;
  role: Role;
  createdAt: string;
  isLocked: boolean;
  isDisabled: boolean;
}

export interface UserProfile {
  id: number;
  name: string | null;
  phone: string | null;
  companyId: number | null;
  userId: number;
  createdAt: string;
}
