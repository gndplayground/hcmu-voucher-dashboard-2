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
import { useFieldArray, Controller, UseFormReturn } from "react-hook-form";
import { FormInput, FormSelect } from "@components";
import { FiTrash } from "react-icons/fi";
import {
  CampaignCreateData,
  VoucherQuestionCreateData,
  VoucherQuestionTypeEnum,
} from "@types";

export interface QuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: UseFormReturn<CampaignCreateData>;
  indexVoucherDiscount?: number;
}

export function QuestionsModal(props: QuestionsModalProps) {
  const { isOpen, onClose, form, indexVoucherDiscount } = props;

  const {
    control,
    register,
    formState: { errors },
    watch,
  } = form;

  const baseName: `voucherDiscounts.${number}.questions` | "questions" =
    indexVoucherDiscount !== undefined
      ? (`voucherDiscounts.${indexVoucherDiscount}.questions` as any)
      : ("questions" as any);

  const { fields, append, remove, update } = useFieldArray<CampaignCreateData>({
    control,
    name: baseName,
  });

  const watchQuestions =
    watch(
      indexVoucherDiscount !== undefined
        ? `voucherDiscounts.${indexVoucherDiscount}.questions`
        : "questions"
    ) || [];

  console.log(watchQuestions, "fields");

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
    const question = watchQuestions[questionIndex] as VoucherQuestionCreateData;
    const choices = (question.choices || []).concat({
      choice: "",
      isCorrect: false,
    });
    const updatedQuestion = { ...question, choices };
    console.log(question, updatedQuestion);
    update(questionIndex, updatedQuestion);
  };

  const handleRemoveChoice = (questionIndex: number, choiceIndex: number) => {
    const question = watchQuestions[questionIndex] as VoucherQuestionCreateData;
    const choices = (question.choices || []).filter(
      (_, index) => index !== choiceIndex
    );
    const updatedQuestion = { ...question, choices };
    update(questionIndex, updatedQuestion);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent maxW="600px">
        <ModalHeader>Questions</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Button type="button" variant="outline" onClick={handleAddQuestion}>
            Add question
          </Button>
          <Divider mt={4} />
          {fields.map((question, questionIndex) => {
            const questionType = question as VoucherQuestionCreateData;
            return (
              <Box mt={4} key={question.id}>
                <Box display="flex">
                  <FormInput
                    id={`${baseName}.[${questionIndex}].question`}
                    label={`Question ${questionIndex + 1}`}
                    inputProps={{
                      type: "text",
                      placeholder: "Question text",
                      defaultValue: questionType.question,
                      ...register(`${baseName}.${questionIndex}.question`),
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
                  id={`${baseName}.${questionIndex}.type`}
                  selectProps={{
                    ...register(`${baseName}.${questionIndex}.type`),
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
                {watchQuestions &&
                  watchQuestions[questionIndex].type !==
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
                        {questionType.choices?.map((choice, choiceIndex) => {
                          return (
                            <Box display="flex" key={choiceIndex}>
                              <Controller
                                control={control}
                                name={`${baseName}.${questionIndex}.choices.${choiceIndex}.choice`}
                                defaultValue={choice.choice}
                                render={({ field }) => (
                                  <>
                                    <FormInput
                                      label={`Choice ${choiceIndex + 1}`}
                                      id={`${baseName}.${questionIndex}.choices.${choiceIndex}.choice`}
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
            <Button colorScheme="blue" onClick={onClose}>
              Save
            </Button>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
