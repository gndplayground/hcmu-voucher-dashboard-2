import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Card,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  IconButton,
  Input,
  Stack,
  Switch,
} from "@chakra-ui/react";
import { isAfter } from "date-fns";
import { FormInputDate, FormSelect } from "@components";
import { FormInput } from "@components";
import { yupResolver } from "@hookform/resolvers/yup";

import {
  CampaignCreateData,
  VoucherClaimTypeEnum,
  VoucherCodeTypeEnum,
  VoucherDiscountCreateData,
  VoucherDiscountTypeEnum,
} from "@types";
import * as Yup from "yup";
import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { FiAlertCircle, FiTrash } from "react-icons/fi";
import { useCreateCampaign, useUpdateCampaign } from "@hooks/campaigns";
import { useNavigate } from "react-router-dom";
import { all } from "axios";
import { QuestionsModal } from "./components/Questions";
import { ReviewQuestions } from "./components/ReviewQuestions";

export interface CampaignsAddProps {
  companyId: number;
}

const validationSchema = Yup.object<CampaignCreateData>().shape({
  name: Yup.string().required("Name is required"),
  description: Yup.string().optional().max(255, "Description is too long"),
  startDate: Yup.date()
    .required("Start date is required")
    .test("not-in-the-past", "Date must not be in the past", function (value) {
      return !value || value >= new Date();
    }),
  endDate: Yup.date()
    .required("End date is required")
    .test("not-in-the-past", "Date must not be in the past", function (value) {
      return !value || value >= new Date();
    })
    .test(
      "test-endDate",
      "End date must be greater than start date",
      function checkEnd(end?: Date) {
        const { startDate } = this.parent;
        if (end && isAfter(end, startDate)) {
          return true;
        }
        return false;
      }
    ),
  claimType: Yup.string().optional(),
  voucherDiscounts: Yup.array().of(
    Yup.object().shape({
      type: Yup.string().required("Voucher type is required"),
      discount: Yup.number()
        .transform((value, originalValue) => {
          return originalValue === "" ? undefined : value;
        })
        .positive()
        .integer()
        .required("Voucher discount is required"),
      total: Yup.number()
        .transform((value, originalValue) => {
          return originalValue === "" ? undefined : value;
        })
        .positive()
        .integer()
        .required("Voucher total is required"),
      description: Yup.string().max(255, "Description is too long"),
      claimType: Yup.string().optional(),
      code: Yup.string()
        .optional()
        .test(
          "test-code-required-when-type-is-manual",
          "Voucher code is required when code type is manual",
          function checkCode(string: string | undefined, c: any) {
            if (!string && c.parent.codeType === VoucherCodeTypeEnum.MANUAL) {
              return false;
            }
            return true;
          }
        )
        .test(
          "test-code-unique",
          "Voucher code must be unique",
          function checkCode(string: string | undefined) {
            if (!string) return true;
            const index = parseInt(this.path.split("[")[1].split("]")[0], 10);
            const voucherDiscounts = ((this as any).from[1].value
              .voucherDiscounts || []) as VoucherDiscountCreateData[];
            const codes = voucherDiscounts.map((v) => v.code);

            codes.splice(index, 1);

            if (codes.includes(string)) {
              return false;
            }
            return true;
          }
        ),
      codeType: Yup.string()
        .oneOf(Object.values(VoucherCodeTypeEnum))
        .required("Voucher code type is required"),
    })
  ),
});

const resolver = yupResolver(validationSchema);

interface UploadButtonProps {
  onChange: (file: File | null) => void;
  file?: File | null;
}

