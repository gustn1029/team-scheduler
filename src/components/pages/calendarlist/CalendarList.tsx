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
import { appAuth, appFireStore } from "../../../firebase/config";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AiFillPlusCircle } from "react-icons/ai";
import IconLinkButton from "../../button/iconButton/IconLinkButton";
import IconButton from "../../button/iconButton/IconButton";
import { useState } from "react";
import CreateModal from "../../createModal/CreateModal";
import { userDataFetch } from "../../../utils/http";

interface Event extends DocumentData {
  uid?: string;
  startDate: Timestamp;
  endDate: Timestamp;
  title: string;
  eventColor: string;
}

function CalendarList() {
  const [clickEventDate, setClickEventDate] = useState<Date | null>(null);
  const [isCreate, setIsCreate] = useState<boolean>(false);

  const { data: authData } = useQuery({
    queryKey: ["auth", appAuth.currentUser?.uid],
    queryFn: () => userDataFetch(appAuth.currentUser?.uid as string),
    enabled: !!appAuth.currentUser?.uid,
  });

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
      uid: doc.uid,
      ...doc.data(),
    })) as Event[];
    return events;
  };
  const [params] = useSearchParams();
  const dateParam = params.get("date");
  const date = new Date(Number(dateParam) * 1000);
  console.log(date);

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

  const profileImage = authData?.imageUrl || "default-profile-image-url";

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
          {Array.isArray(data) && data.length > 0 ? (
            data.map((event, index) => (
              <li key={`${event.uid || "event"}-${index}`}>
                <div className={styles.timeContainerIf}>
                  {new Date(event.startDate.seconds * 1000).getHours() === 0 &&
                  new Date(event.startDate.seconds * 1000).getMinutes() === 0 &&
                  new Date(event.endDate.seconds * 1000).getHours() === 23 &&
                  new Date(event.endDate.seconds * 1000).getMinutes() === 59 ? (
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
                {event.uid ? (
                  <img
                    className={styles.writerProfile}
                    src={profileImage}
                    alt="writerProfile"
                  />
                ) : (
                  ""
                )}
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
