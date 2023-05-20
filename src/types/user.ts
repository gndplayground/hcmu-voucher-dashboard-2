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
