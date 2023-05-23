export enum VoucherQuestionTypeEnum {
  FREE = "FREE",
  SINGLE_CHOICE = "SINGLE_CHOICE",
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
}

export interface VoucherQuestionChoice {
  id: number;
  questionId: number;
  choice: string;
  isCorrect: boolean | null;
  isDeleted: boolean | null;
  createdAt: Date;
}

export interface VoucherQuestionChoiceCreateData {
  choice: string;
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
}

export interface VoucherQuestionCreateData {
  question: string;
  type: VoucherQuestionTypeEnum;
  choices?: VoucherQuestionChoiceCreateData[];
}
