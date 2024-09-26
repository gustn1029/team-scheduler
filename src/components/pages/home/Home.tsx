import React from "react";
import Calendar from "react-calendar";
import styles from "./home.module.scss";
import { useDateStore } from "../../../store/useDateStore";
import dayjs from "dayjs";
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

const Home = () => {
  const { date, setDate, prevMonth, nextMonth } = useDateStore();

  dayjs.extend(isSameOrBefore);
  dayjs.extend(isSameOrAfter);
  const tileClassName = ({
    date,
  }: {
    date: Date;
    view: string;
  }): string | null => {
    const today = dayjs();
    const tileDate = dayjs(date);
    const specialPeriodStart = dayjs("2023-06-01");
    const specialPeriodEnd = dayjs("2023-06-07");

    if (tileDate.isSame(today, "day")) {
      return styles.currentDay;
    }
    if (tileDate.day() === 6) {
      return styles.saturday;
    }
    if (tileDate.day() === 0) {
      return styles.sunday;
    }
    if (
      tileDate.isSameOrAfter(specialPeriodStart, "day") &&
      tileDate.isSameOrBefore(specialPeriodEnd, "day")
    ) {
      return styles.specialPeriod;
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

  const tileContent = ({ view }: { date: Date; view: string }) => {
    if (view === "month") {
      return (
        <div className={styles.eventsWrap}>
          <div className={styles.events}>일정</div>
        </div>
      );
    }
    return null;
  };

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
