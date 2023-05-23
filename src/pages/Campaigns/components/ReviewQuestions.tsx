import { VoucherQuestionCreateData, VoucherQuestionTypeEnum } from "@types";
import React from "react";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
} from "@chakra-ui/react";

export interface ReviewQuestionsProps {
  questions?: VoucherQuestionCreateData[];
}

export function ReviewQuestions(props: ReviewQuestionsProps) {
  const { questions = [] } = props;
  return (
    <Accordion allowMultiple={true} mt={4}>
      {questions.map((question, index) => {
        if (question.type === VoucherQuestionTypeEnum.FREE) {
          return (
            <Box as="p" key={index} pl={4} mt={4}>
              Question {index + 1}: {question.question} (Free text)
            </Box>
          );
        }

        return (
          <AccordionItem key={index}>
            <Box>
              <AccordionButton display="flex">
                <Box as="p">
                  Question {index + 1}: {question.question}
                </Box>
                <AccordionIcon ml="auto" />
              </AccordionButton>

              <AccordionPanel pb={4}>
                <Box as="ul" pl={8}>
                  {question.choices &&
                    question.choices.map((c, id) => {
                      return (
                        <Box as="li" key={id}>
                          Choice {id + 1}: {c.choice}
                        </Box>
                      );
                    })}
                </Box>
              </AccordionPanel>
            </Box>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
