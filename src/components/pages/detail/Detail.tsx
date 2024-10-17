import { useEffect, useState } from "react";
import Header from "../../header/Header";
import styles from "../detail/detail.module.scss";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { appFireStore } from "../../../firebase/config";
import { EventsData, UserData } from "../../../types";
import Loader from "../../loader/Loader";
import { EventTypeEnum } from "../../../types/enum/EventTypeEnum";
import dayjs from "dayjs";

type CurrentUserData = Omit<UserData, "token">;

type EventColor =
  | "red"
  | "pink"
  | "orange"
  | "yellow"
  | "mint"
  | "blue"
  | "gray";

const colorMap: Record<EventColor, string> = {
  red: "#F5333F",
  pink: "#FB91A3",
  orange: "#FF9E18",
  yellow: "#FFD235",
  mint: "#00B392",
  blue: "#3FA9F5",
  gray: "#7BA0C4",
};

function Detail() {
  const { id } = useParams<{ id: string }>();
  const [eventData, setEventData] = useState<EventsData | null>(null);
  const [userData, setUserData] = useState<CurrentUserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEventData = async () => {
      if (!id) {
        setError("이벤트 ID가 없습니다.");
        setIsLoading(false);
        return;
      }

      try {
        const eventDoc = doc(appFireStore, "events", id);
        const docSnap = await getDoc(eventDoc);

        if (docSnap.exists()) {
          setEventData(docSnap.data() as EventsData);
        } else {
          setError("해당 이벤트를 찾을 수 없습니다.");
        }
      } catch (err) {
        console.error("데이터를 불러오는 중 오류가 발생했습니다.", err);
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [id]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (eventData && eventData.uid) {
        try {
          const userData = await userDataFetch(eventData.uid);
          setUserData(userData);
        } catch (err) {
          console.error(
            "사용자 데이터를 불러오는 중 오류가 발생했습니다.",
            err
          );
        }
      }
    };

    fetchUserData();
  }, [eventData]);

  const getEventColor = (colorName: EventColor | string): string => {
    return colorName in colorMap
      ? colorMap[colorName as EventColor]
      : colorName;
  };

  const formatDateRange = (startDate: Date, endDate: Date) => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

    const formatSingleDate = (date: dayjs.Dayjs) =>
      `${date.format("YYYY.MM.DD")}(${weekDays[date.day()]})`;

    if (start.isSame(end, "day")) {
      return formatSingleDate(start);
    } else {
      return `${formatSingleDate(start)} ~ ${formatSingleDate(end)}`;
    }
  };
  const formatTime = (date: Date) => {
    return dayjs(date).format("HH:mm");
  };

  const formatEventPeriod = (
    startDate: Date,
    endDate: Date,
    eventType: EventTypeEnum
  ) => {
    const dateRange = formatDateRange(startDate, endDate);

    if (
      eventType === EventTypeEnum.HOLIDAY ||
      isAllDayEvent(startDate, endDate)
    ) {
      return dateRange;
    } else {
      return `${dateRange} ${formatTime(startDate)} ~ ${formatTime(endDate)}`;
    }
  };

  const isAllDayEvent = (startDate: Date, endDate: Date) => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    return (
      start.hour() === 0 &&
      start.minute() === 0 &&
      end.hour() === 23 &&
      end.minute() === 59
    );
  };
  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!eventData) {
    return (
      <div className={styles.error}>이벤트 데이터를 찾을 수 없습니다.</div>
    );
  }

  const eventStartDate =
    eventData.startDate instanceof Timestamp
      ? eventData.startDate.toDate()
      : new Date(eventData.startDate);

  const eventEndDate =
    eventData.endDate instanceof Timestamp
      ? eventData.endDate.toDate()
      : new Date(eventData.endDate);

  const handleDelete = async () => {
    if (!id) {
      console.error("이벤트 ID가 없습니다.");
      return;
    }

    const confirmDelete = window.confirm(
      "정말로 이 이벤트를 삭제하시겠습니까?"
    );
    if (!confirmDelete) return;

    try {
      setIsLoading(true);
      const eventDocRef = doc(appFireStore, "events", id);
      await deleteDoc(eventDocRef);
      navigate("/");
    } catch (err) {
      console.error("이벤트 삭제 중 오류가 발생했습니다:", err);
      setError("이벤트 삭제 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  // 로그인 정보 가져오기
  const userDataFetch = async (
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
  return (
    <>
      <Header
        title="일정 상세"
        {...(eventData.eventType !== EventTypeEnum.HOLIDAY && {
          onEdit: () => navigate(`/calendarlist/${id}/edit`),
        })}
        {...(eventData.eventType !== EventTypeEnum.HOLIDAY && {
          onDelete: handleDelete,
        })}
      />
      <main>
        {eventData.eventType !== EventTypeEnum.HOLIDAY && (
          <div className={styles.writerContainer}>
            <span>작성자</span>
            {userData && userData.profileImg ? (
              <img
                src={userData.profileImg}
                alt="작성자 프로필"
                className={styles.profileImg}
              />
            ) : (
              <div className={styles.defaultProfileImg}>프로필 없음</div>
            )}
          </div>
        )}
        <div className={styles.titleContainer}>
          <div
            className={styles.listColor}
            style={{ backgroundColor: getEventColor(eventData.eventColor) }}
          ></div>
          <p>{eventData.title}</p>
        </div>
        <div className={styles.timeContainer}>
          <p>
            {formatEventPeriod(
              eventStartDate,
              eventEndDate,
              eventData.eventType
            )}
          </p>
        </div>
        {eventData.eventType !== EventTypeEnum.HOLIDAY && (
          <div className={styles.memoContainer}>
            <span>메모</span>
            <p className={styles.memoTextarea}>{eventData?.eventMemo || ""}</p>
          </div>
        )}
      </main>
    </>
  );
}

export default Detail;
