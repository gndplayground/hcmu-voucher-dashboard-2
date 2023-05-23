import { type } from "os";
import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Box,
  Button,
  IconButton,
  Stack,
  Divider,
} from "@chakra-ui/react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { FormInput, FormSelect } from "@components";
import { FiTrash } from "react-icons/fi";
import {
  VoucherClaimTypeEnum,
  VoucherCodeTypeEnum,
  VoucherDiscountTypeEnum,
  VoucherQuestionTypeEnum,
} from "@types";

type Question = {
  question: string;
  type: VoucherQuestionTypeEnum;
  choices: {
    choice: string;
    isCorrect?: boolean;
  }[];
};

type FormData = {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  claimType?: VoucherClaimTypeEnum;
  questions: Question[];
  voucherDiscounts: {
    description: string | null;
    type: VoucherDiscountTypeEnum;
    claimType?: VoucherClaimTypeEnum | null;
    claimMode?: number | null;
    code?: string | null;
    codeType: VoucherCodeTypeEnum;
    discount: number;
    total: number;
  }[];
};

const validationSchema = Yup.object().shape({
  questions: Yup.array().of(
    Yup.object().shape({
      question: Yup.string().required("Question text is required"),
      type: Yup.string()
        .oneOf(Object.values(VoucherQuestionTypeEnum))
        .required("Question type is required"),
      choices: Yup.array().of(
        Yup.object().shape({
          choice: Yup.string().required("Choice text is required").max(255),
          isCorrect: Yup.boolean().optional(),
        })
      ),
    })
  ),
});

export interface QuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuestionsModal(props: QuestionsModalProps) {
  const { isOpen, onClose } = props;

  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: { questions: [] },
  });

  const { fields, append, remove, update } = useFieldArray<FormData>({
    control,
    name: "questions",
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  const handleAddQuestion = () => {
    append({
      question: "",
      type: VoucherQuestionTypeEnum.SINGLE_CHOICE,
      choices: [
        {
          choice: "",
          isCorrect: false,
        },
      ],
    });
  };

  const handleAddChoice = (questionIndex: number) => {
    const question = fields[questionIndex] as Question;
    const choices = question.choices.concat({
      choice: "",
      isCorrect: false,
    });
    const updatedQuestion = { ...question, choices };
    update(questionIndex, updatedQuestion);
  };

  const handleRemoveChoice = (questionIndex: number, choiceIndex: number) => {
    const question = fields[questionIndex] as Question;
    const choices = question.choices.filter(
      (_, index) => index !== choiceIndex
    );
    const updatedQuestion = { ...question, choices };
    update(questionIndex, updatedQuestion);
  };

  const watchQuestions = watch("questions");

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent maxW="600px">
        <ModalHeader>Questions</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box as="form" onSubmit={handleSubmit(onSubmit)}>
            <Button type="button" variant="outline" onClick={handleAddQuestion}>
              Add question
            </Button>
            <Divider mt={4} />
            {fields.map((question, questionIndex) => {
              const questionType = question as Question;
              return (
                <Box mt={4} key={question.id}>
                  <Box display="flex">
                    <FormInput
                      id={`questions[${questionIndex}].text`}
                      label={`Question ${questionIndex + 1}`}
                      inputProps={{
                        type: "text",
                        placeholder: "Question text",
                        defaultValue: questionType.question,
                        ...register(`questions.${questionIndex}.question`),
                      }}
                      error={
                        (errors?.questions?.[questionIndex] as any)?.question
                          ?.message
                      }
                    />
                    <IconButton
                      mt={8}
                      ml={4}
                      colorScheme="red"
                      aria-label={`Delete question ${questionIndex + 1}`}
                      onClick={() => {
                        remove(questionIndex);
                      }}
                    >
                      <FiTrash />
                    </IconButton>
                  </Box>
                  <FormSelect
                    mt={4}
                    label="Question type"
                    id={`questions[${questionIndex}].type`}
                    selectProps={{
                      ...register(`questions.${questionIndex}.type`),
                    }}
                    errors={errors}
                  >
                    <option value={VoucherQuestionTypeEnum.SINGLE_CHOICE}>
                      {VoucherQuestionTypeEnum.SINGLE_CHOICE}
                    </option>
                    <option value={VoucherQuestionTypeEnum.MULTIPLE_CHOICE}>
                      {VoucherQuestionTypeEnum.MULTIPLE_CHOICE}
                    </option>
                    <option value={VoucherQuestionTypeEnum.FREE}>
                      {VoucherQuestionTypeEnum.FREE}
                    </option>
                  </FormSelect>
                  <Divider mt={4} />
                  {watchQuestions[questionIndex].type !==
                    VoucherQuestionTypeEnum.FREE && (
                    <>
                      <Box mt={4} pl={8} textAlign="right">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            handleAddChoice(questionIndex);
                          }}
                        >
                          Add choice
                        </Button>
                      </Box>
                      <Divider mt={4} />
                      <Stack spacing={4} mt={4} pl={8}>
                        {questionType.choices.map((choice, choiceIndex) => {
                          return (
                            <Box display="flex" key={choiceIndex}>
                              <Controller
                                control={control}
                                name={`questions.${questionIndex}.choices.${choiceIndex}.choice`}
                                defaultValue={choice.choice}
                                render={({ field }) => (
                                  <>
                                    <FormInput
                                      label={`Choice ${choiceIndex + 1}`}
                                      id={`questions[${questionIndex}].choices[${choiceIndex}].choice`}
                                      inputProps={{ ...field }}
                                      error={
                                        (
                                          errors?.questions?.[
                                            questionIndex
                                          ] as any
                                        )?.choices?.[choiceIndex]?.choice
                                          ?.message
                                      }
                                    />
                                  </>
                                )}
                              />
                              {choiceIndex > 0 && (
                                <IconButton
                                  mt={8}
                                  ml={4}
                                  colorScheme="red"
                                  aria-label={`Delete choice ${
                                    choiceIndex + 1
                                  }`}
                                  onClick={() => {
                                    handleRemoveChoice(
                                      questionIndex,
                                      choiceIndex
                                    );
                                  }}
                                >
                                  <FiTrash />
                                </IconButton>
                              )}
                            </Box>
                          );
                        })}
                      </Stack>
                    </>
                  )}
                  <Divider mt={4} />
                </Box>
              );
            })}

            <Box textAlign="center" mt={4}>
              <Button colorScheme="blue" type="submit">
                Submit
              </Button>
            </Box>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
