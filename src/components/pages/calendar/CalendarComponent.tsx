import Calendar from "react-calendar";
import styles from "./calendar.module.scss";
import { useDateStore } from "../../../store/useDateStore";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { useQuery } from "@tanstack/react-query";
import {
  calendarTodosFetch,
  eventsDataFetch,
  queryClient,
} from "../../../utils/http";
import {
  Fragment,
  MouseEvent,
  MouseEventHandler,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CalendarTodos, EventsData } from "../../../types";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import CreateModal from "../../createModal/CreateModal";
import { useNavigate } from "react-router-dom";
import { FaBars } from "react-icons/fa6";
import IconButton from "../../button/iconButton/IconButton";
import { useViewNavStore } from "../../../store/useViewNavStore";
import Navigation from "../../navigation/Navigation";
import { AiFillPlusCircle } from "react-icons/ai";
import { appAuth } from "../../../firebase/config";

import { FaPlus } from "react-icons/fa6";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

dayjs.extend(isBetween);

const CalendarComponent = () => {
  const [clickEventDate, setClickEventDate] = useState<Date | null>(null);
  const [isCreate, setIsCreate] = useState<boolean>(false);
  const navigate = useNavigate();
  const navRef = useRef<HTMLElement | null>(null);
  const { isView, toggleIsView } = useViewNavStore();
  const { date, setDate, prevMonth, nextMonth } = useDateStore();
  const eventsRef = useRef<HTMLSpanElement | null>(null);

  const { data: events } = useQuery({
    queryKey: [
      "events",
      appAuth.currentUser?.uid,
      date.getFullYear(),
      date.getMonth(),
    ],
    queryFn: () =>
      eventsDataFetch({
        year: date.getFullYear(),
        month: date.getMonth(),
        uid: appAuth.currentUser!.uid,
      }),
    enabled: !!appAuth.currentUser?.uid,
  });

  const { data: todos } = useQuery({
    queryKey: [
      "todos",
      date.getFullYear(),
      date.getMonth(),
      appAuth.currentUser?.uid,
    ],
    queryFn: () =>
      calendarTodosFetch({
        year: date.getFullYear(),
        month: date.getMonth(),
        uid: appAuth.currentUser!.uid,
      }),
    enabled: !!appAuth.currentUser?.uid,
  });

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
      queryKey: [
        "events",
        date.getFullYear(),
        nextMonth.getMonth(),
        appAuth.currentUser!.uid,
      ],
      queryFn: () =>
        eventsDataFetch({
          year: date.getFullYear(),
          month: nextMonth.getMonth(),
          uid: appAuth.currentUser!.uid,
        }),
      staleTime: Infinity,
    });

    queryClient.prefetchQuery({
      queryKey: [
        "events",
        date.getFullYear(),
        prevMonth.getMonth(),
        appAuth.currentUser?.uid,
      ],
      queryFn: () =>
        eventsDataFetch({
          year: date.getFullYear(),
          month: prevMonth.getMonth(),
          uid: appAuth.currentUser!.uid,
        }),
      staleTime: Infinity,
    });

    queryClient.prefetchQuery({
      queryKey: [
        "todos",
        date.getFullYear(),
        nextMonth.getMonth(),
        appAuth.currentUser!.uid,
      ],
      queryFn: () =>
        calendarTodosFetch({
          year: date.getFullYear(),
          month: nextMonth.getMonth(),
          uid: appAuth.currentUser!.uid,
        }),
      staleTime: Infinity,
    });

    queryClient.prefetchQuery({
      queryKey: [
        "todos",
        date.getFullYear(),
        prevMonth.getMonth(),
        appAuth.currentUser?.uid,
      ],
      queryFn: () =>
        calendarTodosFetch({
          year: date.getFullYear(),
          month: prevMonth.getMonth(),
          uid: appAuth.currentUser!.uid,
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
    todos,
  }: {
    date: Date;
    events: EventsData[];
    todos: CalendarTodos[];
  }) => {
    const assignedEvents = useMemo(() => sortAndAssignRows(events), [events]);

    const tileDate = dayjs(date);
    const eventsForTile = assignedEvents.filter(
      (event) =>
        tileDate.isSameOrAfter(dayjs.unix(event.startDate.seconds), "day") &&
        tileDate.isSameOrBefore(dayjs.unix(event.endDate.seconds), "day")
    );

    const todosForTile = todos.filter((todo) =>
      tileDate.isSame(dayjs(todo.todoDate), "day")
    );

    console.log(eventsForTile);

    let isMore = false;
    let eventsWrapHeight = 0;
    let index = 0;
    if (eventsRef.current) {
      eventsWrapHeight = eventsRef.current.clientHeight;
      console.log(eventsWrapHeight);
      if (eventsForTile.length * 25 >= eventsWrapHeight) {
        isMore = true;
      }

      index = Math.floor(eventsWrapHeight / 25);
    }

    return (
      <>
        <span
          className={`${styles.contentWrap}`}
          onClick={
            eventsForTile.length === 0
              ? (e: MouseEvent) => handleClickDate(e, date)
              : (e: MouseEvent) => handleNavigateToDetail(e, date)
          }
        >
          <span
            className={`${styles.tileDate}`}
            onClick={(e: MouseEvent<HTMLSpanElement>) =>
              handleClickDate(e, date)
            }
          >
            {tileDate.date()}
          </span>
          <span ref={eventsRef} className={`${styles.eventsWrap}`}>
            {eventsForTile.map((event) => {
              const { isStart, isFirstSunday } = tileCheckDate(tileDate, event);
              return (
                <Fragment key={event.id}>
                  <span
                    className={`${styles.events} ${styles[event.eventColor]} ${
                      index === event.row + 1 ? styles.more : ""
                    }`}
                    style={{
                      top: `${event.row * 25}px`,
                      display: `${
                        (event.row + 1) * 25 >= eventsWrapHeight && "none"
                      }`,
                      zIndex: 10 - event.row,
                    }}
                  >
                    <span
                      className={`${isFirstSunday || isStart ? "" : "sOnly"}`}
                    >
                      {event.title}
                    </span>
                    {isMore && <FaPlus className={styles.plus} />}
                  </span>
                </Fragment>
              );
            })}
            {dayjs(date).isSame(dayjs(clickEventDate)) && (
              <CreateModal
                params={`date=${dayjs(date).format("YYYY-MM-DD")}`}
              />
            )}
          </span>
        </span>
        <span
          className={styles.todoWrap}
          onClick={(e: MouseEvent<HTMLSpanElement>) =>
            handleClickTodo(e, date, eventsForTile, todosForTile)
          }
        >
          {todosForTile.map((el) => (
            <span key={el.id} className={styles.todo}>
              {"Todo"}
            </span>
          ))}
        </span>
      </>
    );
  };

  const handleClickTodo = (
    e: MouseEvent<HTMLSpanElement>,
    date: Date,
    eventsForTile: EventsData[],
    todosForTile: CalendarTodos[]
  ) => {
    e.preventDefault();
    if (todosForTile?.length !== 0) {
      navigate(`/todo?date=${dayjs(date).format("YYYY-MM-DD")}`);
    } else {
      if (eventsForTile?.length !== 0) {
        handleNavigateToDetail(e, date);
      } else {
        handleClickDate(e, date);
      }
    }
  };

  const handleClickDate = (e: MouseEvent, date: Date) => {
    e.stopPropagation();
    if (isCreate) setIsCreate(false);

    if (dayjs(date).isSame(dayjs(clickEventDate))) {
      setClickEventDate(null);
    } else {
      setClickEventDate(date);
    }
  };

  const handleNavigateToDetail = (e: MouseEvent, date: Date) => {
    e.stopPropagation();
    const seconds = Math.floor(date.getTime() / 1000);

    return navigate(`/calendarList?date=${seconds}`);
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

  // if (!appAuth.currentUser) {
  //   return <Loader />;
  // }

  return (
    <main className={styles.calendarWrap}>
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
          <TileContent
            date={date}
            events={(events as EventsData[]) || []}
            todos={(todos as CalendarTodos[]) || []}
          />
        )}
        formatDay={formatDay}
        calendarType="gregory"
        minDetail="month"
        showNavigation={false}
      />
    </main>
  );
};

export default CalendarComponent;
