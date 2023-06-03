export interface Company {
  id: number;
  name: string;
  phone?: string;
  address?: string;
  logo?: string;
  website?: string;
  createdAt: string;
  isDisabled?: boolean;
  isDeleted?: boolean;
}

export interface CompanyUpdate
  extends Partial<Omit<Company, "isDeleted" | "isDeleted" | "logo">> {
  logo?: File;
  shouldDeleteLogo?: boolean;
}

export interface Store {
  id: number;
  name: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  address?: string;
  createdAt: Date;
  openAt?: string;
  closeAt?: string;
  companyId?: number;
  isDeleted?: boolean;
}

export interface StoreCreate {
  name: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  address?: string;
  openAt?: string;
  closeAt?: string;
}

export interface StoreUpdate {
  name?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  address?: string;
  openAt?: string;
  closeAt?: string;
  isDeleted?: boolean;
}
