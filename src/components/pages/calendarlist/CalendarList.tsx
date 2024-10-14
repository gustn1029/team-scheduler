import { RiCloseFill } from "react-icons/ri";
import styles from "./calendarlist.module.scss";
import {
  collection,
  DocumentData,
  getDocs,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { appFireStore } from "../../../firebase/config";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AiFillPlusCircle } from "react-icons/ai";
import IconLinkButton from "../../button/iconButton/IconLinkButton";
import IconButton from "../../button/iconButton/IconButton";
import { useState } from "react";
import CreateModal from "../../createModal/CreateModal";
import { userDataFetch } from "../../../utils/http";
import { getAuth } from "firebase/auth";
import dayjs from "dayjs";

type EventColor =
  | "red"
  | "pink"
  | "orange"
  | "yellow"
  | "mint"
  | "blue"
  | "gray";

interface Event extends DocumentData {
  uid: string;
  startDate: Timestamp;
  endDate: Timestamp;
  title: string;
  eventColor: EventColor | string;
}

interface UserData {
  profileImg: string | undefined;
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
    const auth = getAuth();
    const uid = auth.currentUser?.uid;

    const eventsRef = collection(appFireStore, "events");

    const q = query(
      eventsRef,
      where("uid", "==", uid),
      where("startDate", "<=", endTimestamp),
      where("endDate", ">=", startTimestamp),
      orderBy("startDate")
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

  const navigate = useNavigate();

  const handleEventClick = () => {
    navigate("*");
  };

  const isAllDayEvent = (event: Event, selectedDate: Date) => {
    const startDate = new Date(event.startDate.seconds * 1000);
    const endDate = new Date(event.endDate.seconds * 1000);
    const selectedDateStart = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate()
    );
    const selectedDateEnd = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      23,
      59,
      59
    );

    const isFullDay =
      startDate.getHours() === 0 &&
      startDate.getMinutes() === 0 &&
      endDate.getHours() === 23 &&
      endDate.getMinutes() === 59;

    const isMultiDayEvent =
      startDate < selectedDateStart && endDate > selectedDateEnd;

    return isFullDay || isMultiDayEvent;
  };

  const colorMap: Record<EventColor, string> = {
    red: "#F5333F",
    pink: "#FB91A3",
    orange: "#FF9E18",
    yellow: "#FFD235",
    mint: "#00B392",
    blue: "#3FA9F5",
    gray: "#7BA0C4",
  };

  const getEventColor = (colorName: EventColor | string): string => {
    return colorName in colorMap
      ? colorMap[colorName as EventColor]
      : colorName;
  };
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
        {isCreate && (
          <CreateModal
            params={`date=${dayjs(date).format("YYYY-MM-DD")}`}
            top={40}
            left={260}
          />
        )}
      </header>
      <main className={styles.calendarListMain}>
        <ul>
          {eventsLoading ? (
            <li>Loading...</li>
          ) : Array.isArray(events) && events.length > 0 ? (
            events.map((event, index) => (
              <li
                key={`${event.uid || "event"}-${index}`}
                className={styles.liContainer}
              >
                <div
                  className={styles.textContainer}
                  onClick={() => handleEventClick()}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.timeContainerIf}>
                    {isAllDayEvent(event, date) ? (
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
                    style={{ backgroundColor: getEventColor(event.eventColor) }}
                  ></div>
                  <div className={styles.scheduleContainer}>
                    <p>{event.title}</p>
                  </div>
                </div>
                {event.uid && usersData && usersData[event.uid] ? (
                  <img
                    className={styles.writerProfile}
                    src={usersData[event.uid].profileImg}
                    alt="작성자"
                  />
                ) : null}
              </li>
            ))
          ) : (
            <li>No events found</li>
          )}
        </ul>
      </main>
    </>
  );
}

export default CalendarList;
