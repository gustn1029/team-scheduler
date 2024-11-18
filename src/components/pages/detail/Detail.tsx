import { useEffect, useState } from "react";
import Header from "../../header/Header";
import styles from "../detail/detail.module.scss";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { appAuth, appFireStore } from "../../../firebase/config";
import { EventsData, UserData } from "../../../types";
import Loader from "../../loader/Loader";
import { EventTypeEnum } from "../../../types/enum/EventTypeEnum";
import dayjs from "dayjs";
import KakaoMap from "../../kakaoMap/KakaoMap";
import toast from "react-hot-toast";
import MainAnimationLayout from "../../layouts/MainAnimationLayout";
import { layoutXVarients } from "../../../utils/Animations";
import { useTeamStore } from "../../../store/useTeamStore";

import { AiOutlineLike } from "react-icons/ai";
import { AiFillLike } from "react-icons/ai";
import IconButton from "../../button/iconButton/IconButton";

type CurrentUserData = Omit<UserData, "token">;

type EventColor =
  | "red"
  | "pink"
  | "orange"
  | "yellow"
  | "mint"
  | "blue"
  | "gray";

const colorMap: Record<EventColor, string> = {
  red: "#F5333F",
  pink: "#FB91A3",
  orange: "#FF9E18",
  yellow: "#FFD235",
  mint: "#00B392",
  blue: "#3FA9F5",
  gray: "#7BA0C4",
};

