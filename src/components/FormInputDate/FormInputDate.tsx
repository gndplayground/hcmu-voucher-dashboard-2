import {
  Box,
  BoxProps,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputProps,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Textarea,
  TextareaProps,
  useDisclosure,
  useOutsideClick,
} from "@chakra-ui/react";
import {
  Calendar,
  CalendarDefaultTheme,
  CalendarControls,
  CalendarPrevButton,
  CalendarNextButton,
  CalendarMonths,
  CalendarMonth,
  CalendarMonthName,
  CalendarWeek,
  CalendarDays,
  CalendarDate,
} from "@uselessdev/datepicker";
import format from "date-fns/format";
import isValid from "date-fns/isValid";
import React from "react";
import { FieldErrors } from "react-hook-form";

export interface FormInputDateProps extends BoxProps {
  id: string;
  errors?: FieldErrors;
  label?: React.ReactNode;
  disabled?: boolean;
  isRequired?: boolean;
  onDateChange?: (date: Date) => void;
  error?: string;
}

export function FormInputDate(props: FormInputDateProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [date, setDate] = React.useState<CalendarDate>();
  const [value, setValue] = React.useState("");
  const initialRef = React.useRef(null);
  const calendarRef = React.useRef(null);

  useOutsideClick({
    ref: calendarRef,
    handler: onClose,
    enabled: isOpen,
  });

  const {
    errors,
    label,
    disabled,
    id,
    isRequired,
    onDateChange,
    error,
    ...others
  } = props;

  const handleSelectDate = (date: CalendarDate) => {
    setDate(date);
    setValue(() => (isValid(date) ? format(date, "MM/dd/yyyy") : ""));
    date instanceof Date && onDateChange?.(new Date(date));
    onClose();
  };

  const match = (value: string) => value.match(/(\d{2})\/(\d{2})\/(\d{4})/);

  React.useEffect(() => {
    if (match(value)) {
      const date = new Date(value);
      return setDate(date);
    }
  }, [value]);

  const handleInputChange = ({
    target,
  }: React.ChangeEvent<HTMLInputElement>) => {
    setValue(target.value);

    if (match(target.value)) {
      onClose();
    }
  };

  return (
    <FormControl
      isDisabled={disabled}
      id={id}
      isInvalid={!!errors?.[id] || !!error}
      {...others}
    >
      {label && (
        <FormLabel display="flex" htmlFor={id}>
          {label}
          {isRequired && <Box color="red.500">*</Box>}
        </FormLabel>
      )}
      <Box>
        <Popover
          isOpen={isOpen}
          onClose={onClose}
          initialFocusRef={initialRef}
          isLazy
        >
          <PopoverTrigger>
            <Box onClick={onOpen} ref={initialRef}>
              <Input
                readOnly
                placeholder="MM/dd/yyyy"
                value={value}
                onChange={handleInputChange}
                id={id}
              />
            </Box>
          </PopoverTrigger>

          <PopoverContent
            p={0}
            w="min-content"
            border="none"
            outline="none"
            _focus={{ boxShadow: "none" }}
            ref={calendarRef}
          >
            <Calendar
              value={{ start: date }}
              onSelectDate={handleSelectDate as any}
              singleDateSelection
            >
              <PopoverBody p={0}>
                <CalendarControls>
                  <CalendarPrevButton />
                  <CalendarNextButton />
                </CalendarControls>

                <CalendarMonths>
                  <CalendarMonth>
                    <CalendarMonthName />
                    <CalendarWeek />
                    <CalendarDays />
                  </CalendarMonth>
                </CalendarMonths>
              </PopoverBody>
            </Calendar>
          </PopoverContent>
        </Popover>
      </Box>
      {(errors?.[id]?.message || !!error) && (
        <FormErrorMessage>
          {(errors?.[id]?.message as string) || error}
        </FormErrorMessage>
      )}
    </FormControl>
  );
}
