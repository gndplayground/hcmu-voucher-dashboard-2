import {
  VoucherClaimTypeEnum,
  VoucherDiscount,
  VoucherDiscountCreateData,
  VoucherDiscountEditData,
} from "./voucher";
import {
  VoucherQuestion,
  VoucherQuestionCreateData,
  VoucherQuestionEditData,
} from "./voucherQuestion";

export enum CampaignProgressEnum {
  UPCOMING = "upcoming",
  ONGOING = "ongoing",
  FINISHED = "finished",
}

export interface Campaign {
  id: number;
  name: string;
  description?: string | null;
  logo: string | null;
  claimType: VoucherClaimTypeEnum | null;
  claimMode: number | null;
  isDeleted: boolean | null;
  startDate: string;
  endDate: string;
  createdAt: string;
  createdBy: number;
  companyId: number;
  voucherDiscounts: VoucherDiscount[];
  voucherQuestions?: VoucherQuestion[];
}

export interface CampaignCreateData {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  claimType?: VoucherClaimTypeEnum;
  questions: VoucherQuestionCreateData[];
  voucherDiscounts: VoucherDiscountCreateData[];
}

export interface CampaignEditData {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  claimType?: VoucherClaimTypeEnum | null;
  questions: VoucherQuestionEditData[];
  voucherDiscounts: VoucherDiscountEditData[];
}

export type CampaignUpdateData = Partial<
  Omit<Campaign, "id" | "logo" | "createdAt" | "createdBy" | "companyId">
> & {
  startDate?: Date;
  endDate?: Date;
  logo?: File;
  shouldDeletePhoto?: boolean;
};