function UploadButton(props: UploadButtonProps) {
  const { onChange, file } = props;
  const [image, setImage] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];
    onChange(selectedFile || null);
  }

  React.useEffect(() => {
    if (!file) {
      setImage(null);
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [file]);

  return (
    <Box>
      {!image && <Box w="200px" height="200px" border="1px dashed" />}
      {image && (
        <Box w="200px" height="200px" border="1px dashed">
          <Box
            as="img"
            src={image}
            alt="Preview"
            w="100%"
            height="100%"
            objectFit="cover"
          />
        </Box>
      )}
      <Input
        ref={inputRef}
        type="file"
        onChange={handleFileChange}
        display="none"
        accept="image/jpeg"
      />
      <Box mt={4} display="flex" alignItems="center">
        <Button onClick={() => inputRef.current?.click()}>Upload banner</Button>
        {file && (
          <IconButton
            ml={4}
            aria-label="Delete image"
            colorScheme="red"
            onClick={() => {
              onChange(null);
            }}
          >
            <FiTrash />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}

export function CampaignsAdd() {
  const navigate = useNavigate();

  const [file, setFile] = React.useState<File | null | undefined>(null);

  const [allClaimType, setAllClaimType] = React.useState<boolean>(false);

  const createCamp = useCreateCampaign();

  const updateCamp = useUpdateCampaign({
    skipToastSuccess: true,
  });

  function handleCheckChangeAllClaimType(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    setAllClaimType(event.target.checked);
  }

  const form = useForm<CampaignCreateData>({
    defaultValues: { questions: [] },
    resolver,
  });

  const {
    handleSubmit,
    register,
    setValue,
    control,
    formState: { errors, isSubmitting },
    watch,
  } = form;

  const fieldVoucherDiscounts = useFieldArray<CampaignCreateData>({
    control,
    name: "voucherDiscounts",
  });

  const [openQuestion, setOpenQuestion] = React.useState<
    undefined | "questions" | number
  >();

  const watchClaimType = watch("claimType");
  const watchVoucherDiscounts = watch("voucherDiscounts");
  const watchQuestions = watch("questions");

  async function onSubmit(values: CampaignCreateData) {
    const camp = await createCamp.mutateAsync({
      ...values,
      questions: !allClaimType ? [] : values.questions,
    });

    if (file) {
      updateCamp.mutateAsync({
        id: camp.id,
        data: { logo: file || undefined },
      });
    }
    navigate({
      pathname: `/campaigns`,
    });
  }

  return (
    <Card px={8} py={4}>
      {(openQuestion === 0 || !!openQuestion) && (
        <QuestionsModal
          form={form}
          indexVoucherDiscount={
            typeof openQuestion === "number" ? openQuestion : undefined
          }
          isOpen={openQuestion === 0 || !!openQuestion}
          onClose={() => {
            setOpenQuestion(undefined);
          }}
        />
      )}
      <Heading as="h1" size="xl" mb={4}>
        Add new campaign
      </Heading>

      <Box as="form" mt={4} onSubmit={handleSubmit(onSubmit)}>
        <Box display="flex">
          <Box minW={250}>
            <UploadButton
              file={file}
              onChange={(file) => {
                setFile(file);
              }}
            />
          </Box>
          <Box ml={4} w="100%">
            <Stack w="100%" spacing={4}>
              <FormInput
                isRequired={true}
                disabled={isSubmitting}
                id="name"
                inputProps={{
                  ...register("name"),
                }}
                errors={errors}
                label="Name"
              />
              <FormInput
                isMutliline={true}
                disabled={isSubmitting}
                id="description"
                inputProps={{
                  ...register("description"),
                  resize: "none",
                  rows: 5,
                }}
                errors={errors}
                label="Description"
              />
              <FormInputDate
                isRequired={true}
                onDateChange={(date) => {
                  setValue("startDate", date);
                }}
                label="Start date"
                id="startDate"
                errors={errors}
              />
              <FormInputDate
                isRequired={true}
                label="End date"
                id="endDate"
                errors={errors}
                onDateChange={(date) => {
                  setValue("endDate", date);
                }}
              />
              <Divider />
              <Box>
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="all-claims-type" mb="0">
                    All vouchers have the same claim type
                  </FormLabel>
                  <Switch
                    id="all-claims-type"
                    onChange={handleCheckChangeAllClaimType}
                  />
                </FormControl>
                {allClaimType && (
                  <>
                    <FormSelect
                      mt={4}
                      label="Claim type"
                      id="claimType"
                      selectProps={{
                        ...register("claimType"),
                      }}
                      errors={errors}
                    >
                      <option value={VoucherClaimTypeEnum.FASTEST}>
                        {VoucherClaimTypeEnum.FASTEST}
                      </option>
                      <option value={VoucherClaimTypeEnum.QUESTIONS}>
                        {VoucherClaimTypeEnum.QUESTIONS}
                      </option>
                    </FormSelect>
                    <ReviewQuestions questions={watchQuestions} />
                    <Divider />
                    {watchClaimType === VoucherClaimTypeEnum.QUESTIONS && (
                      <>
                        <Button
                          mt={4}
                          variant="outline"
                          onClick={() => {
                            setOpenQuestion("questions");
                          }}
                        >
                          Edit questions
                        </Button>
                      </>
                    )}
                  </>
                )}
              </Box>
            </Stack>
            <Divider mt={4} />
            <Stack ml={8} spacing={4} pt={4}>
              <Accordion defaultIndex={[0]} allowMultiple>
                {fieldVoucherDiscounts.fields.map((field, index) => {
                  const fieldHasError = (errors as any)?.voucherDiscounts?.[
                    index
                  ];
                  const currentVoucherDiscount = watchVoucherDiscounts[index];
                  return (
                    <AccordionItem key={field.id}>
                      <Stack spacing={4}>
                        <Box display="flex" pt={2}>
                          <IconButton
                            colorScheme="red"
                            aria-label={`Delete voucher discount ${index + 1}`}
                            onClick={() => {
                              fieldVoucherDiscounts.remove(index);
                            }}
                          >
                            <FiTrash />
                          </IconButton>
                          <AccordionButton ml={2}>
                            <Heading
                              as="h3"
                              size="md"
                              color={fieldHasError ? "red.500" : ""}
                            >
                              Voucher #{index + 1}
                            </Heading>
                            <AccordionIcon />
                            {(errors as any)?.voucherDiscounts?.[index] && (
                              <Box color="red.500" ml={2}>
                                <FiAlertCircle />
                              </Box>
                            )}
                          </AccordionButton>
                        </Box>
                        <AccordionPanel>
                          <Stack spacing={4}>
                            <FormSelect
                              mt={4}
                              isRequired={true}
                              label="Voucher discount type"
                              id={`voucherDiscounts.${index}.type`}
                              selectProps={{
                                ...register(`voucherDiscounts.${index}.type`),
                              }}
                              error={
                                (errors?.voucherDiscounts as any)?.[index]?.type
                                  ?.message
                              }
                            >
                              <option value={VoucherDiscountTypeEnum.AMOUNT}>
                                {VoucherDiscountTypeEnum.AMOUNT}
                              </option>
                              <option
                                value={VoucherDiscountTypeEnum.PERCENTAGE}
                              >
                                {VoucherDiscountTypeEnum.PERCENTAGE}
                              </option>
                            </FormSelect>
                            <FormInput
                              isRequired={true}
                              disabled={isSubmitting}
                              id={`voucherDiscounts.${index}.discount`}
                              inputProps={{
                                ...register(
                                  `voucherDiscounts.${index}.discount`
                                ),
                              }}
                              errors={errors}
                              error={
                                (errors?.voucherDiscounts as any)?.[index]
                                  ?.discount?.message
                              }
                              label="Discount"
                            />
                            <FormInput
                              isRequired={true}
                              disabled={isSubmitting}
                              id={`voucherDiscounts.${index}.total`}
                              inputProps={{
                                ...register(`voucherDiscounts.${index}.total`),
                              }}
                              errors={errors}
                              error={
                                (errors?.voucherDiscounts as any)?.[index]
                                  ?.total?.message
                              }
                              label="Total tickets"
                            />
                            <FormInput
                              isMutliline={true}
                              disabled={isSubmitting}
                              id={`voucherDiscounts.${index}.description`}
                              inputProps={{
                                ...register(
                                  `voucherDiscounts.${index}.description`
                                ),
                                resize: "none",
                                rows: 2,
                              }}
                              errors={errors}
                              error={
                                (errors?.voucherDiscounts as any)?.[index]
                                  ?.description?.message
                              }
                              label="Description"
                            />
                            {!allClaimType && (
                              <>
                                <FormSelect
                                  mt={4}
                                  label="Claim type"
                                  id={`voucherDiscounts.${index}.claimType`}
                                  selectProps={{
                                    ...register(
                                      `voucherDiscounts.${index}.claimType`
                                    ),
                                  }}
                                  errors={errors}
                                  error={
                                    (errors?.voucherDiscounts as any)?.[index]
                                      ?.claimType?.message
                                  }
                                >
                                  <option value={VoucherClaimTypeEnum.FASTEST}>
                                    {VoucherClaimTypeEnum.FASTEST}
                                  </option>
                                  <option
                                    value={VoucherClaimTypeEnum.QUESTIONS}
                                  >
                                    {VoucherClaimTypeEnum.QUESTIONS}
                                  </option>
                                </FormSelect>
                                {watchVoucherDiscounts[index].claimType ===
                                  VoucherClaimTypeEnum.QUESTIONS && (
                                  <>
                                    <ReviewQuestions
                                      questions={
                                        watchVoucherDiscounts[index].questions
                                      }
                                    />
                                    <Divider />
                                    <Button
                                      mt={4}
                                      variant="outline"
                                      onClick={() => {
                                        setOpenQuestion(index);
                                      }}
                                    >
                                      Edit questions
                                    </Button>
                                  </>
                                )}
                              </>
                            )}
                            <FormSelect
                              mt={4}
                              isRequired={true}
                              label="Voucher code type"
                              id={`voucherDiscounts.${index}.codeType`}
                              selectProps={{
                                ...register(
                                  `voucherDiscounts.${index}.codeType`
                                ),
                              }}
                              error={
                                (errors?.voucherDiscounts as any)?.[index]?.type
                                  ?.message
                              }
                            >
                              <option value={VoucherCodeTypeEnum.CLAIM}>
                                {VoucherCodeTypeEnum.CLAIM} (Voucher code is
                                generated when claimed)
                              </option>
                              <option value={VoucherCodeTypeEnum.MANUAL}>
                                {VoucherCodeTypeEnum.MANUAL}
                              </option>
                            </FormSelect>
                            {currentVoucherDiscount.codeType ===
                              VoucherCodeTypeEnum.MANUAL && (
                              <FormInput
                                isRequired={true}
                                disabled={isSubmitting}
                                id={`voucherDiscounts.${index}.code`}
                                inputProps={{
                                  ...register(`voucherDiscounts.${index}.code`),
                                }}
                                errors={errors}
                                error={
                                  (errors?.voucherDiscounts as any)?.[index]
                                    ?.code?.message
                                }
                                label={`Voucher code ${
                                  watchVoucherDiscounts.length > 1
                                    ? "(Must be unique)"
                                    : ""
                                }`}
                              />
                            )}
                          </Stack>
                        </AccordionPanel>
                        <Divider />
                      </Stack>
                    </AccordionItem>
                  );
                })}
              </Accordion>

              <Box textAlign="left" mt={8}>
                <Button
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                  colorScheme="blue"
                  variant="outline"
                  onClick={() => {
                    fieldVoucherDiscounts.append({} as any);
                  }}
                >
                  Add voucher discount
                </Button>
              </Box>
            </Stack>
          </Box>
        </Box>
        <Box textAlign="center" mt={8}>
          <Button
            disabled={isSubmitting}
            isLoading={isSubmitting}
            type="submit"
            colorScheme="blue"
            variant="solid"
          >
            Add campaign
          </Button>
        </Box>
      </Box>
    </Card>
  );
}