function Detail() {
  const { id } = useParams<{ id: string }>();
  const [eventData, setEventData] = useState<EventsData | null>(null);
  const [userData, setUserData] = useState<CurrentUserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLike, setIsLike] = useState<boolean>(false);
  const navigate = useNavigate();
  const { teamName } = useTeamStore();

  useEffect(() => {
    const fetchEventData = async () => {
      if (!id) {
        setError("일정 ID가 없습니다.");
        setIsLoading(false);
        return;
      }

      try {
        const eventDoc = doc(appFireStore, "events", id);
        const docSnap = await getDoc(eventDoc);

        if (docSnap.exists()) {
          setEventData(docSnap.data() as EventsData);
        } else {
          setError("해당 이벤트를 찾을 수 없습니다.");
        }
      } catch (err) {
        console.error("데이터를 불러오는 중 오류가 발생했습니다.", err);
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [id]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (eventData && eventData.uid) {
        try {
          const userData = await userDataFetch(eventData.uid);
          setUserData(userData);
        } catch (err) {
          console.error(
            "사용자 데이터를 불러오는 중 오류가 발생했습니다.",
            err
          );
        }
      }
    };
    if (eventData && eventData.like) {
      const likeCheck = eventData.like.filter(
        (id) => id === appAuth.currentUser?.uid
      );

      if (likeCheck.length !== 0) {
        setIsLike(true);
      } else {
        setIsLike(false);
      }
    }

    fetchUserData();
  }, [eventData]);

  const getEventColor = (colorName: EventColor | string): string => {
    return colorName in colorMap
      ? colorMap[colorName as EventColor]
      : colorName;
  };

  const formatDateRange = (date: Date) => {
    const formattedDate = dayjs(date);
    const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

    return `${formattedDate.format("YYYY.MM.DD")}(${
      weekDays[formattedDate.day()]
    })`;
  };

  const formatTime = (date: Date) => {
    return dayjs(date).format("HH:mm");
  };

  const formatEventPeriod = (
    startDate: Date,
    endDate: Date,
    eventType: EventTypeEnum
  ) => {
    const startFormatted = `${formatDateRange(startDate)} ${formatTime(
      startDate
    )}`;
    const endFormatted = `${formatDateRange(endDate)} ${formatTime(endDate)}`;

    if (
      eventType === EventTypeEnum.HOLIDAY ||
      isAllDayEvent(startDate, endDate)
    ) {
      return `${formatDateRange(startDate)} ~ ${formatDateRange(endDate)}`;
    } else {
      return `${startFormatted} ~ ${endFormatted}`;
    }
  };

  const isAllDayEvent = (startDate: Date, endDate: Date) => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    return (
      start.hour() === 0 &&
      start.minute() === 0 &&
      end.hour() === 23 &&
      end.minute() === 59
    );
  };
  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!eventData) {
    return (
      <div className={styles.error}>이벤트 데이터를 찾을 수 없습니다.</div>
    );
  }

  const eventStartDate =
    eventData.startDate instanceof Timestamp
      ? eventData.startDate.toDate()
      : new Date(eventData.startDate);

  const eventEndDate =
    eventData.endDate instanceof Timestamp
      ? eventData.endDate.toDate()
      : new Date(eventData.endDate);

  const handleCancel = () => {
    const seconds = sessionStorage.getItem("seconds");
    let src = `/calendarList?date=${seconds}`;
    if (teamName) {
      src = `/${teamName}${src}`;
    }
    navigate(src);
  };

  const handleDelete = async () => {
    if (!id) {
      console.error("일정 ID가 없습니다.");
      return;
    }

    const confirmDelete = window.confirm("정말로 이 일정을 삭제하시겠습니까?");
    if (!confirmDelete) return;

    try {
      setIsLoading(true);
      const eventDocRef = doc(appFireStore, "events", id);
      await deleteDoc(eventDocRef);
      const seconds = sessionStorage.getItem("seconds");
      if (seconds !== null) {
        sessionStorage.removeItem("seconds");
      }
      navigate("/");
      toast.success("일정을 삭제했습니다.");
    } catch (err) {
      console.error("일정 삭제 중 오류가 발생했습니다:", err);
      setError("일정 삭제 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const userDataFetch = async (
    userId: string
  ): Promise<CurrentUserData | null> => {
    if (!userId) {
      throw new Error("userId is required");
    }

    const userCollection = collection(appFireStore, "users");
    const q = query(userCollection, where("uid", "==", userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    return querySnapshot.docs[0].data() as CurrentUserData;
  };

  return (
    <MainAnimationLayout variants={layoutXVarients}>
      <Header
        onCancel={handleCancel}
        title="일정 상세"
        {...(eventData.eventType !== EventTypeEnum.HOLIDAY && {
          onEdit: () =>
            navigate(
              `${teamName ? `/${teamName}/` : "/"}calendarlist/${id}/edit`
            ),
        })}
        {...(eventData.eventType !== EventTypeEnum.HOLIDAY && {
          onDelete: handleDelete,
        })}
      />
      {eventData.eventType !== EventTypeEnum.HOLIDAY && (
        <section className={styles.writerContainer}>
          <div>
            <h3>작성자</h3>
            {userData && userData.profileImg ? (
              <figure>
                <img
                  src={userData.profileImg}
                  alt="작성자 프로필"
                  className={styles.profileImg}
                />
                <figcaption>{userData.nickname}</figcaption>
              </figure>
            ) : (
              <p className={styles.defaultProfileImg}>프로필 없음</p>
            )}
          </div>
          <div className={styles.likeAndCommentWrap}>
            <IconButton
              icon={!isLike ? <AiOutlineLike /> : <AiFillLike />}
              className={styles.likeButton}
            />
            <span className="like">{eventData?.like?.length}</span>
          </div>
        </section>
      )}
      <div className={styles.titleContainer}>
        <div
          className={styles.listColor}
          style={{ backgroundColor: getEventColor(eventData.eventColor) }}
        ></div>
        <h3 className="sOnly">제목</h3>
        <p className={styles.title}>{eventData.title}</p>
      </div>
      <div className={styles.timeContainer}>
        <h3 className="sOnly">일정 기간</h3>
        <p>
          {formatEventPeriod(eventStartDate, eventEndDate, eventData.eventType)}
        </p>
      </div>
      {eventData.eventType !== EventTypeEnum.HOLIDAY && (
        <>
          <div className={styles.memoContainer}>
            <h3>메모</h3>
            <p className={styles.memoTextarea}>{eventData?.eventMemo || ""}</p>
          </div>
          {eventData.address && eventData.address.x && eventData.address.y && (
            <div className={styles.eventAddress}>
              <h3>일정 장소</h3>
              <a href={`https://map.kakao.com/?q=`} target="_blank">
                <KakaoMap
                  latitude={Number(eventData.address.y)}
                  longitude={Number(eventData.address.x)}
                />
              </a>
              <address>
                {eventData.address.place_name && (
                  <strong> {eventData.address.place_name}</strong>
                )}
                <em>
                  {`${eventData.address.road_address_name}${
                    eventData.address.detail_address
                      ? ` ${eventData.address.detail_address}`
                      : ""
                  }`}
                </em>
                <span>지번 주소: {eventData.address.region_address_name}</span>
              </address>
            </div>
          )}
        </>
      )}
    </MainAnimationLayout>
  );
}

export default Detail;
