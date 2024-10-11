import { RiCloseFill } from "react-icons/ri";
import styles from "./calendarlist.module.scss";
import {
  collection,
  DocumentData,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { appFireStore } from "../../../firebase/config";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AiFillPlusCircle } from "react-icons/ai";
import IconLinkButton from "../../button/iconButton/IconLinkButton";
import IconButton from "../../button/iconButton/IconButton";
import { useState } from "react";
import CreateModal from "../../createModal/CreateModal";
import { userDataFetch } from "../../../utils/http";

interface Event extends DocumentData {
  uid: string;
  startDate: Timestamp;
  endDate: Timestamp;
  title: string;
  eventColor: string;
}

interface UserData {
  imageUrl: string;
}

function CalendarList() {
  const [clickEventDate, setClickEventDate] = useState<Date | null>(null);
  const [isCreate, setIsCreate] = useState<boolean>(false);

  const eventsOfDayFetch = async (date: Date): Promise<Event[]> => {
    const startOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      0,
      0,
      0
    );
    const endOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59
    );

    const startTimestamp = Timestamp.fromDate(startOfDay);
    const endTimestamp = Timestamp.fromDate(endOfDay);

    const eventsRef = collection(appFireStore, "events");
    const q = query(
      eventsRef,
      where("startDate", "<=", endTimestamp),
      where("endDate", ">=", startTimestamp)
    );

    const querySnapshot = await getDocs(q);
    const events = querySnapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    })) as Event[];
    return events;
  };
  const [params] = useSearchParams();
  const dateParam = params.get("date");
  const date = new Date(Number(dateParam) * 1000);
  console.log(date);

  const { data: events, isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["events", dateParam],
    queryFn: () => eventsOfDayFetch(date),
    enabled: !!dateParam,
  });

  // 모든 고유한 uid에 대한 사용자 데이터를 가져오는 쿼리
  const { data: usersData } = useQuery<Record<string, UserData>>({
    queryKey: ["users", events],
    queryFn: async () => {
      if (!events) return {};
      const uniqueUids = [
        ...new Set(events.map((event) => event.uid).filter(Boolean)),
      ];
      const userData = await Promise.all(
        uniqueUids.map(async (uid) => {
          const data = await userDataFetch(uid);
          return [uid, data];
        })
      );
      return Object.fromEntries(userData);
    },
    enabled: !!events && events.length > 0,
  });

  const { data } = useQuery<Event[]>({
    queryKey: ["events", dateParam],
    queryFn: () => eventsOfDayFetch(date),
    enabled: !!dateParam,
  });

  console.log(data);

  const weekDay = ["일", "월", "화", "수", "목", "금", "토"];

  const handleCreateBtn = () => {
    if (clickEventDate) setClickEventDate(null);
    setIsCreate((prevState) => !prevState);
  };

  // const profileImage = authData?.imageUrl || "default-profile-image-url";

  return (
    <>
      <header className={styles.calendarListHeader}>
        <IconLinkButton
          icon={<RiCloseFill className={styles.closeButton} />}
          href={"/"}
        />
        <p>{`${date.getMonth() + 1}월 ${date.getDate()}일 ${
          weekDay[date.getDay()]
        }요일`}</p>
        <IconButton
          icon={<AiFillPlusCircle className={styles.createBtn} />}
          onClick={handleCreateBtn}
        />
        {isCreate && <CreateModal top={40} left={210} />}
      </header>
      <main className={styles.calendarListMain}>
        <ul>
          {eventsLoading ? (
            <li key="loading">데이터를 불러오는 중...</li>
          ) : Array.isArray(events) && events.length > 0 ? (
            events.map((event, index) => (
              <li key={`${event.uid || "event"}-${index}`}>
                <div className="liContainer">
                  <div className={styles.timeContainerIf}>
                    {new Date(event.startDate.seconds * 1000).getHours() ===
                      0 &&
                    new Date(event.startDate.seconds * 1000).getMinutes() ===
                      0 &&
                    new Date(event.endDate.seconds * 1000).getHours() === 23 &&
                    new Date(event.endDate.seconds * 1000).getMinutes() ===
                      59 ? (
                      <p className={styles.allDay}>종일</p>
                    ) : (
                      <div className={styles.timeContainer}>
                        <p>
                          {new Date(
                            event.startDate.seconds * 1000
                          ).toLocaleTimeString("ko-KR", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                        </p>
                        <p>
                          {new Date(
                            event.endDate.seconds * 1000
                          ).toLocaleTimeString("ko-KR", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                  <div
                    className={styles.listColor}
                    style={{ backgroundColor: event.eventColor }}
                  ></div>
                  <div className={styles.scheduleContainer}>
                    <p>{event.title}</p>
                  </div>
                </div>
                {event.uid && usersData && usersData[event.uid] ? (
                  <img
                    className={styles.writerProfile}
                    src={usersData[event.uid].imageUrl}
                    alt="작성자"
                  />
                ) : null}
              </li>
            ))
          ) : (
            <li key="no-events">일정이 없습니다.</li>
          )}
        </ul>
      </main>
    </>
  );
}

export default CalendarList;
