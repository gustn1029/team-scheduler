import Calendar from "react-calendar";
import styles from "./home.module.scss";
import { useDateStore } from "../../../store/useDateStore";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { useQuery } from "@tanstack/react-query";
import { eventsDataFetch } from "../../../utils/http";
import { useMemo } from "react";

dayjs.extend(isBetween);

const Home = () => {
  const { date, setDate, prevMonth, nextMonth } = useDateStore();
  const {
    data: events,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["events", date],
    queryFn: () => eventsDataFetch({year: date.getFullYear(), month: date.getMonth()}),
  });

  console.log(events);

  const sortedEvents = useMemo(() => {
    if (!events) return [];

    return events
      .filter((event) => event.startDate.seconds !== event.endDate.seconds)
      .sort((a, b) => {
        if (a.endDate.seconds === b.endDate.seconds) {
          return a.startDate.seconds - b.startDate.seconds;
        }
        return b.endDate.seconds - a.endDate.seconds;
      });
  }, [events]);

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

  const getCenterDate = (startDate: dayjs.Dayjs, endDate: dayjs.Dayjs) => {
    const diffDays = endDate.diff(startDate, 'day');
    return startDate.add(Math.floor(diffDays / 2), 'day');
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return null;

    const tileDate = dayjs(date);
    const eventsForDate = sortedEvents.filter((event) => {
      const startDate = dayjs.unix(event.startDate.seconds);
      const endDate = dayjs.unix(event.endDate.seconds);
      return tileDate.isSame(startDate, 'day') || tileDate.isSame(endDate, 'day') || 
             (tileDate.isAfter(startDate, 'day') && tileDate.isBefore(endDate, 'day'));
    });

    if (eventsForDate.length === 0) return null;

    return (
      <div className={styles.eventsWrap}>
        {eventsForDate.map((event) => {
          const startDate = dayjs.unix(event.startDate.seconds);
          const endDate = dayjs.unix(event.endDate.seconds);
          const centerDate = getCenterDate(startDate, endDate);
          const isCenter = tileDate.isSame(centerDate, 'day');

          return (
            <div key={event.id} className={`${styles.events} ${styles[event.eventColor]}`}>
              {isCenter && <span className={styles.eventTitle}>{event.title}</span>}
            </div>
          );
        })}
      </div>
    )
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
        tileContent={tileContent}
        formatDay={formatDay}
        calendarType="gregory"
        minDetail="month"
        showNavigation={false}
      />
    </div>
  );
};

export default Home;
