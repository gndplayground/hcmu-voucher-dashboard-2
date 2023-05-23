import { Campaign, VoucherClaimTypeEnum } from "@types";
import { TransformNumber } from "@utils/classTransformers";
import {
  LessThanValidator,
  NotPastValidator,
  RequiredIfValueValidator,
} from "@utils/classValidators";
import {
  IsNotEmpty,
  MaxLength,
  IsOptional,
  ValidateNested,
  IsIn,
  Validate,
  IsDateString,
} from "class-validator";
import { VoucherQuestionCreateDto } from "./voucherQuestion";
import { VoucherDiscountCreateWithCampaignDto } from "./voucher";

export class CampaignCreateDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @MaxLength(256)
  description?: string | null;

  // @IsOptional()
  // @IsMimeType()
  // @MaxFileSize(5 * 1024 * 1024) // 2 MB
  // logo: Buffer;

  @IsOptional()
  @IsIn(Object.values(VoucherClaimTypeEnum))
  claimType: VoucherClaimTypeEnum | null;

  @TransformNumber()
  @IsOptional()
  claimMode: number | null;

  @IsNotEmpty()
  @Validate(NotPastValidator)
  @Validate(LessThanValidator, ["endDate"])
  startDate: string;

  @IsNotEmpty()
  @Validate(NotPastValidator)
  endDate: string;
}

export class CampaignCreateFullDto extends CampaignCreateDto {
  @IsNotEmpty()
  voucherDiscounts: VoucherDiscountCreateWithCampaignDto[];

  @Validate(RequiredIfValueValidator, [
    "claimType",
    VoucherClaimTypeEnum.QUESTIONS,
  ])
  @ValidateNested()
  questions?: VoucherQuestionCreateDto[];
}
