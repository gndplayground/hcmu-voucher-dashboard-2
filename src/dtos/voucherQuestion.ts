import {
  VoucherQuestion,
  VoucherQuestionChoice,
  VoucherQuestionTypeEnum,
} from "@types";

import { RequiredIfValueValidator } from "@utils/classValidators";
import { MaxLength, Validate } from "class-validator";

export class VoucherQuestionChoiceDto implements VoucherQuestionChoice {
  id: number;

  questionId: number;

  choice: string;

  isCorrect: boolean | null;

  isDeleted: boolean | null;

  createdAt: Date;
}

export class VoucherQuestionChoiceCreateDto
  implements Partial<VoucherQuestionChoice>
{
  @MaxLength(255)
  choice: string;

  isCorrect: boolean | null;
}

export class VoucherQuestionChoiceUpdateDto
  implements Partial<VoucherQuestionChoiceCreateDto>
{
  @MaxLength(255)
  choice: string;

  isCorrect: boolean | null;

  isDeleted: boolean | null;
}

export class VoucherQuestionDto implements VoucherQuestion {
  id: number;

  question: string;

  type: VoucherQuestionTypeEnum;

  createdAt: Date;

  campaignId: number | null;

  discountId: number | null;

  isDeleted: boolean | null;

  voucherQuestionChoices?: VoucherQuestionChoiceCreateDto[];
}

export class VoucherQuestionCreateDto implements Partial<VoucherQuestionDto> {
  question: string;

  type: VoucherQuestionTypeEnum;

  @Validate(RequiredIfValueValidator, [
    "type",
    VoucherQuestionTypeEnum.MULTIPLE_CHOICE,
  ])
  @Validate(RequiredIfValueValidator, [
    "type",
    VoucherQuestionTypeEnum.SINGLE_CHOICE,
  ])
  choices?: VoucherQuestionChoiceCreateDto[];
}

export class VoucherQuestionUpdateDto implements Partial<VoucherQuestionDto> {
  @MaxLength(255)
  question?: string;

  type?: VoucherQuestionTypeEnum;

  isDeleted?: boolean;
}
