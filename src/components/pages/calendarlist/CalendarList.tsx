import { useState, useMemo } from "react";
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
import { appAuth, appFireStore } from "../../../firebase/config";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AiFillPlusCircle } from "react-icons/ai";
import IconLinkButton from "../../button/iconButton/IconLinkButton";
import IconButton from "../../button/iconButton/IconButton";
import CreateModal from "../../createModal/CreateModal";
import { userDataFetch } from "../../../utils/http";
import dayjs from "dayjs";
import Loader from "../../loader/Loader";
import { EventTypeEnum } from "../../../types/enum/EventTypeEnum";

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
  id: string;
  startDate: Timestamp;
  endDate: Timestamp;
  title: string;
  eventColor: EventColor | string;
}

interface UserData {
  profileImg: string | undefined;
}

function CalendarList() {
  const [isCreate, setIsCreate] = useState<boolean>(false);

  async function fetchHolidays(date: Date): Promise<Event[]> {
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
    const userCollection = collection(appFireStore, "events");
    const startTimestamp = Timestamp.fromDate(startOfDay);
    const endTimestamp = Timestamp.fromDate(endOfDay);

    const q = query(
      userCollection,
      where("startDate", ">=", startTimestamp),
      where("startDate", "<=", endTimestamp),
      where("eventType", "==", EventTypeEnum.HOLIDAY)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      uid: "",
      ...doc.data(),
    })) as Event[];
  }

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

    const eventsRef = collection(appFireStore, "events");

    const endTimestamp = Timestamp.fromDate(endOfDay);
    const startTimestamp = Timestamp.fromDate(startOfDay);
    const uid = appAuth.currentUser?.uid;

    const q = query(
      eventsRef,
      where("uid", "==", uid),
      where("startDate", "<=", endTimestamp),
      where("endDate", ">=", startTimestamp),
      orderBy("startDate")
    );

    const querySnapshot = await getDocs(q);

    const holidays = await fetchHolidays(date);

    const events = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Event[];
    return [...holidays, ...events];
  };

  const [params] = useSearchParams();
  const dateParam = params.get("date");
  const date = new Date(Number(dateParam) * 1000);

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

  const sortedEvents = useMemo(() => {
    if (!events) return [];
    return events.sort((a, b) => {
      if (a.uid === "" && b.uid !== "") return -1;
      if (a.uid !== "" && b.uid === "") return 1;

      return a.startDate.seconds - b.startDate.seconds;
    });
  }, [events]);

  const weekDay = ["일", "월", "화", "수", "목", "금", "토"];

  const handleCreateBtn = () => {
    setIsCreate((prevState) => !prevState);
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

  console.log(sortedEvents);

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
            right={30}
          />
        )}
      </header>
      <main className={styles.calendarListMain}>
        <ul>
          {eventsLoading ? (
            <Loader />
          ) : sortedEvents.length > 0 ? (
            sortedEvents.map((event, index) => (
              <li
                key={`${event.id || "event"}-${index}`}
                className={styles.liContainer}
              >
                <Link
                  to={`/calendarlist/${event.id}`}
                  className={styles.textContainer}
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
                </Link>
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
            <li></li>
          )}
        </ul>
      </main>
    </>
  );
}

export default CalendarList;
