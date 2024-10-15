import React, { useEffect, useState } from "react";
import Header from "../../header/Header";
import styles from "../detail/detail.module.scss";
import { doc, DocumentData, getDoc, Timestamp } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { appFireStore } from "../../../firebase/config";
import { EventsData } from "../../../types";

interface Event extends DocumentData {
  uid: string;
  id: string;
  startDate: Timestamp;
  endDate: Timestamp;
  title: string;
  eventColor: EventColor | string;
}

function Detail() {
  const { id } = useParams<{ id: string }>();
  const [eventData, setEventData] = useState<EventsData | null>(null);

  useEffect(() => {
    const fetchEventData = async () => {
      const eventDoc = doc(appFireStore, "events", id as string);
      const docSnap = await getDoc(eventDoc);

      if (docSnap.exists()) {
        setEventData(docSnap.data() as EventsData);
        console.log(`데이터 가져옴`);
      } else {
        console.error("해당 이벤트를 찾을 수 없습니다.");
      }
    };

    if (id) {
      fetchEventData();
    }
  }, [id]);

  console.log(eventData);
  return (
    <>
      <Header
        title="일정 상세"
        onEdit={() => console.log("편집")}
        onDelete={() => console.log("삭제")}
      />
      <main>
        <div>
          <span>작성자</span>
          <img src="" alt="작성자" />
        </div>
        <div></div>
        <div>
          <span>하루 종일</span>
        </div>
        <div>
          <span>구간 설정</span>
        </div>
        <div></div>
        <div>
          <span>메모</span>
        </div>
      </main>
    </>
  );
}

export default Detail;
