import React, { useEffect } from "react";
import { RiCloseFill } from "react-icons/ri";
import styles from "./calendarlist.module.scss";
import { collection } from "firebase/firestore";

function CalendarList() {
  useEffect(() => {
    const getEvent = getDocs(
      query(collection(db, "events"), where("user.id", "==", user.id))
    );
  });
  return (
    <>
      <header>
        <RiCloseFill className={styles.closeButton} />
      </header>
      <main></main>
    </>
  );
}

export default CalendarList;
