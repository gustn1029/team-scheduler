import { QueryClient } from "@tanstack/react-query";
import { appAuth, appFireStore } from "../firebase/config";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import {
  addDoc,
  collection,
  DocumentData,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { EventsData, EventsFetchProps, Holiday, UserData } from "../types";
import { EventTypeEnum } from "../types/enum/EventTypeEnum";
import dayjs from "dayjs";

type CurrentUserData = Omit<UserData, "token">;

// 통신 관련
export const queryClient = new QueryClient();

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
      imageUrl: user.photoURL,
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

  const baseHolidayData: Omit<EventsData, "title" | "startDate" | "endDate"> = {
    eventType: EventTypeEnum.HOLIDAY,
    eventColor: "red",
    category: [],
    eventMemo: "",
    todos: [],
    like: 0,
    comments: [],
    createDate: new Date(),
  };

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
          ...baseHolidayData,
        };
      })
      .filter((holiday: Holiday): holiday is Holiday => holiday !== null);

    Object.entries(specialHolidays).forEach(([name, dates]) => {
      if (dates.length > 0) {
        formattedHolidays.push({
          title: name,
          startDate: dates[0],
          endDate: dates[dates.length - 1],
          ...baseHolidayData,
        });
      }
    });

    return formattedHolidays;
  }
  return [];
};

// 일정 불러오기
// export const eventsDataFetch = async (
//   constraints: QueryConstraint[] = []
// ): Promise<DocumentData[]> => {
//   const eventsRef = collection(appFireStore, "events");
//   const q = query(eventsRef, ...constraints);
//   const querySnapshot = await getDocs(q);
//   return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
// };

export const eventsDataFetch = async ({
  year,
  month,
}: EventsFetchProps): Promise<DocumentData[]> => {
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0);

  const userCollection = collection(appFireStore, "events");
  const q = query(
    userCollection,
    where("startDate", ">=", startOfMonth),
    where("startDate", "<=", endOfMonth)
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};