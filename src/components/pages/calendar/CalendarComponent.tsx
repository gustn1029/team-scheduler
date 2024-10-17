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
import { Timestamp } from "firebase/firestore";

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

  // 현재 월의 이벤트 데이터를 가져오는 쿼리
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

  // 현재 월의 할 일 데이터를 가져오는 쿼리
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

  // 세션 스토리지에서 저장된 날짜 정보를 불러와 상태를 설정
  useEffect(() => {
    const sessionSavedDate = sessionStorage.getItem("currentDate");
    if (sessionSavedDate) {
      const currentDate = JSON.parse(sessionSavedDate);
      setDate(new Date(currentDate.date));
    }
  }, [setDate]);

  // 이전 달과 다음 달의 이벤트와 할 일 데이터를 미리 가져오기
  useEffect(() => {
    const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    const prevMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1);

    // 다음 달 이벤트 prefetch
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

    // 이전 달 이벤트 prefetch
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

    // 다음 달 할 일 prefetch
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

    // 이전 달 할 일 prefetch
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

  /**
   * 주어진 날짜가 Timestamp 타입인지 확인하는 타입 가드 함수
   */
  function isTimestamp(date: Date | Timestamp): date is Timestamp {
    return (date as Timestamp).seconds !== undefined;
  }

  /**
   * Date 또는 Timestamp를 dayjs 객체로 변환하는 함수
   */
  function toDayjs(date: Date | Timestamp): dayjs.Dayjs {
    if (isTimestamp(date)) {
      return dayjs.unix(date.seconds);
    }
    return dayjs(date);
  }

  /**
   * 이벤트를 정렬하고 행을 할당하는 함수
   */
  const sortAndAssignRows = (events: EventsData[]) => {
    const sortedEvents = events.sort((a, b) => {
      const aStart = toDayjs(a.startDate);
      const bStart = toDayjs(b.startDate);
      const aEnd = toDayjs(a.endDate);
      const bEnd = toDayjs(b.endDate);

      if (aStart.isSame(bStart)) {
        return bEnd.diff(bStart) - aEnd.diff(aStart);
      }
      return aStart.diff(bStart);
    });

    const assignedEvents: (EventsData & { row: number })[] = [];

    // 각 이벤트에 행 번호 할당
    sortedEvents.forEach((event) => {
      let row = 0;
      while (true) {
        const conflict = assignedEvents.some(
          (assignedEvent) =>
            row === assignedEvent.row &&
            !(
              toDayjs(event.startDate).isAfter(
                toDayjs(assignedEvent.endDate)
              ) ||
              toDayjs(event.endDate).isBefore(toDayjs(assignedEvent.startDate))
            )
        );
        if (!conflict) {
          assignedEvents.push({ ...event, row });
          break;
        }
        row++;
      }
    });

    return assignedEvents;
  };

  /**
   * 날짜 타일의 클래스 이름을 결정하는 함수
   */
  const tileClassName = ({
    date,
  }: {
    date: Date;
    view: string;
  }): string | null => {
    const today = dayjs();
    const tileDate = dayjs(date);

    if (tileDate.isSame(today, "day")) {
      return !clickEventDate
        ? `${styles.currentDay} ${styles.currentDayBg}`
        : styles.currentDay;
    }
    if (tileDate.day() === 6) {
      return tileDate.isSame(clickEventDate)
        ? `${styles.clickedDay} ${styles.saturday}`
        : styles.saturday;
    }
    if (tileDate.day() === 0) {
      return tileDate.isSame(clickEventDate)
        ? `${styles.clickedDay} ${styles.sunday}`
        : styles.sunday;
    }
    if (tileDate.isSame(dayjs(clickEventDate))) {
      return styles.clickedDay;
    }

    return "";
  };

  /**
   * 날짜를 포맷팅하는 함수 (YYYY년 MM월 형식)
   */
  const formatDate = (date: Date): string => {
    return `${date.getFullYear()}년 ${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}월`;
  };

  /**
   * 날짜의 일(day)만 문자열로 반환하는 함수
   */
  const formatDay = (_locale: string | undefined, date: Date) => {
    return date.getDate().toString();
  };

  /**
   * 두 날짜 사이의 중간 날짜를 계산합니다.
   */
  const getCenterDate = (startDate: dayjs.Dayjs, endDate: dayjs.Dayjs) => {
    const diffDays = endDate.diff(startDate, "day");
    return startDate.add(Math.floor(diffDays / 2), "day");
  };

  /**
   * 주어진 날짜 타일과 이벤트에 대한 다양한 날짜 관련 상태를 확인합니다.
   */
  const tileCheckDate = (tileDate: dayjs.Dayjs, event: EventsData) => {
    const startDate = toDayjs(event.startDate);
    const endDate = toDayjs(event.endDate);
    const isStart = tileDate.isSame(startDate, "day");
    const isSunday = tileDate.day() === 0;
    const isFirstSunday =
      isSunday &&
      tileDate.isSameOrAfter(startDate, "day") &&
      (tileDate.isSame(startDate, "day") || tileDate.day(0).isAfter(startDate));
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

  /**
   * Date 또는 Timestamp 객체를 Date 객체로 변환합니다.
   */
  const getDateFromTimestamp = (dateOrTimestamp: Date | Timestamp): Date => {
    return dateOrTimestamp instanceof Timestamp
      ? dateOrTimestamp.toDate()
      : dateOrTimestamp;
  };

  /**
   * TileContent 컴포넌트
   *
   * 캘린더의 각 타일(날짜)에 대한 내용을 렌더링합니다.
   * 이벤트와 할 일을 표시하고, 날짜 클릭 및 이벤트/할 일 관련 상호작용을 처리합니다.
   *
   * @param {Object} props
   * @param {Date} props.date - 타일의 날짜
   * @param {EventsData[]} props.events - 표시할 이벤트 배열
   * @param {CalendarTodos[]} props.todos - 표시할 할 일 배열
   */
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
    const eventsForTile = assignedEvents.filter((event) =>
      tileDate.isBetween(
        dayjs(getDateFromTimestamp(event.startDate)),
        dayjs(getDateFromTimestamp(event.endDate)),
        "day",
        "[]"
      )
    );

    const todosForTile = todos.filter((todo) =>
      tileDate.isSame(dayjs(getDateFromTimestamp(todo.todoDate)), "day")
    );

    let isMore = false;
    let eventsWrapHeight = 0;
    let index = 0;
    if (eventsRef.current) {
      eventsWrapHeight = eventsRef.current.clientHeight;
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

  /**
   * 할 일 영역 클릭 처리 함수
   */
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

  /**
   * 날짜 클릭 처리 함수
   */
  const handleClickDate = (e: MouseEvent, date: Date) => {
    e.stopPropagation();
    if (isCreate) setIsCreate(false);

    if (dayjs(date).isSame(dayjs(clickEventDate))) {
      setClickEventDate(null);
    } else {
      setClickEventDate(date);
    }
  };

  /**
   * 상세 목록으로 이동하는 함수
   */
  const handleNavigateToDetail = (e: MouseEvent, date: Date) => {
    e.stopPropagation();
    const seconds = Math.floor(date.getTime() / 1000);

    return navigate(`/calendarList?date=${seconds}`);
  };

  /**
   * 생성 버튼 클릭 처리 함수
   */
  const handleCreateBtn = () => {
    if (clickEventDate) setClickEventDate(null);

    setIsCreate((prevState) => !prevState);
  };

  /**
   * 네비게이션 숨기기 처리 함수
   */
  const handleHideNav: MouseEventHandler<HTMLElement> = (e) => {
    if (!navRef.current) return;

    if (navRef.current === e.target) {
      toggleIsView();
    }
  };

  /**
   * 네비게이션 보이기 처리 함수
   */
  const handleViewNav = () => {
    if (isCreate) {
      setIsCreate(false);
    }

    toggleIsView();
  };

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
