import React from 'react';
import styles from './create.module.scss';
import { RiCloseFill } from "react-icons/ri";
import { IoMdCheckmark } from "react-icons/io";


const Create = () => {
  return (
    <main>
      <header>
        <RiCloseFill className={styles.closeButton} />
        <h2 className={styles.h2}>일정 추가</h2>
        <IoMdCheckmark className={styles.checkButton} />
      </header>
      <div className={styles.sheduleWriter}>
        <span>작성자</span>
        <img
          className={styles.writerProfile}
          src=""
          alt="writerProfile"
        />
      </div>
      <div className={styles.titleIpt}>
        <input
          type="text"
          placeholder="제목"
          className={styles.titleTxt}
        />
      </div>
      <div className={styles.colorSelect}>
        <span>색상 선택</span>
        <div className={styles.selectBox}>
          <button className={styles.val}>
            <div className={styles.colorBox}></div>
            <span>Blue</span><i>열기</i>
          </button>
          <ul>
            <li>
              <div className={styles.colorBox}></div>
              <span>Red</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  )
}

export default Create