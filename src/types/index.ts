
import {
  FieldError,
  FieldErrors,
  FieldValues,
  UseFormRegisterReturn,
  UseFormWatch,
} from "react-hook-form";

export interface UserData {
  token: string;
  uid: string;
  email: string;
  imageUrl: string;
  name: string;
  nickname: string;
}

export interface LabelInputProps {
  label: string;
  placeholder?: string;
  register: UseFormRegisterReturn<string>;
  watch: UseFormWatch<any>;
  children?: React.ReactNode;
  type?: "text" | "number" | "date" | "password" | "file" | "email";
  error?: FieldErrors<FieldValues>;
  isLabelTextHidden?: boolean;
  description?: string;
  errorView?: FieldError;
  isDisabled?: boolean;
  isRequired?: boolean;
  inputClassName?: string;
  labelClassName?: string;
}

export interface OptionList {
  text: string;
  value: string | number;
}

export interface LabelSelectOptionsProps extends LabelInputProps {
  optionList: OptionList[];
}
