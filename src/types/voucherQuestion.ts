export enum VoucherQuestionTypeEnum {
  FREE = "FREE",
  SINGLE_CHOICE = "SINGLE_CHOICE",
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
}

export interface VoucherQuestionChoice {
  id: number;
  questionId: number;
  choice: string;
  isCorrect?: boolean;
  isDeleted?: boolean;
  createdAt: Date;
  count?: number;
}

export interface VoucherQuestionChoiceCreateData {
  choice: string;
  isCorrect?: boolean;
}

export interface VoucherQuestionChoiceEditData {
  id?: number;
  choice?: string;
  isCorrect?: boolean;
}

export interface VoucherQuestion {
  id: number;
  question: string;
  type: VoucherQuestionTypeEnum;
  createdAt: Date;
  campaignId: number | null;
  discountId: number | null;
  isDeleted: boolean | null;
  voucherQuestionChoices?: VoucherQuestionChoice[];
}

export interface VoucherQuestionCreateData {
  question: string;
  type: VoucherQuestionTypeEnum;
  choices?: VoucherQuestionChoiceCreateData[];
}

export interface VoucherQuestionEditData {
  id?: number;
  question?: string;
  type?: VoucherQuestionTypeEnum;
  choices?: VoucherQuestionChoiceEditData[];
  isDeleted?: boolean | null;
}
