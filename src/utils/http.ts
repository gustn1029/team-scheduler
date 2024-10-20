import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { appAuth, appFireStore, appStorage } from "../firebase/config";
import {
  deleteUser,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  AddressResult,
  CalendarTodos,
  DeleteFetchProps,
  DeleteUserProps,
  EventPostData,
  EventsData,
  EventsFetchProps,
  GetTodosFetchProps,
  Holiday,
  HolidayDataFetchProps,
  ProfileUpdateFetchProps,
  TodoAddFetchProps,
  TodoData,
  TodoUpdateFetchProps,
  UserData,
} from "../types";
import { EventTypeEnum } from "../types/enum/EventTypeEnum";
import dayjs from "dayjs";
import { handleError } from "./ErrorHandler";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

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

  return {
    id: querySnapshot.docs[0].id,
    ...querySnapshot.docs[0].data(),
  } as CurrentUserData;
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
    where("eventType", "==", EventTypeEnum.HOLIDAY)
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

  const holidays = await holidayDataFetch({ year, month });

  const events = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

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

interface SearchResponseData {
  documents: AddressResult[];
}
// 주소 정보 가져오기
const fetchAddress = async (
  query: string,
  searchType: string
): Promise<AddressResult[]> => {
  const address = await fetch(
    `https://dapi.kakao.com/v2/local/search/${searchType}.json?query=${encodeURIComponent(
      query
    )}`,
    {
      headers: {
        Authorization: `KakaoAK ${import.meta.env.VITE_KAKAO_API_KEY}`,
      },
    }
  );

  if (!address.ok) {
    throw new Error("주소 검색 중 오류가 발생했습니다.");
  }
  const data: SearchResponseData = await address.json();

  return data.documents;
};

export const eventAddressFetch = async (query: string) => {
  if (!query) return [];

  let data = await fetchAddress(query, "address");

  if (data.length === 0) {
    console.log("data", data)
    data = await fetchAddress(query, "keyword");
  }

  return data;
};

// events 업데이트
export const updateEvent = async ({
  data,
  eventData,
  id,
}: {
  data: EventsData;
  eventData: EventsData;
  id: string;
}) => {
  const eventDoc = doc(appFireStore, "events", id as string);
  await updateDoc(eventDoc, {
    ...eventData,
    ...data,
    startDate: data.startDate,
    endDate: data.endDate,
    updateDate: new Date(),
  });
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

  const todos = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    todoDate: doc.data().todoDate.toDate(),
  }));

  return todos as CalendarTodos[];
};

// todo 등록
export const addTodoFetch = async ({
  data,
  uid,
  date,
}: TodoAddFetchProps): Promise<string> => {
  try {
    const todoCollection = collection(appFireStore, "todos");

    const q = query(
      todoCollection,
      where("todoDate", "==", date),
      where("uid", "==", uid)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      await addDoc(todoCollection, data);
      return "할일을 정상적으로 저장했습니다.";
    } else {
      const docId = snapshot.docs[0].id;
      const docRef = doc(appFireStore, "todos", docId);
      await updateDoc(docRef, { todos: data.todos });
      return "할일을 정상적으로 업데이트 했습니다.";
    }
  } catch (error) {
    console.error("Error in addTodoFetch:", error);
    throw new Error("할일 저장 중 오류가 발생했습니다.");
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

// 이미지 업로드
export const uploadProfileImage = async (
  file: File | null,
  img: string
): Promise<{ profileImg: string }> => {
  if (!file || img === "") return { profileImg: "" };

  const fileName = `profileImages/${Date.now()}_${img}`;
  const storageRef = ref(appStorage, fileName);
  try {
    await uploadBytes(storageRef, file);
    const profileImg = await getDownloadURL(storageRef);
    return { profileImg };
  } catch (error) {
    console.error("error: ", error);
    throw error;
  }
};

// 프로필 수정
export const profileUpdateFetch = async ({
  data,
  id,
}: ProfileUpdateFetchProps) => {
  const userDocRef = doc(appFireStore, "users", id);
  await updateDoc(userDocRef, {
    nickname: data.nickname,
    profileImg: data.profileImg,
  });
};

// 탈퇴 관련 함수
async function deleteUserProfileImage(id: string) {
  try {
    const userDocRef = doc(appFireStore, "users", id);
    const user = await getDoc(userDocRef);

    if (!user.exists()) {
      return;
    }

    const userData = user.data();
    const imagePath: string | undefined = userData.profileImg;

    if (!imagePath) {
      return;
    }

    if (imagePath.includes("profile.png")) {
      return;
    }

    const imageRef = ref(appStorage, imagePath);

    // 프로필 이미지 삭제
    await deleteObject(imageRef);
  } catch (error) {
    console.error("프로필 이미지 삭제 중 오류 발생:", error);
    throw error;
  }
}

async function deleteUserDataFromFirestore({ id, uid }: DeleteUserProps) {
  try {
    // 사용자 문서 삭제
    await deleteDoc(doc(appFireStore, "users", id));

    // 사용자와 관련된 events 컬렉션의 문서들 삭제
    const eventsQuery = query(
      collection(appFireStore, "events"),
      where("uid", "==", uid)
    );
    const eventsSnapshot = await getDocs(eventsQuery);
    const deleteEventsPromises = eventsSnapshot.docs.map((doc) =>
      deleteDoc(doc.ref)
    );
    await Promise.all(deleteEventsPromises);

    // 사용자와 관련된 todos 컬렉션의 문서들 삭제
    const todosQuery = query(
      collection(appFireStore, "todos"),
      where("uid", "==", uid)
    );
    const todosSnapshot = await getDocs(todosQuery);
    const deleteTodosPromises = todosSnapshot.docs.map((doc) =>
      deleteDoc(doc.ref)
    );
    await Promise.all(deleteTodosPromises);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

interface DeleteUser extends DeleteUserProps {
  user: User;
}

export const deleteUserFetch = async ({ user, id, uid }: DeleteUser) => {
  await deleteUserProfileImage(id);
  await deleteUserDataFromFirestore({ id, uid });
  await deleteUser(user);
};
