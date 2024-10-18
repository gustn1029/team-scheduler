import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "../create/create.module.scss";
import { ko } from "date-fns/locale/ko";
import LabelInput from "../../inputs/input/LabelInput";
import CustomTimePicker from "../create/CustomTimePicker";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useQueryClient } from '@tanstack/react-query';
import { appAuth, appFireStore } from "../../../firebase/config";
import Header from "../../header/Header";
import { EventsData } from "../../../types";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import Loader from "../../loader/Loader";
import { updateEvent, userDataFetch } from "../../../utils/http";

const Edit: React.FC = () => {
  // 현재 로그인한 사용자 정보 가져오기
  const { data: authData } = useQuery({
    queryKey: ["auth", appAuth.currentUser?.uid],
    queryFn: () => userDataFetch(appAuth.currentUser?.uid as string),
    enabled: !!appAuth.currentUser?.uid,
  });
  // 색상 선택 토글 상태
  const [isOpen, setIsOpen] = useState(false);

  // 선택된 색상 및 텍스트 상태
  const [selectedColor, setSelectedColor] = useState("blue");
  const [selectedText, setSelectedText] = useState("Blue");

  // 시작 날짜와 종료 날짜 상태
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // 메모 입력 시 카운트를 관리하는 상태
  const [memoCount, setMemoCount] = useState(0);
  const maxLength = 100;

  // 열려 있는 컴포넌트 상태
  const [openComponent, setOpenComponent] = useState<string | null>(null);

  // 하루 종일 토글 상태
  const [isChecked, setIsChecked] = useState(false);
  
  // 이벤트 ID를 URL에서 가져옴
  const { id } = useParams();

  // 페이지 이동을 위한 네비게이션 훅
  const navigate = useNavigate();

  // React Query에서 제공하는 QueryClient 인스턴스를 사용
  const queryClient = useQueryClient();

  // 이벤트 데이터를 가져오는 useQuery
  const { data: eventData, isLoading } = useQuery<EventsData, Error>({
    queryKey: ["event", id],
    queryFn: async () => {
      const eventDoc = doc(appFireStore, "events", id as string);
      const docSnap = await getDoc(eventDoc);
      if (docSnap.exists()) {
        return docSnap.data() as EventsData;
      } else {
        throw new Error("해당 이벤트를 찾을 수 없습니다.");
      }
    },
    enabled: !!id, // id가 존재할 때만 쿼리를 활성화
  });

  // 이벤트 업데이트를 처리하는 useMutation
  const updateEventMutation = useMutation<void, Error, EventsData>(
    {
        mutationFn: async (data) => await updateEvent({ data, eventData: eventData as EventsData, id: id as string }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["events", appAuth.currentUser?.uid, id]});
            navigate(`/calendarlist/${id}`);
        },
        onError: (error: Error) => {
            console.error("데이터 업데이트 중 오류 발생:", error);
            alert("데이터 업데이트에 실패했습니다.");
        },
    }
  );

  // React Hook Form 사용
  const {
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { errors, isSubmitted },
  } = useForm<EventsData>();

  // 컴포넌트가 처음 렌더링되면 이벤트 데이터를 폼에 설정
  useEffect(() => {
    if (eventData) {
      // Firestore에서 가져온 Timestamp를 Date 객체로 변환
      const startTime = eventData.startDate instanceof Timestamp ? eventData.startDate.toDate() : eventData.startDate;
      const endTime = eventData.endDate instanceof Timestamp ? eventData.endDate.toDate() : eventData.endDate;
      
      setStartDate(startTime);
      setEndDate(endTime);

      // 시작 시간이 00:00, 종료 시간이 23:59이면 하루 종일로 설정
      const isAllDayEvent = startTime.getHours() === 0 && startTime.getMinutes() === 0 && endTime.getHours() === 23 && endTime.getMinutes() === 59;
      setIsChecked(isAllDayEvent);

      // setValue를 통한 폼 초기값 설정
      setValue("title", eventData.title);
      setValue("eventColor", eventData.eventColor);
      setValue("eventMemo", eventData.eventMemo);

      // 선택된 색상 및 메모 카운트 초기화
      setSelectedColor(eventData.eventColor || "blue");
      setSelectedText(eventData.eventColor || "Blue");
      setMemoCount(eventData.eventMemo.length);
    }
  }, [eventData, setValue]);

  // 폼 제출 핸들러
  const onSubmit: SubmitHandler<EventsData> = async (data: EventsData) => {
    let newEventStartDate = startDate;
    let newEventEndDate = endDate;

    // 하루 종일 체크가 되어 있으면 시간을 00:00 ~ 23:59로 설정
    if (isChecked) {
      newEventStartDate = new Date(startDate!.setHours(0, 0, 0, 0));
      newEventEndDate = new Date(endDate!.setHours(23, 59, 59, 999));
    }

    // 업데이트할 이벤트 데이터 구성
    const updateEventData: EventsData = {
        ...data,
        startDate: newEventStartDate as Date,
        endDate: newEventEndDate as Date,
        eventColor: selectedColor,
    };
    // 이벤트 업데이트 호출
    updateEventMutation.mutateAsync(updateEventData);
  };

  // 색상 옵션 설정
  const colorOptions = [
    { colorClass: "red", colorName: "Red" },
    { colorClass: "pink", colorName: "Pink" },
    { colorClass: "orange", colorName: "Orange" },
    { colorClass: "yellow", colorName: "Yellow" },
    { colorClass: "mint", colorName: "Mint" },
    { colorClass: "blue", colorName: "Blue" },
    { colorClass: "gray", colorName: "Gray" },
  ];

  // 색상 선택 핸들러
  const handleColorSelect = (colorClass: string, colorName: string) => {
    setSelectedColor(colorClass);
    setSelectedText(colorName);
    setIsOpen(false);
  };

  // 색상 선택 토글 핸들러
  const toggleSelectBox = () => {
    setIsOpen(!isOpen);
  };

  // 하루 종일 토글 핸들러
  const handleToggleAllDay = (checked: boolean) => {
    setIsChecked(checked);
  };

  // 시작 날짜 변경 핸들러
  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      setStartDate(date);
      if (date > (endDate as Date)) {
        setEndDate(new Date(date));
      }
    }
  };

  // 종료 날짜 변경 핸들러
  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      if (date < (startDate as Date)) {
        setEndDate(new Date(startDate as Date));
      } else {
        setEndDate(date);
      }
    }
  };

  // 시작 시간 변경 핸들러
  const handleStartTimeChange = (date: Date | null) => {
    if (date) {
      const newStartDate = new Date(startDate as Date);
      newStartDate.setHours(date.getHours(), date.getMinutes(), 0, 0);
      setStartDate(newStartDate);

      if (newStartDate > (endDate as Date)) {
        const newEndDate = new Date(newStartDate);
        setEndDate(newEndDate);
      }
    }
  };

  // 종료 시간 변경 핸들러
  const handleEndTimeChange = (date: Date | null) => {
    if (date) {
      const newEndDate = new Date(endDate as Date);
      newEndDate.setHours(date.getHours(), date.getMinutes(), 0, 0);

      if (newEndDate < (startDate as Date)) {
        setEndDate(new Date(startDate as Date));
      } else {
        setEndDate(newEndDate);
      }
    }
  };

  // 컴포넌트 열림/닫힘 상태 토글
  const handleToggleComponent = (component: string) => {
    if (component !== "colorSelect") {
      setIsOpen(false);
    }
    setOpenComponent(openComponent === component ? null : component);
  };

  // 메모 변경 핸들러
  const handleMemoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length > maxLength) {
      e.target.value = e.target.value.slice(0, maxLength);
    }
    setMemoCount(e.target.value.length);
  }

  // 로딩 상태 시 로더 표시
  if (isLoading) return <Loader />;

  return (
    <main className={styles.editMain}>
      <Header title="일정 수정" onConfirm={handleSubmit(onSubmit)} />
      <form>
        {eventData && (
          <>
            <div className={styles.sheduleWriter}>
              <h3 className={styles.writer}>작성자</h3>
              <img
                className={styles.writerProfile}
                src={`${authData?.profileImg}` || "default-profile-image-url"}
                alt="writerProfile"
              />
              <span className={styles.writerName}>{`${authData?.nickname}`}</span>
            </div>
            <div className={styles.titleIpt}>
              <LabelInput
                type="text"
                label="Title"
                placeholder="제목"
                register={register("title", {
                  required: { value: true, message: "제목을 입력하세요." },
                  minLength: {
                    value: 2,
                    message: "제목은 최소 2자 이상 입력하세요.",
                  },
                })}
                watch={watch}
                ariaInvalid={
                  isSubmitted ? (errors.title ? true : false) : undefined
                }
                error={errors}
                errorView={errors.title}
                isLabelTextHidden={true}
              />
            </div>

            <div className={`${styles.colorSelect} ${isOpen ? "on" : ""}`}>
              <div className={styles.colorFlex}>
                <h3 className={styles.colorTitle}>색상 선택</h3>
                <button
                  className={styles.val}
                  type="button"
                  onClick={toggleSelectBox}
                >
                  <div
                    className={`${styles.colorBox} ${styles[selectedColor]}`}
                  ></div>
                  <span className={styles.selectName}>{selectedText}</span>
                  <i className={styles.selectIcon}>
                    {isOpen ? <IoMdArrowDropup /> : <IoMdArrowDropdown />}
                  </i>
                </button>
              </div>
              {isOpen && (
                <ul
                  className={`${styles.colorList} ${
                    isOpen ? styles.view : styles.hidden
                  }`}
                >
                  {colorOptions.map((option) => (
                    <li
                      className={styles.selectOption}
                      key={option.colorClass}
                      onClick={() =>
                        handleColorSelect(option.colorClass, option.colorName)
                      }
                    >
                      <div
                        className={`${styles.colorBox} ${
                          styles[option.colorClass]
                        }`}
                      ></div>
                      <span className={styles.listName}>
                        {option.colorName}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <input
                type="hidden"
                {...register("eventColor")}
                value={selectedColor}
              />
            </div>

            <div className={styles.toggleArea}>
              <label
                className={styles.toggleStyle}
                htmlFor="toggleSwitch"
                role="switch"
              >
                <h3>하루 종일</h3>
                <input
                  id="toggleSwitch"
                  className={styles.toggleBar}
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => handleToggleAllDay(e.target.checked)}
                />
              </label>
            </div>

            <div className={styles.calendar}>
              <div className={styles.pickerGroup}>
                <DatePicker
                  className={styles.datePicker}
                  selected={startDate}
                  onChange={handleStartDateChange}
                  dateFormat="yyyy년 MM월 dd일 (EEE)"
                  locale={ko}
                  placeholderText="시작 날짜를 선택하세요"
                  open={openComponent === "startDate"}
                  onInputClick={() => handleToggleComponent("startDate")}
                  onClickOutside={() => setOpenComponent(null)}
                />
                {!isChecked && (
                  <CustomTimePicker
                    selectedDate={startDate as Date}
                    onTimeChange={handleStartTimeChange}
                    isOpen={openComponent === "startTime"}
                    onToggle={() => handleToggleComponent("startTime")}
                  />
                )}
              </div>

              <div className={styles.pickerGroup}>
                <DatePicker
                  className={styles.datePicker}
                  selected={endDate}
                  onChange={handleEndDateChange}
                  dateFormat="yyyy년 MM월 dd일 (EEE)"
                  locale={ko}
                  placeholderText="종료 날짜를 선택하세요"
                  open={openComponent === "endDate"}
                  onInputClick={() => handleToggleComponent("endDate")}
                  onClickOutside={() => setOpenComponent(null)}
                />
                {!isChecked && (
                  <CustomTimePicker
                    selectedDate={endDate as Date}
                    onTimeChange={handleEndTimeChange}
                    isOpen={openComponent === "endTime"}
                    onToggle={() => handleToggleComponent("endTime")}
                  />
                )}
              </div>
            </div>

            <div className={styles.meMo}>
              <h3>메모</h3>
              <textarea
                className={styles.textArea}
                placeholder="메모를 입력하세요"
                {...register("eventMemo")}
                maxLength={maxLength}
                onChange={handleMemoChange}
              ></textarea>
              <div className={styles.memoCount}>
                {memoCount} / {maxLength}
              </div>
            </div>
          </>
        )}
      </form>
    </main>
  );
};

export default Edit;