import {
  VoucherClaimTypeEnum,
  VoucherCodeTypeEnum,
  VoucherDiscountTypeEnum,
} from "@types";
import { TransformNumber } from "@utils/classTransformers";
import { RequiredIfValueValidator } from "@utils/classValidators";
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  MaxLength,
  Validate,
  ValidateNested,
} from "class-validator";
import { VoucherQuestionCreateDto } from "./voucherQuestion";

export class VoucherDiscountDto {
  id: number;

  campaignId: number;

  description: string | null;

  type: VoucherDiscountTypeEnum;

  @IsOptional()
  claimType: VoucherClaimTypeEnum | null;

  claimMode: number | null;

  code: string | null;

  @IsOptional()
  codeType: VoucherCodeTypeEnum;

  discount: number;

  total: number;

  createdAt: Date;

  @ValidateNested()
  @Validate(RequiredIfValueValidator, [
    "claimType",
    VoucherClaimTypeEnum.QUESTIONS,
  ])
  questions?: VoucherQuestionCreateDto[];
}

export class VoucherDiscountCreateWithCampaignDto {
  // @IsOptional()
  // @MaxLength(255)
  // description?: string | null;

  @IsNotEmpty()
  @MaxLength(255)
  description: string | null;

  @IsNotEmpty()
  @IsIn(Object.values(VoucherDiscountTypeEnum))
  type: VoucherDiscountTypeEnum;

  @IsOptional()
  @IsIn(Object.values(VoucherClaimTypeEnum))
  claimType?: VoucherClaimTypeEnum | null;

  @TransformNumber()
  @IsOptional()
  @IsNumber()
  claimMode: number | null;

  @IsOptional()
  code: string | null;

  @IsOptional()
  @IsIn(Object.values(VoucherCodeTypeEnum))
  codeType: VoucherCodeTypeEnum;

  @TransformNumber()
  @IsNotEmpty()
  @IsNumber()
  discount: number;

  @TransformNumber()
  @IsNotEmpty()
  @IsNumber()
  total: number;

  @Validate(RequiredIfValueValidator, [
    "claimType",
    VoucherClaimTypeEnum.QUESTIONS,
  ])
  @ValidateNested()
  questions?: VoucherQuestionCreateDto[];
}

export class VoucherDiscountCreateDto extends VoucherDiscountCreateWithCampaignDto {
  @IsNotEmpty()
  campaignId: number;
}

export class VoucherDiscountUpdateDto {
  @IsOptional()
  @MaxLength(255)
  description: string | null;

  @IsOptional()
  @IsIn(Object.values(VoucherDiscountTypeEnum))
  type: VoucherDiscountTypeEnum;

  @IsOptional()
  @IsIn(Object.values(VoucherClaimTypeEnum))
  claimType: VoucherClaimTypeEnum | null;

  @TransformNumber()
  @IsOptional()
  @IsNumber()
  claimMode?: number | null;

  @IsOptional()
  code: string | null;

  @IsOptional()
  @IsIn(Object.values(VoucherCodeTypeEnum))
  codeType: VoucherCodeTypeEnum;

  @TransformNumber()
  @IsOptional()
  @IsNumber()
  discount: number;

  @TransformNumber()
  @IsOptional()
  @IsNumber()
  total: number;
}

export class VoucherTicketCreateDto {
  discountId: number;

  code?: string | null;

  claimBy: number;
}
