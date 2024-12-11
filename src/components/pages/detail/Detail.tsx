import { useEffect, useState } from "react";
import Header from "../../header/Header";
import styles from "../detail/detail.module.scss";
import { deleteDoc, doc, Timestamp } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { appAuth, appFireStore } from "../../../firebase/config";
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
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  eventLikeFetch,
  fetchEventData,
  fetchUserData,
} from "../../../utils/http/event/http";
import { queryClient } from "../../../utils/http";
import Comments from "../../comments/Comments";

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
  const [error, setError] = useState<string | null>(null);
  const [isLike, setIsLike] = useState<boolean>(false);
  const [addressUrl, setAddressUrl] = useState<string>("");
  const navigate = useNavigate();
  const { teamName } = useTeamStore();

  const likeMutation = useMutation({
    mutationFn: eventLikeFetch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", id] });
      setIsLike((prevState) => !prevState);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Event data query
  const { data: eventData, isLoading: isEventDataLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: () => fetchEventData(id!),
    enabled: !!id,
  });

  // User data query
  const { data: userData } = useQuery({
    queryKey: ["user", eventData?.uid],
    queryFn: () => fetchUserData(eventData!.uid!),
    enabled: !!eventData?.uid,
  });

  useEffect(() => {
    if (eventData?.like) {
      const likeCheck = eventData.like.filter(
        (id) => id === appAuth.currentUser?.uid
      );

      setIsLike(likeCheck.length !== 0);
    }

    if (eventData?.address) {
      if (eventData.address?.place_name) {
        setAddressUrl(`${eventData.address.place_name}`);
      } else {
        setAddressUrl(
          `${eventData.address?.road_address_name}${
            eventData.address?.detail_address
              ? ` ${eventData?.address.detail_address}`
              : ""
          }`
        );
      }
    }
  }, [eventData]);

  const handleLikeUpdate = async () => {
    if (!id) {
      toast.error("이벤트 ID가 없습니다.");
      return;
    }

    if (!appAuth.currentUser) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    if (!eventData) {
      toast.error("이벤트 데이터를 찾을 수 없습니다.");
      return;
    }

    const checkLikeState = eventData.like.indexOf(appAuth.currentUser.uid);
    const newLikeState =
      checkLikeState >= 0
        ? eventData.like.filter((uid) => uid !== appAuth.currentUser?.uid)
        : [...eventData.like, appAuth.currentUser.uid];

    await likeMutation.mutateAsync({
      eventId: id,
      like: newLikeState,
    });
  };

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
  if (isEventDataLoading) {
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
    }
  };

  return (
    <MainAnimationLayout
      variants={layoutXVarients}
      className={styles.detailContainer}
    >
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
          {teamName && (
            <div className={styles.likeAndCommentWrap}>
              <IconButton
                onClick={handleLikeUpdate}
                icon={!isLike ? <AiOutlineLike /> : <AiFillLike />}
                className={styles.likeButton}
              />
              <span className="like">{eventData?.like?.length}</span>
            </div>
          )}
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
              <a
                href={`https://map.kakao.com/?q=${addressUrl}`}
                target="_blank"
              >
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
          {teamName && (
            <Comments
              commentsData={eventData?.comments?.comments || []}
              eventId={id ?? ""}
              uid={appAuth.currentUser?.uid ?? ""}
              nickname={userData?.nickname ?? ""}
              profileImg={userData?.profileImg ?? ""}
            />
          )}
        </>
      )}
    </MainAnimationLayout>
  );
}

export default Detail;
