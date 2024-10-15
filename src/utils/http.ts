import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { appAuth, appFireStore } from "../firebase/config";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  CalendarTodos,
  DeleteFetchProps,
  EventPostData,
  EventsData,
  EventsFetchProps,
  GetTodosFetchProps,
  Holiday,
  HolidayDataFetchProps,
  TodoAddFetchProps,
  TodoData,
  TodoUpdateFetchProps,
  UserData,
} from "../types";
import { EventTypeEnum } from "../types/enum/EventTypeEnum";
import dayjs from "dayjs";
import { handleError } from "./ErrorHandler";

type CurrentUserData = Omit<UserData, "token">;

// 통신 성공했을 때 보여주는 메시지 초기화
let message = "";

// 통신 관련
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: handleError,
  }),
  mutationCache: new MutationCache({
    onError: handleError,
  }),
  defaultOptions: {
    queries: {
      retry: 1,
    },
  },
});

// event 최초 등록 시 필요한 기본 데이터
const baseEventData: Omit<
  EventsData,
  "title" | "startDate" | "endDate" | "eventType"
> = {
  eventColor: "red",
  category: [],
  eventMemo: "",
  like: 0,
  comments: [],
  createDate: new Date(),
  updateDate: null,
};

// 로그인 정보 가져오기
export const userDataFetch = async (
  userId: string
): Promise<CurrentUserData | null> => {
  if (!userId) {
    throw new Error("userId is required");
  }

  const userCollection = collection(appFireStore, "users");
  const q = query(userCollection, where("uid", "==", userId));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  return querySnapshot.docs[0].data() as CurrentUserData;
};

// 구글 인증
export const googleAuthFetch = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(appAuth, provider);
  const user = result.user;

  const userCollection = collection(appFireStore, "users");

  // 해당 uid를 가진 문서가 있는지 확인
  const q = query(userCollection, where("uid", "==", user.uid));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    await addDoc(userCollection, {
      uid: user.uid,
      nickname: user.displayName,
      name: user.displayName,
      email: user.email,
      profileImg: user.photoURL,
    });
  }

  return user;
};

// 로그아웃
export const logoutFetch = async () => {
  await signOut(appAuth);
};

