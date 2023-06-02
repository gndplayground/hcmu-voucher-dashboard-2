import { yupResolver } from "@hookform/resolvers/yup";
import {
  useGetCampaign,
  useUpdateCampaign,
  useUpdateFullCampaign,
} from "@hooks/campaigns";
import {
  CampaignCreateData,
  CampaignEditData,
  VoucherClaimTypeEnum,
  VoucherCodeTypeEnum,
  VoucherDiscountCreateData,
  VoucherDiscountTypeEnum,
  VoucherQuestion,
  VoucherQuestionEditData,
  VoucherQuestionTypeEnum,
} from "@types";
import isAfter from "date-fns/isAfter";
import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import * as Yup from "yup";
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
  Stack,
  Switch,
} from "@chakra-ui/react";
import { FormInput, FormInputDate, FormSelect } from "@components";
import { FiArrowLeft, FiAlertCircle, FiTrash } from "react-icons/fi";
import { QuestionsModal } from "./components/Questions";
import { ReviewQuestions } from "./components/ReviewQuestions";
import { UploadBanner } from "./components/UploadBanner";

export interface CampaignsEditProps {
  id?: number;
}

const validationSchema = Yup.object<CampaignCreateData>().shape({
  name: Yup.string().required("Name is required"),
  description: Yup.string()
    .optional()
    .nullable()
    .max(500, "Description is too long"),
  startDate: Yup.date().required("Start date is required"),
  endDate: Yup.date()
    .required("End date is required")
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
  claimType: Yup.string().optional().nullable(),
  questions: Yup.array()

    .when("claimType", {
      is: (claimType: string) => claimType === VoucherClaimTypeEnum.QUESTIONS,
      then: (schema) =>
        schema.min(1, "At least 1 question is required").of(
          Yup.object().shape({
            question: Yup.string().required("Question is required"),
            choices: Yup.array()
              .when("type", {
                is: (type: string) =>
                  type === VoucherQuestionTypeEnum.MULTIPLE_CHOICE,
                then: (schema) =>
                  schema.min(2, "At least 2 choices are required").of(
                    Yup.object().shape({
                      choice: Yup.string().required("Choice is required"),
                      isCorrect: Yup.boolean().optional().nullable(),
                    })
                  ),
              })
              .when("type", {
                is: (type: string) =>
                  type === VoucherQuestionTypeEnum.SINGLE_CHOICE,
                then: (schema) => {
                  return schema.of(
                    Yup.object().shape({
                      choice: Yup.string().required("Choice is required"),
                      isCorrect: Yup.boolean().optional().nullable(),
                    })
                  );
                },
              }),
          })
        ),
    })
    .optional()
    .nullable(),
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
      claimType: Yup.string().optional().nullable(),
      questions: Yup.array()

        .when("claimType", {
          is: (claimType: string) => {
            return claimType === VoucherClaimTypeEnum.QUESTIONS;
          },
          then: (schema) =>
            schema.min(1, "At least 1 question is required").of(
              Yup.object().shape({
                question: Yup.string().required("Question is required"),
                choices: Yup.array()
                  .when("type", {
                    is: (type: string) =>
                      type === VoucherQuestionTypeEnum.MULTIPLE_CHOICE,
                    then: (schema) =>
                      schema.min(2, "At least 2 choices are required").of(
                        Yup.object().shape({
                          choice: Yup.string().required("Choice is required"),
                          isCorrect: Yup.boolean().optional().nullable(),
                        })
                      ),
                  })
                  .when("type", {
                    is: (type: string) =>
                      type === VoucherQuestionTypeEnum.SINGLE_CHOICE,
                    then: (schema) => {
                      return schema.of(
                        Yup.object().shape({
                          choice: Yup.string().required("Choice is required"),
                          isCorrect: Yup.boolean().optional().nullable(),
                        })
                      );
                    },
                  }),
              })
            ),
        })
        .optional()
        .nullable(),
      code: Yup.string()
        .optional()
        .nullable()
        .test(
          "test-code-required-when-type-is-manual",
          "Voucher code is required when code type is manual",
          function checkCode(string: string | undefined | null, c: any) {
            if (!string && c.parent.codeType === VoucherCodeTypeEnum.MANUAL) {
              return false;
            }
            return true;
          }
        )
        .test(
          "test-code-unique",
          "Voucher code must be unique",
          function checkCode(string: string | undefined | null) {
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

function mapVoucherQuestions(
  voucherQuestions: VoucherQuestion[] | undefined
): VoucherQuestionEditData[] {
  return (
    voucherQuestions?.map((q) => {
      return {
        id: q.id,
        question: q.question,
        type: q.type,
        choices:
          q.voucherQuestionChoices?.map((c) => {
            return {
              id: c.id,
              choice: c.choice,
              isCorrect: c.isCorrect,
            };
          }) || [],
      };
    }) || []
  );
}

export function CampaignsEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const campaign = useGetCampaign(id ? Number(id) : undefined);

  const [file, setFile] = React.useState<File | null | undefined>(null);
  const [removeDefaultImage, setIsRemoveDefaultImage] =
    React.useState<boolean>(false);

  const [allClaimType, setAllClaimType] = React.useState<boolean>(false);

  function handleCheckChangeAllClaimType(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    setAllClaimType(event.target.checked);
  }

  const updateCampFull = useUpdateFullCampaign();
  const updateCamp = useUpdateCampaign({
    skipToastSuccess: true,
  });

  function getVCQ(
    voucherQuestions: VoucherQuestion[] | undefined,
    voucherQuestionsEdit: VoucherQuestionEditData[] | undefined,
    claimType: VoucherClaimTypeEnum | undefined | null
  ) {
    const vq: { id: number; isDeleted: true }[] = [];
    const vc: Record<number, { id: number; isDeleted: true }> = {};

    voucherQuestions?.forEach((q) => {
      if (claimType && claimType !== VoucherClaimTypeEnum.QUESTIONS) {
        vq.push({
          id: q.id,
          isDeleted: true,
        });
        return;
      }

      if (voucherQuestionsEdit?.find((vq) => vq.id === q.id) === undefined) {
        vq.push({
          id: q.id,
          isDeleted: true,
        });
      } else {
        q.voucherQuestionChoices?.forEach((c) => {
          if (
            voucherQuestionsEdit
              ?.find((vq) => vq.id === q.id)
              ?.choices?.find((vc) => vc.id === c.id) === undefined
          ) {
            vc[q.id] = {
              id: c.id,
              isDeleted: true,
            };
          }
        });
      }
    });

    return { vq, vc };
  }

  async function onSubmit(formData: CampaignEditData) {
    try {
      const values = structuredClone(formData);

      const { vc, vq } = getVCQ(
        campaign.data?.voucherQuestions,
        values.questions,
        values.claimType || undefined
      );

      if (!allClaimType) {
        values.claimType = null;
      }

      values.questions = values.questions?.concat(vq).map((q) => {
        if (q.id && vc[q.id]) {
          q.choices = q.choices?.concat(vc[q.id]);
        }
        return q;
      });

      campaign.data?.voucherDiscounts?.forEach((vd) => {
        if (
          !values.voucherDiscounts?.find((v) => {
            return v.id === vd.id;
          })
        ) {
          values.voucherDiscounts = values.voucherDiscounts?.concat({
            id: vd.id,
            isDeleted: true,
          });
        }
      });

      values.voucherDiscounts?.forEach((vd, index) => {
        const v = getVCQ(
          campaign.data?.voucherDiscounts?.[index]?.voucherQuestions,
          values.voucherDiscounts?.[index]?.questions,
          vd.claimType
        );

        values.voucherDiscounts?.forEach((_, index) => {
          if (!values.voucherDiscounts[index]) {
            return;
          }

          values.voucherDiscounts[index].questions = values.voucherDiscounts
            ?.map((d) => {
              if (allClaimType) {
                d.claimType = null;
              }
              return d;
            })
            ?.[index].questions?.concat(v.vq)
            .map((q) => {
              if (q.id && v.vc[q.id]) {
                q.choices = q.choices?.concat(v.vc[q.id]);
              }
              return q;
            });
        });
      });

      await updateCampFull.mutateAsync({
        id: Number(id),
        data: values,
      });

      if (file || removeDefaultImage) {
        await updateCamp.mutateAsync({
          id: Number(id),
          data: {
            logo: file || undefined,
            shouldDeletePhoto: removeDefaultImage,
          },
        });
      }
      navigate({
        pathname: `/campaigns`,
      });
      await campaign.refetch();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    }
  }

  const form = useForm<CampaignEditData>({
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

  React.useEffect(() => {
    if (campaign.isFetchedAfterMount && campaign.data) {
      const data = campaign.data;
      if (data.claimType) {
        setAllClaimType(true);
      }
      form.reset({
        name: data.name,
        description: data.description || "",
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        claimType: data.claimType || undefined,
        questions: mapVoucherQuestions(data.voucherQuestions),
        voucherDiscounts:
          data.voucherDiscounts?.map((d) => {
            return {
              id: d.id,
              claimMode: d.claimMode,
              claimType: d.claimType,
              code: d.code,
              codeType: d.codeType,
              description: d.description,
              discount: d.discount,
              total: d.total,
              type: d.type,
              questions: mapVoucherQuestions(d.voucherQuestions),
            };
          }) || [],
      });
    }
  }, [campaign.data, campaign.isFetchedAfterMount, form]);

  const fieldVoucherDiscounts = useFieldArray<CampaignEditData>({
    control,
    name: "voucherDiscounts",
  });

  const [openQuestion, setOpenQuestion] = React.useState<
    undefined | "questions" | number
  >();

  const watchClaimType = watch("claimType");
  const watchVoucherDiscounts = watch("voucherDiscounts");
  const watchQuestions = watch("questions");
  const watchStartDate = watch("startDate");
  const watchEndDate = watch("endDate");

  return (
    <Card px={8} py={4}>
      {(openQuestion === 0 || !!openQuestion) && (
        <QuestionsModal
          form={form as any}
          indexVoucherDiscount={
            typeof openQuestion === "number" ? openQuestion : undefined
          }
          isOpen={openQuestion === 0 || !!openQuestion}
          onClose={() => {
            setOpenQuestion(undefined);
            form.trigger();
          }}
        />
      )}

      <Box display="flex" alignItems="center" mb={4}>
        <IconButton
          aria-label="Back"
          onClick={() => {
            navigate({
              pathname: `/campaigns`,
            });
          }}
        >
          <FiArrowLeft />
        </IconButton>
        <Heading as="h1" size="xl" ml={4}>
          Edit campaign {campaign.data?.name && `: ${campaign.data?.name}`}
        </Heading>
      </Box>

      <Box as="form" mt={4} onSubmit={handleSubmit(onSubmit)}>
        <Box display="flex">
          <Box minW={250}>
            <UploadBanner
              file={file}
              onChange={(file) => {
                setFile(file);
              }}
              defaultImage={removeDefaultImage ? null : campaign.data?.logo}
              onRemoveDefaultImage={() => {
                setIsRemoveDefaultImage(true);
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
                defaultDate={watchStartDate}
              />
              <FormInputDate
                isRequired={true}
                label="End date"
                id="endDate"
                errors={errors}
                onDateChange={(date) => {
                  setValue("endDate", date);
                }}
                defaultDate={watchEndDate}
              />
              <Divider />
              <Box>
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="all-claims-type" mb="0">
                    All vouchers have the same claim type
                  </FormLabel>
                  <Switch
                    id="all-claims-type"
                    isChecked={allClaimType}
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
                        {errors?.questions?.message && (
                          <Box color="red.500" ml={2}>
                            {errors?.questions?.message}
                          </Box>
                        )}
                        <Box mt={4} display="flex" alignItems="center">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setOpenQuestion("questions");
                            }}
                            colorScheme={
                              (errors as any)?.questions ? "red" : undefined
                            }
                          >
                            Edit questions
                          </Button>
                          {(errors as any)?.questions && (
                            <Box color="red.500" ml={2}>
                              <FiAlertCircle />
                            </Box>
                          )}
                        </Box>
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
                  const currentVoucherDiscount =
                    watchVoucherDiscounts[index] || undefined;
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
                                    {errors?.voucherDiscounts?.[index]
                                      ?.questions?.message && (
                                      <Box color="red.500" ml={2}>
                                        {
                                          errors?.voucherDiscounts?.[index]
                                            ?.questions?.message
                                        }
                                      </Box>
                                    )}
                                    <Box
                                      mt={4}
                                      display="flex"
                                      alignItems="center"
                                    >
                                      <Button
                                        variant="outline"
                                        onClick={() => {
                                          setOpenQuestion(index);
                                        }}
                                        colorScheme={
                                          errors?.voucherDiscounts?.[index]
                                            ?.questions
                                            ? "red"
                                            : undefined
                                        }
                                      >
                                        Edit questions
                                      </Button>
                                      {errors?.voucherDiscounts?.[index]
                                        ?.questions && (
                                        <Box color="red.500" ml={2}>
                                          <FiAlertCircle />
                                        </Box>
                                      )}
                                    </Box>
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
                            {currentVoucherDiscount?.codeType ===
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
            Edit campaign
          </Button>
        </Box>
      </Box>
    </Card>
  );
}
