import {
  FieldError,
  FieldErrors,
  FieldValues,
  UseFormRegisterReturn,
  UseFormWatch,
} from "react-hook-form";
import { EventTypeEnum } from "./enum/EventTypeEnum";
import { Timestamp } from "firebase/firestore";

export interface UserData {
  id?: string;
  token: string;
  uid: string;
  email: string;
  profileImg: string;
  name: string;
  nickname: string;
}

export interface ProfileData {
  nickname: string;
  profileImg: string;
  userPassword?: string;
}

export interface ProfileUpdateFetchProps {
  data: ProfileData;
  id: string;
}

export interface DeleteUserProps {
  id: string;
  uid: string;
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

export interface DeleteFetchProps {
  collectionName: string;
  id: string;
}

// 이벤트 엔티티
export interface EventsData {
  id?: string;
  uid?: string;
  nickname?: string;
  title: string;
  startDate: Timestamp | Date;
  endDate: Timestamp | Date;
  eventType: EventTypeEnum;
  eventColor: string;
  category: any[];
  eventMemo: string;
  address: EventAddress | null;
  like: string[];
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

export interface HolidayDataFetchProps {
  year: number;
  month: number;
}

export interface EventsFetchProps {
  year: number;
  month: number;
  uid: string;
  teamId?: string;
}

export type EventPostData = Omit<
  EventsData,
  "category" | "todos" | "comments" | "like" | "createDate"
>;

export interface AddressResult {
  id?: string;
  address_name: string;
  place_name?: string;
  road_address_name?: string;
  place_url?: string;
  address_type?: "REGION" | "ROAD" | "REGION_ADDR" | "ROAD_ADDR";
  address: {
    address_name: string;
  };
  x: string;
  y: string;
}

export interface EventLikeFetchProps {
  eventId: string;
  like: string[];
}

export interface EventComments {
  id?: string;
  total: number;
  comments: CommentData[];
}

export interface CommentData {
  id?: number;
  comment: string;
  date: Date;
  uid?: string;
  nickname: string;
  profileImg: string;
}

export interface EventCommentsFetchProps {
  eventId: string;
  comments: CommentData;
}

export interface EventAddress {
  region_address_name?: string;
  place_url?: string;
  road_address_name?: string;
  place_name?: string;
  detail_address?: string;
  x?: string;
  y?: string;
}

export interface EventsFetchProps {
  year: number;
  month: number;
  uid: string;
  teamId?: string;
}

export interface CalendarTodos {
  id: string;
  todoDate: Date;
}

export interface TodoData {
  id?: string;
  todos: TodoItem[];
  todoDate?: Date;
  createDate?: Date;
  updateDate?: Date | null;
  uid?: string;
}

export interface TodoItem {
  id?: string;
  isComplete?: boolean;
  todo?: string;
  createDate?: Date;
}

export interface GetTodosFetchProps {
  date: Date;
  uid: string;
}

export interface TodoAddFetchProps {
  data: TodoData;
  date: Date;
  uid: string;
}

export interface TodoUpdateFetchProps {
  data: TodoItem[];
  uid: string;
}

export interface TeamData {
  id: string;
  manager: TeamMember;
  participants: TeamParticipant[];
}

export interface TeamMember {
  email: string;
  nickname: string;
  uid: string;
}

export interface TeamParticipant extends TeamMember {
  inState: boolean;
}
