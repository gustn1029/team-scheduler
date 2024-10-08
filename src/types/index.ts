import {
  FieldError,
  FieldErrors,
  FieldValues,
  UseFormRegisterReturn,
  UseFormWatch,
} from "react-hook-form";
import { EventTypeEnum } from "./enum/EventTypeEnum";

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
  ariaInvalid?: boolean;
}

export interface OptionList {
  text: string;
  value: string | number;
}

export interface LabelSelectOptionsProps extends LabelInputProps {
  optionList: OptionList[];
}

// 이벤트 엔티티
export interface EventsData {
  id?: string;
  title: string;
  startDate: any;
  endDate: any;
  eventType: EventTypeEnum;
  eventColor: string;
  category: any[];
  eventMemo: string;
  like: number;
  comments: any[];
  createDate: Date;
  updateDate: Date | null;
}

export interface Holiday {
  dateKind: string;
  dateName: string;
  isHoliday: string;
  locdate: number;
  seq: number;
}

export interface EventsFetchProps {
  year: number;
  month: number;
}

export type EventPostData = Omit<
  EventsData,
  "category" | "todos" | "comments" | "like" | "createDate"
>;

export interface TodoData {
  id?: string;
  title?: string;
  isComplete?: boolean;
  todoDate?: Date;
  createDate?: Date;
  updateDate?: Date | null;
}
