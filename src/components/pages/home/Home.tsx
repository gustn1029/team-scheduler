import Calendar from "react-calendar";
import styles from "./home.module.scss";
import { useDateStore } from "../../../store/useDateStore";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { useQuery } from "@tanstack/react-query";
import { eventsDataFetch, queryClient } from "../../../utils/http";
import {
  Fragment,
  MouseEventHandler,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { EventsData } from "../../../types";
import { EventTypeEnum } from "../../../types/enum/EventTypeEnum";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import CreateModal from "../../createModal/CreateModal";
import { useNavigate } from "react-router-dom";
import { FaBars } from "react-icons/fa6";
import IconButton from "../../button/iconButton/IconButton";
import { useViewNavStore } from "../../../store/useViewNavStore";
import Navigation from "../../navigation/Navigation";
import { AiFillPlusCircle } from "react-icons/ai";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

dayjs.extend(isBetween);

const Home = () => {
  const [clickEventDate, setClickEventDate] = useState<Date | null>(null);
  const [isCreate, setIsCreate] = useState<boolean>(false);
  const navigate = useNavigate();
  const navRef = useRef<HTMLElement | null>(null);
  const { isView, toggleIsView } = useViewNavStore();
  const { date, setDate, prevMonth, nextMonth } = useDateStore();
  const { data: events } = useQuery({
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
            seconds: new Date(2024, 9, 14).getTime() / 1000,
            nanoseconds: 0,
          },
          endDate: {
            seconds: new Date(2024, 9, 16).getTime() / 1000,
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
            seconds: new Date(2024, 9, 16).getTime() / 1000,
            nanoseconds: 0,
          },
          endDate: {
            seconds: new Date(2024, 9, 21).getTime() / 1000,
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
            seconds: new Date(2024, 9, 14).getTime() / 1000,
            nanoseconds: 0,
          },
          endDate: {
            seconds: new Date(2024, 9, 14).getTime() / 1000,
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
            seconds: new Date(2024, 9, 19).getTime() / 1000,
            nanoseconds: 0,
          },
          endDate: {
            seconds: new Date(2024, 9, 19).getTime() / 1000,
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
            seconds: new Date(2024, 9, 17).getTime() / 1000,
            nanoseconds: 0,
          },
          endDate: {
            seconds: new Date(2024, 9, 17).getTime() / 1000,
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
            seconds: new Date(2024, 9, 18).getTime() / 1000,
            nanoseconds: 0,
          },
          endDate: {
            seconds: new Date(2024, 9, 18).getTime() / 1000,
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
            seconds: new Date(2024, 9, 19).getTime() / 1000,
            nanoseconds: 0,
          },
          endDate: {
            seconds: new Date(2024, 9, 19).getTime() / 1000,
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
            seconds: new Date(2024, 9, 15).getTime() / 1000,
            nanoseconds: 0,
          },
          endDate: {
            seconds: new Date(2024, 9, 15).getTime() / 1000,
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
      staleTime: Infinity,
    });

    queryClient.prefetchQuery({
      queryKey: ["events", date.getFullYear(), prevMonth.getMonth()],
      queryFn: () =>
        eventsDataFetch({
          year: date.getFullYear(),
          month: prevMonth.getMonth(),
        }),
      staleTime: Infinity,
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

    if (tileDate.isSame(dayjs(clickEventDate))) {
      return styles.clickedDay;
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

  const getCenterDate = (startDate: dayjs.Dayjs, endDate: dayjs.Dayjs) => {
    const diffDays = endDate.diff(startDate, "day");
    return startDate.add(Math.floor(diffDays / 2), "day");
  };

  const tileCheckDate = (tileDate: dayjs.Dayjs, event: EventsData) => {
    const startDate = dayjs.unix(event.startDate.seconds);
    const isStart = tileDate.isSame(startDate, "day");
    const isSunday = tileDate.day() === 0;
    const isFirstSunday =
      isSunday &&
      tileDate.isSameOrAfter(startDate, "day") &&
      (tileDate.isSame(startDate, "day") || tileDate.day(0).isAfter(startDate));
    const endDate = dayjs.unix(event.endDate.seconds);
    const isEnd = tileDate.isSame(endDate, "day");
    const centerDate = getCenterDate(startDate, endDate);
    const isCenter = tileDate.isSame(centerDate, "day");

    return {
      startDate,
      endDate,
      centerDate,
      isStart,
      isEnd,
      isSunday,
      isFirstSunday,
      isCenter,
    };
  };

  const TileContent = ({
    date,
    events,
  }: {
    date: Date;
    events: EventsData[];
  }) => {
    const assignedEvents = useMemo(() => sortAndAssignRows(events), [events]);

    const tileDate = dayjs(date);
    const eventsForTile = assignedEvents.filter(
      (event) =>
        tileDate.isSameOrAfter(dayjs.unix(event.startDate.seconds), "day") &&
        tileDate.isSameOrBefore(dayjs.unix(event.endDate.seconds), "day")
    );

    return (
      <div
        className={`${styles.contentWrap}`}
        onClick={
          eventsForTile.length === 0
            ? () => handleClickDate(date)
            : () => handleNavigateToDetail(date)
        }
      >
        <span
          className={`${styles.tileDate}`}
          onClick={() => handleClickDate(date)}
        >
          {tileDate.date()}
        </span>
        <div className={`${styles.eventsWrap}`}>
          {eventsForTile.map((event) => {
            const { isStart, isFirstSunday } = tileCheckDate(tileDate, event);
            return (
              <Fragment key={event.id}>
                <div
                  className={`${styles.events} ${styles[event.eventColor]}`}
                  style={{
                    top: `${event.row * 25}px`,
                    display: `${event.row > 2 && "none"}`,
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
          {dayjs(date).isSame(dayjs(clickEventDate)) && <CreateModal params={`date=${dayjs(date).format("YYYY-MM-DD")}`} />}
        </div>
      </div>
    );
  };

  const handleClickDate = (date: Date) => {
    if (isCreate) setIsCreate(false);

    if (dayjs(date).isSame(dayjs(clickEventDate))) {
      setClickEventDate(null);
    } else {
      setClickEventDate(date);
    }
  };

  const handleNavigateToDetail = (date: Date) => {
    const seconds = Math.floor(date.getTime() / 1000);

    return navigate(`/detail-list?date=${seconds}`);
  };

  const handleCreateBtn = () => {
    if (clickEventDate) setClickEventDate(null);

    setIsCreate((prevState) => !prevState);
  };

  const handleHideNav: MouseEventHandler<HTMLElement> = (e) => {
    if (!navRef.current) return;

    if (navRef.current === e.target) {
      toggleIsView();
    }
  };

  const handleViewNav = () => {
    if (isCreate) {
      setIsCreate(false);
    }

    toggleIsView();
  };

  return (
    <div className={styles.calendarWrap}>
      <section
        className={`${styles.navWrap} ${isView ? styles.view : styles.hidden}`}
        onClick={handleHideNav}
        ref={navRef}
      >
        <Navigation />
      </section>
      <section className={styles.header}>
        <div>
          <IconButton
            icon={<FaBars className={styles.navBtn} />}
            onClick={handleViewNav}
          />
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
        <IconButton
          icon={<AiFillPlusCircle className={styles.createBtn} />}
          onClick={handleCreateBtn}
        />
        {isCreate && <CreateModal bottom={-65} right={25} />}
      </section>
      <Calendar
        className={styles.calendar}
        next2Label={null}
        prev2Label={null}
        activeStartDate={date}
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
