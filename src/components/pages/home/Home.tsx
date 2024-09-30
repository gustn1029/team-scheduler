import Calendar from "react-calendar";
import styles from "./home.module.scss";
import { useDateStore } from "../../../store/useDateStore";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { useQuery } from "@tanstack/react-query";
import { eventsDataFetch, queryClient } from "../../../utils/http";
import { Fragment, useEffect, useMemo } from "react";
import { EventsData } from "../../../types";
import { EventTypeEnum } from "../../../types/enum/EventTypeEnum";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
// import { FaPlus } from "react-icons/fa";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

dayjs.extend(isBetween);

const Home = () => {
  const { date, setDate, prevMonth, nextMonth } = useDateStore();
  const {
    data: events,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["events", date.getFullYear(), date.getMonth()],
    queryFn: () =>
      eventsDataFetch({ year: date.getFullYear(), month: date.getMonth() }),
    staleTime: 5 * 60 * 1000,
  });

  const DUMMY_DATA: EventsData[] = events
    ? [
        ...(events as EventsData[]),
        {
          id: "1",
          title: "event1",
          eventColor: "red",
          eventType: EventTypeEnum.EVENTS,
          eventMemo: "",
          startDate: {
            seconds: new Date(2024, 8, 14).getTime() / 1000,
            nanoseconds: 0,
          },
          endDate: {
            seconds: new Date(2024, 8, 20).getTime() / 1000,
            nanoseconds: 0,
          },
          createDate: new Date(),
          todos: [],
          category: [],
          comments: [],
          like: 0,
          updateDate: null,
        },
        {
          id: "2",
          title: "event2",
          eventColor: "orange",
          eventType: EventTypeEnum.EVENTS,
          eventMemo: "",
          startDate: {
            seconds: new Date(2024, 8, 14).getTime() / 1000,
            nanoseconds: 0,
          },
          endDate: {
            seconds: new Date(2024, 8, 16).getTime() / 1000,
            nanoseconds: 0,
          },
          createDate: new Date(),
          todos: [],
          category: [],
          comments: [],
          like: 0,
          updateDate: null,
        },
        {
          id: "13",
          title: "event3",
          eventColor: "blue",
          eventType: EventTypeEnum.EVENTS,
          eventMemo: "",
          startDate: {
            seconds: new Date(2024, 8, 16).getTime() / 1000,
            nanoseconds: 0,
          },
          endDate: {
            seconds: new Date(2024, 8, 21).getTime() / 1000,
            nanoseconds: 0,
          },
          createDate: new Date(),
          todos: [],
          category: [],
          comments: [],
          like: 0,
          updateDate: null,
        },
        {
          id: "4",
          title: "event4",
          eventColor: "gray",
          eventType: EventTypeEnum.EVENTS,
          eventMemo: "",
          startDate: {
            seconds: new Date(2024, 8, 14).getTime() / 1000,
            nanoseconds: 0,
          },
          endDate: {
            seconds: new Date(2024, 8, 14).getTime() / 1000,
            nanoseconds: 0,
          },
          createDate: new Date(),
          todos: [],
          category: [],
          comments: [],
          like: 0,
          updateDate: null,
        },
        {
          id: "5",
          title: "event5",
          eventColor: "pink",
          eventType: EventTypeEnum.EVENTS,
          eventMemo: "",
          startDate: {
            seconds: new Date(2024, 8, 19).getTime() / 1000,
            nanoseconds: 0,
          },
          endDate: {
            seconds: new Date(2024, 8, 19).getTime() / 1000,
            nanoseconds: 0,
          },
          createDate: new Date(),
          todos: [],
          category: [],
          comments: [],
          like: 0,
          updateDate: null,
        },
        {
          id: "6",
          title: "event6",
          eventColor: "yellow",
          eventType: EventTypeEnum.EVENTS,
          eventMemo: "",
          startDate: {
            seconds: new Date(2024, 8, 17).getTime() / 1000,
            nanoseconds: 0,
          },
          endDate: {
            seconds: new Date(2024, 8, 17).getTime() / 1000,
            nanoseconds: 0,
          },
          createDate: new Date(),
          todos: [],
          category: [],
          comments: [],
          like: 0,
          updateDate: null,
        },
        {
          id: "7",
          title: "event7",
          eventColor: "orange",
          eventType: EventTypeEnum.EVENTS,
          eventMemo: "",
          startDate: {
            seconds: new Date(2024, 8, 18).getTime() / 1000,
            nanoseconds: 0,
          },
          endDate: {
            seconds: new Date(2024, 8, 18).getTime() / 1000,
            nanoseconds: 0,
          },
          createDate: new Date(),
          todos: [],
          category: [],
          comments: [],
          like: 0,
          updateDate: null,
        },
        {
          id: "8",
          title: "event8",
          eventColor: "pink",
          eventType: EventTypeEnum.EVENTS,
          eventMemo: "",
          startDate: {
            seconds: new Date(2024, 8, 19).getTime() / 1000,
            nanoseconds: 0,
          },
          endDate: {
            seconds: new Date(2024, 8, 19).getTime() / 1000,
            nanoseconds: 0,
          },
          createDate: new Date(),
          todos: [],
          category: [],
          comments: [],
          like: 0,
          updateDate: null,
        },
        {
          id: "9",
          title: "event9",
          eventColor: "mint",
          eventType: EventTypeEnum.EVENTS,
          eventMemo: "",
          startDate: {
            seconds: new Date(2024, 8, 15).getTime() / 1000,
            nanoseconds: 0,
          },
          endDate: {
            seconds: new Date(2024, 8, 15).getTime() / 1000,
            nanoseconds: 0,
          },
          createDate: new Date(),
          todos: [],
          category: [],
          comments: [],
          like: 0,
          updateDate: null,
        },
        {
          id: "10",
          title: "event10",
          eventColor: "yellow",
          eventType: EventTypeEnum.SECTION,
          eventMemo: "",
          startDate: {
            seconds: new Date(2024, 8, 17).getTime() / 1000,
            nanoseconds: 0,
          },
          endDate: {
            seconds: new Date(2024, 8, 22).getTime() / 1000,
            nanoseconds: 0,
          },
          createDate: new Date(),
          todos: [],
          category: [],
          comments: [],
          like: 0,
          updateDate: null,
        },
      ]
    : [];

  console.log(DUMMY_DATA);

  useEffect(() => {
    const sessionSavedDate = sessionStorage.getItem("currentDate");
    if (sessionSavedDate) {
      const currentDate = JSON.parse(sessionSavedDate);
      console.log(currentDate);
      setDate(new Date(currentDate.date));
    }
  }, [setDate]);

  useEffect(() => {
    const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    const prevMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1);

    queryClient.prefetchQuery({
      queryKey: ["events", date.getFullYear(), nextMonth.getMonth()],
      queryFn: () =>
        eventsDataFetch({
          year: date.getFullYear(),
          month: nextMonth.getMonth(),
        }),
    });

    queryClient.prefetchQuery({
      queryKey: ["events", date.getFullYear(), prevMonth.getMonth()],
      queryFn: () =>
        eventsDataFetch({
          year: date.getFullYear(),
          month: prevMonth.getMonth(),
        }),
    });
  }, [date]);

  const sortAndAssignRows = (events: EventsData[]) => {
    const sortedEvents = events.sort((a, b) => {
      if (a.startDate.seconds === b.startDate.seconds) {
        return (
          b.endDate.seconds -
          b.startDate.seconds -
          (a.endDate.seconds - a.startDate.seconds)
        );
      }
      return a.startDate.seconds - b.startDate.seconds;
    });

    const assignedEvents: (EventsData & { row: number })[] = [];

    sortedEvents.forEach((event) => {
      let row = 0;
      while (true) {
        const conflict = assignedEvents.some(
          (assignedEvent) =>
            row === assignedEvent.row &&
            !(
              dayjs
                .unix(event.startDate.seconds)
                .isAfter(dayjs.unix(assignedEvent.endDate.seconds)) ||
              dayjs
                .unix(event.endDate.seconds)
                .isBefore(dayjs.unix(assignedEvent.startDate.seconds))
            )
        );
        if (!conflict) {
          assignedEvents.push({ ...event, row });
          break;
        }
        row++;
      }
    });

    return assignedEvents; // 여기서 필터링 및 정렬된 이벤트를 반환
  };

  const tileClassName = ({
    date,
  }: {
    date: Date;
    view: string;
  }): string | null => {
    const today = dayjs();
    const tileDate = dayjs(date);

    if (tileDate.isSame(today, "day")) {
      return styles.currentDay;
    }
    if (tileDate.day() === 6) {
      return styles.saturday;
    }
    if (tileDate.day() === 0) {
      return styles.sunday;
    }

    return "";
  };

  const formatDate = (date: Date): string => {
    return `${date.getFullYear()}년 ${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}월`;
  };

  const formatDay = (locale: string | undefined, date: Date) => {
    return date.getDate().toString();
  };

  const TileContent = ({
    date,
    events,
  }: {
    date: Date;
    events: EventsData[];
  }) => {
    const filteredTypeEvents = events.filter(
      (el) => el.eventType !== EventTypeEnum.SECTION
    );
    const assignedEvents = useMemo(
      () => sortAndAssignRows(filteredTypeEvents),
      [filteredTypeEvents]
    );

    // const filteredSectionEvents = events.filter(
    //   (el) => el.eventType === EventTypeEnum.SECTION
    // );
    // const sectionEvents = useMemo(
    //   () => sortAndAssignRows(filteredSectionEvents),
    //   [filteredSectionEvents]
    // );

    const tileDate = dayjs(date);
    const eventsForTile = assignedEvents.filter(
      (event) =>
        tileDate.isSameOrAfter(dayjs.unix(event.startDate.seconds), "day") &&
        tileDate.isSameOrBefore(dayjs.unix(event.endDate.seconds), "day")
    );

    console.log(eventsForTile);

    return (
      <>
        <div className={`${styles.eventsWrap}`}>
          {eventsForTile.map((event) => {
            const startDate = dayjs.unix(event.startDate.seconds);
            const isStart = tileDate.isSame(startDate, "day");
            const isSunday = tileDate.day() === 0;
            const isFirstSunday =
              isSunday &&
              tileDate.isSameOrAfter(startDate, "day") &&
              (tileDate.isSame(startDate, "day") ||
                tileDate.day(0).isAfter(startDate));
            return (
              <Fragment key={event.id}>
                <div
                  className={`${styles.events} ${styles[event.eventColor]}`}
                  style={{
                    top: `${event.row * 25}px`,
                    zIndex: 10 - event.row,
                  }}
                >
                  <p className={`${isFirstSunday || isStart ? "" : "sOnly"}`}>
                    {event.title}
                  </p>
                </div>
                {/* {i > 2 && <FaPlus className={styles.plus} />} */}
              </Fragment>
            );
          })}
        </div>
        {/* <div>
          {sectionEvents.map((el) => {
            return <div key={`${el.title}_section`} className={`${styles.sections}`}>{el.title}</div>
          })}
        </div> */}
      </>
    );
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>{error.message}</div>;
  }

  return (
    <div className={styles.calendarWrap}>
      <div className={styles.navigation}>
        <span className={styles.currentDate}>{formatDate(date)}</span>
        <div className={styles.btnWrap}>
          <button
            className={`${styles.btn} ${styles.prevBtn}`}
            onClick={prevMonth}
          >
            이전
          </button>
          <button
            className={`${styles.btn} ${styles.nextBtn}`}
            onClick={nextMonth}
          >
            다음
          </button>
        </div>
      </div>
      <Calendar
        className={styles.calendar}
        next2Label={null}
        prev2Label={null}
        value={date}
        onChange={(newDate) => setDate(newDate as Date)}
        tileClassName={tileClassName}
        tileContent={({ date }) => (
          <TileContent date={date} events={DUMMY_DATA as EventsData[]} />
        )}
        formatDay={formatDay}
        calendarType="gregory"
        minDetail="month"
        showNavigation={false}
      />
    </div>
  );
};

export default Home;
