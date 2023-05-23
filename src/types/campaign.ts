import { VoucherClaimTypeEnum, VoucherDiscountCreateData } from "./voucher";
import { VoucherQuestion, VoucherQuestionCreateData } from "./voucherQuestion";

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

export type CampaignUpdateData = Partial<
  Omit<Campaign, "id" | "logo" | "createdAt" | "createdBy" | "companyId">
> & {
  startDate?: Date;
  endDate?: Date;
  logo?: File;
  shouldDeletePhoto?: boolean;
};
