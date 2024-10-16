import React, { useEffect, useState } from "react";
import Header from "../../header/Header";
import styles from "../detail/detail.module.scss";
import { doc, DocumentData, getDoc, Timestamp } from "firebase/firestore";
import { useParams, useSearchParams } from "react-router-dom";
import { appFireStore } from "../../../firebase/config";
import { EventsData } from "../../../types";
import LabelTextarea from "../../inputs/textarea/LabelTextarea";
import Loader from "../../loader/Loader";

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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatEventPeriod = (startDate: Date, endDate: Date) => {
    if (isAllDayEvent(startDate, endDate)) {
      if (isSameDay(startDate, endDate)) {
        return formatDateFull(startDate);
      } else {
        return `${formatDateFull(startDate)} ~ ${formatDateFull(endDate)}`;
      }
    } else {
      const startFormatted = `${formatDateFull(startDate)} ${formatTime(
        startDate
      )}`;
      const endFormatted = isSameDay(startDate, endDate)
        ? formatTime(endDate)
        : `${formatDateFull(endDate)} ${formatTime(endDate)}`;
      return `${startFormatted} ~ ${endFormatted}`;
    }
  };

  function isSameDay(d1: Date, d2: Date) {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  const isAllDayEvent = (startDate: Date, endDate: Date) => {
    return (
      startDate.getHours() === 0 &&
      startDate.getMinutes() === 0 &&
      endDate.getHours() === 23 &&
      endDate.getMinutes() === 59
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

  console.log(eventData);
  console.log(eventData.eventMemo);

  return (
    <>
      <Header
        title="일정 상세"
        onEdit={() => console.log("편집")}
        onDelete={() => console.log("삭제")}
      />
      <main>
        <div>
          <span>작성자</span>
          <img src="" alt="작성자" />
        </div>
        <div>
          <div
            className={styles.listColor}
            style={{ backgroundColor: getEventColor(eventData.eventColor) }}
          ></div>
          <p>{eventData.title}</p>
        </div>
        <div>
          <p>{formatEventPeriod(eventStartDate, eventEndDate)}</p>
        </div>
        <div>
          <span>메모</span>
          <textarea value={eventData?.eventMemo || ""} readOnly></textarea>
        </div>
      </main>
    </>
  );
}

export default Detail;
