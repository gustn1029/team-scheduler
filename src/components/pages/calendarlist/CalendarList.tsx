// import React, { useEffect } from "react";
import { RiCloseFill } from "react-icons/ri";
import styles from "./calendarlist.module.scss";
// import { collection, getDocs, query, where } from "firebase/firestore";
// import { appFireStore, } from "../../../firebase/config";

function CalendarList() {
  return (
    <>
      <header>
        <RiCloseFill className={styles.closeButton} />
      </header>
    </>
  );
}

export default CalendarList;
