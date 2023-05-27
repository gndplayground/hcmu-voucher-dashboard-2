import {
  VoucherQuestion,
  VoucherQuestionCreateData,
  VoucherQuestionEditData,
} from "./voucherQuestion";

export enum VoucherDiscountTypeEnum {
  PERCENTAGE = "PERCENTAGE",
  AMOUNT = "AMOUNT",
}

export enum VoucherClaimTypeEnum {
  FASTEST = "FASTEST",
  QUESTIONS = "QUESTIONS",
}

export enum VoucherCodeTypeEnum {
  CLAIM = "CLAIM",
  MANUAL = "MANUAL",
}

export interface VoucherTicket {
  id: number;
  discountId: number;
  code: string | null;
  isUsed: boolean;
  claimBy: number;
  claimAt: Date;
}

export interface VoucherDiscount {
  id: number;
  campaignId: number;
  description?: string;
  type: VoucherDiscountTypeEnum;
  claimType?: VoucherClaimTypeEnum;
  claimMode?: number;
  code?: string;
  codeType: VoucherCodeTypeEnum;
  discount: number;
  total: number;
  createdAt: Date;
  voucherQuestions?: VoucherQuestion[];
}

export interface VoucherDiscountCreateData {
  description: string;
  type: VoucherDiscountTypeEnum;
  claimType?: VoucherClaimTypeEnum;
  claimMode?: number;
  code?: string;
  codeType: VoucherCodeTypeEnum;
  discount: number;
  total: number;
  questions?: VoucherQuestionCreateData[];
}

export interface VoucherDiscountEditData {
  id?: number;
  description?: string | null;
  type?: VoucherDiscountTypeEnum;
  claimType?: VoucherClaimTypeEnum | null;
  claimMode?: number;
  code?: string;
  codeType?: VoucherCodeTypeEnum;
  discount?: number;
  total?: number;
  questions?: VoucherQuestionEditData[];
  isDeleted?: boolean;
}
