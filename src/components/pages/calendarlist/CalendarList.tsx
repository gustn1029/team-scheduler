import { RiCloseFill } from "react-icons/ri";
import styles from "./calendarlist.module.scss";
import {
  collection,
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

function CalendarList() {
  const eventsOfDayFetch = async (date: Date) => {
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
      id: doc.id,
      ...doc.data(),
    }));
    return events;
  };
  const [params] = useSearchParams();
  const dateParam = params.get("date");
  const date = new Date(Number(dateParam) * 1000);
  console.log(date);

  const { data } = useQuery({
    queryKey: ["events", dateParam],
    queryFn: () => eventsOfDayFetch(date),
    enabled: !!dateParam,
  });

  console.log(data);

  const weekDay = ["일", "월", "화", "수", "목", "금", "토"];

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
        <IconLinkButton
          icon={<AiFillPlusCircle className={styles.createBtn} />}
          href={"/create"}
        />
      </header>
      <main className={styles.calendarListMain}>
        <ul>
          {Array.isArray(data) ? (
            data.map((event) => (
              <li key={event.id}>
                <div className={styles.timeContainer}>
                  {new Date(event.startDate.seconds * 1000).getHours() === 0 &&
                  new Date(event.startDate.seconds * 1000).getMinutes() === 0 &&
                  new Date(event.endDate.seconds * 1000).getHours() === 23 &&
                  new Date(event.endDate.seconds * 1000).getMinutes() === 59 ? (
                    <p className={styles.allDay}>종일</p>
                  ) : (
                    <p>
                      {new Date(
                        event.startDate.seconds * 1000
                      ).toLocaleTimeString("ko-KR", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                      <br />
                      {new Date(
                        event.endDate.seconds * 1000
                      ).toLocaleTimeString("ko-KR", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </p>
                  )}
                </div>
                <div className={styles.listColor}></div>
                <div className={styles.scheduleContainer}>
                  <p>{event.title}</p>
                </div>
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