// 공휴일 데이터
export const holidayFetch = async () => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_HOLIDAY_API_URL}?serviceKey=${
        import.meta.env.VITE_HOLIDAY_API_KEY
      }&solYear=${new Date().getFullYear()}&numOfRows=100&_type=json`
    );

    if (res.ok) {
      return res.json();
    }
  } catch (error) {
    throw new Error(
      `공휴일 데이터를 가져오는 중 오류가 발생했습니다. ${error}`
    );
  }
};

export const formattedHolidayFetch = async () => {
  const res = await holidayFetch();

  const specialHolidays = {
    설날: [] as Date[],
    추석: [] as Date[],
  };

  if (res?.response?.body?.items?.item) {
    const formattedHolidays = res?.response?.body?.items?.item
      .map((holiday: Holiday) => {
        const date = dayjs(holiday.locdate.toString(), "YYYYMMDD").toDate();

        if (holiday.dateName.includes("설날")) {
          specialHolidays.설날.push(date);
          return null;
        }
        if (holiday.dateName.includes("추석")) {
          specialHolidays.추석.push(date);
          return null;
        }

        return {
          title: holiday.dateName,
          startDate: date,
          endDate: date,
          eventType: EventTypeEnum.HOLIDAY,
          ...baseEventData,
        };
      })
      .filter((holiday: Holiday): holiday is Holiday => holiday !== null);

    Object.entries(specialHolidays).forEach(([name, dates]) => {
      if (dates.length > 0) {
        formattedHolidays.push({
          title: name,
          startDate: dates[0],
          endDate: dates[dates.length - 1],
          eventType: EventTypeEnum.HOLIDAY,
          ...baseEventData,
        });
      }
    });

    return formattedHolidays;
  }
  return [];
};

// 공휴일 불러오기
export const holidayDataFetch = async ({
  year,
  month,
}: HolidayDataFetchProps) => {
  const monthStart = dayjs(new Date(year, month, 1)).startOf("month");
  const monthEnd = monthStart.endOf("month");

  const queryStartDate = monthStart.subtract(7, "day").toDate();
  const queryEndDate = monthEnd.add(7, "day").toDate();

  const userCollection = collection(appFireStore, "events");
  const q = query(
    userCollection,
    where("startDate", ">=", queryStartDate),
    where("startDate", "<=", queryEndDate),
    where("eventType", "==", EventTypeEnum.HOLIDAY),
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// events 불러오기
export const eventsDataFetch = async ({
  year,
  month,
  uid,
}: EventsFetchProps): Promise<EventsData[]> => {
  const monthStart = dayjs(new Date(year, month, 1)).startOf("month");
  const monthEnd = monthStart.endOf("month");

  const queryStartDate = monthStart.subtract(7, "day").toDate();
  const queryEndDate = monthEnd.add(7, "day").toDate();

  const userCollection = collection(appFireStore, "events");
  const q = query(
    userCollection,
    where("uid", "==", uid),
    where("startDate", ">=", queryStartDate),
    where("startDate", "<=", queryEndDate)
  );
  const querySnapshot = await getDocs(q);

  const holidays = await holidayDataFetch({year, month});

  const events = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  return [...events, ...holidays] as EventsData[];
};

// events 등록
export const addEventsFetch = async (data: EventPostData) => {
  if (!appAuth.currentUser) return;

  const eventCollection = collection(appFireStore, "events");

  const newEvent: EventsData = {
    ...data,
    createDate: new Date(),
    category: [],
    comments: [],
    like: 0,
    updateDate: null,
  };

  const doc = await addDoc(eventCollection, newEvent);
  return doc.id;
};

// calendar todo 불러오기
export const calendarTodosFetch = async ({
  year,
  month,
  uid,
}: EventsFetchProps): Promise<CalendarTodos[]> => {
  const monthStart = dayjs(new Date(year, month, 1)).startOf("month");
  const monthEnd = monthStart.endOf("month");

  const queryStartDate = monthStart.subtract(7, "day").toDate();
  const queryEndDate = monthEnd.add(7, "day").toDate();

  const userCollection = collection(appFireStore, "todos");
  const q = query(
    userCollection,
    where("uid", "==", uid),
    where("todoDate", ">=", queryStartDate),
    where("todoDate", "<=", queryEndDate)
  );
  const querySnapshot = await getDocs(q);

  const todos = querySnapshot.docs.map((doc) => ({ id: doc.id, todoDate: doc.data().todoDate.toDate()}));

  return todos as CalendarTodos[];
};

// todo 등록
export const addTodoFetch = async ({ data, uid, date }: TodoAddFetchProps) => {
  const todoCollection = collection(appFireStore, "todos");

  const q = query(
    todoCollection,
    where("todoDate", "==", date),
    where("uid", "==", uid)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    await addDoc(todoCollection, data);
    
    message = "할일을 정상적으로 저장했습니다.";

    return message;
  } else {
    const docId = snapshot.docs[0].id;
    await updateTodosFetch({ data: data.todos, uid: docId });

    message = "할일을 정상적으로 업데이트 했습니다.";
    return message;
  }
};

// todo 불러오기
export const getTodosFetch = async ({
  date,
  uid,
}: GetTodosFetchProps): Promise<TodoData[]> => {
  const todosCollection = collection(appFireStore, "todos");
  const q = query(
    todosCollection,
    where("todoDate", "==", date),
    where("uid", "==", uid)
  );

  const todosSnapshot = await getDocs(q);

  return todosSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    todoDate: doc.data().todoDate.toDate(),
  })) as TodoData[];
};

export const updateTodosFetch = async ({ data, uid }: TodoUpdateFetchProps) => {
  const docRef = doc(appFireStore, "todos", uid);

  await updateDoc(docRef, {
    todos: data,
    updateDate: new Date(),
  });

  return true;
};

export const deleteTodoFetch = async ({
  collectionName,
  id,
}: DeleteFetchProps) => {
  const docRef = doc(appFireStore, collectionName, id);
  await deleteDoc(docRef);
  message = `${
    collectionName === "events" ? "일정을" : "할일을"
  } 성공적으로 삭제했습니다.`;
  return message;
};
