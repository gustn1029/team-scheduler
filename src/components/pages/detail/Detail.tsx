import React, { useEffect, useState } from "react";
import Header from "../../header/Header";
import styles from "../detail/detail.module.scss";
import { deleteDoc, doc, getDoc, Timestamp } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { appFireStore } from "../../../firebase/config";
import { EventsData } from "../../../types";
import Loader from "../../loader/Loader";
import { EventTypeEnum } from "../../../types/enum/EventTypeEnum";
import dayjs from "dayjs";

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
          console.log(`데이터 가져옴`);
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

  const getEventColor = (colorName: EventColor | string): string => {
    return colorName in colorMap
      ? colorMap[colorName as EventColor]
      : colorName;
  };

  const formatDateFull = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const weekDay = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
    return `${year}.${month}.${day} (${weekDay})`;
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
      console.log("이벤트가 성공적으로 삭제되었습니다.");
      navigate("/");
    } catch (err) {
      console.error("이벤트 삭제 중 오류가 발생했습니다:", err);
      setError("이벤트 삭제 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <Header
        title="일정 상세"
        onEdit={() => navigate("/calendarlist/:id/edit")}
        onDelete={handleDelete}
      />
      <main>
        {EventTypeEnum.HOLIDAY ? (
          ""
        ) : (
          <div>
            <span>작성자</span>
            <img src="" alt="작성자" />
          </div>
        )}
        <div>
          <div
            className={styles.listColor}
            style={{ backgroundColor: getEventColor(eventData.eventColor) }}
          ></div>
          <p>{eventData.title}</p>
        </div>
        <div>
          <p>
            {formatEventPeriod(
              eventStartDate,
              eventEndDate,
              eventData.eventType
            )}
          </p>
        </div>
        {eventData.eventType !== EventTypeEnum.HOLIDAY && (
          <div>
            <span>메모</span>
            <textarea value={eventData?.eventMemo || ""} readOnly></textarea>
          </div>
        )}
      </main>
    </>
  );
}

export default Detail;
