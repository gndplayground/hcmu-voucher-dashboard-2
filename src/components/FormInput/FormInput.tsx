import {
  BoxProps,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputProps,
} from "@chakra-ui/react";
import React from "react";
import { FieldErrors } from "react-hook-form";

export interface FormInputProps extends BoxProps {
  id: string;
  errors?: FieldErrors;
  label?: React.ReactNode;
  inputProps?: InputProps;
  disabled?: boolean;
}

export function FormInput(props: FormInputProps) {
  const { errors, label, disabled, id, inputProps, ...others } = props;
  return (
    <FormControl
      isDisabled={disabled}
      id={id}
      isInvalid={!!errors?.[id]}
      {...others}
    >
      {label && <FormLabel>{label}</FormLabel>}
      <Input {...inputProps} />
      {errors?.[id]?.message && (
        <FormErrorMessage>{errors?.[id]?.message as string}</FormErrorMessage>
      )}
    </FormControl>
  );
}
