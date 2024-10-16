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
import { doc, getDoc, Timestamp, updateDoc } from "firebase/firestore";
import Loader from "../../loader/Loader";

const Edit: React.FC = () => {
  // 이벤트 ID를 URL에서 가져오기
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

  // 이벤트를 업데이트하는 함수
  const updateEvent = async ({ data }: { data: EventsData }) => {
    const eventDoc = doc(appFireStore, "events", id as string);
      await updateDoc(eventDoc, {
        ...eventData,
        ...data,
        startDate: data.startDate,
        endDate: data.endDate,
        updateDate: new Date(),
      });
  }

  // 이벤트 업데이트를 처리하는 useMutation
  const updateEventMutation = useMutation<void, Error, EventsData>(
    {
        mutationFn: async (data) => await updateEvent({ data }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["events", appAuth.currentUser?.uid, id]});
            navigate(`/calendarlist/${id}`); // 성공 시 해당 이벤트 페이지로 이동
        },
        onError: (error: Error) => {
            console.error("데이터 업데이트 중 오류 발생:", error);
            alert("데이터 업데이트에 실패했습니다.");
        },
    }
  );

  // 색상 선택 토글 관리 useState
  const [isOpen, setIsOpen] = useState(false);

  // 선택된 색상 및 텍스트 관련 useState
  const [selectedColor, setSelectedColor] = useState("blue");
  const [selectedText, setSelectedText] = useState("Blue");

  // 시작 날짜, 종료 날짜 관련 useState
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // 메모 maxlength 핸들러(메모 길이 제한 useState)
  const [memoCount, setMemoCount] = useState(0);
  const maxLength = 100;

  // 날짜 및 시간 선택 컴포넌트의 열림 상태 관리 useState
  const [openComponent, setOpenComponent] = useState<string | null>(null);

  // 하루 종일 토글 상태 관리 useState
  const [isChecked, setIsChecked] = useState(false);

  // React Hook Form 설정
  const {
    handleSubmit,
    register,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitted },
  } = useForm<EventsData>();

  // 컴포넌트가 처음 렌더링되면 이벤트 데이터를 폼에 설정
  useEffect(() => {
    if (eventData) {
      // Timestamp를 Date 객체로 변환
      if (eventData.startDate && eventData.endDate) {
        setStartDate(
          eventData.startDate instanceof Timestamp
            ? eventData.startDate.toDate()
            : eventData.startDate
        );
        setEndDate(
          eventData.endDate instanceof Timestamp
            ? eventData.endDate.toDate()
            : eventData.endDate
        );
      } else {
        setStartDate(new Date());
        setEndDate(new Date());
      }

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

  // Form Submit 핸들러
  const onSubmit: SubmitHandler<EventsData> = async (data: EventsData) => {
    let newEventStartDate = startDate;
    let newEventEndDate = endDate;

    // 하루 종일 선택 시 시간을 00:00 ~ 23:59로 설정
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

    // 폼 리셋
    reset({
      title: "",
      eventColor: "blue",
      eventMemo: "",
      startDate: new Date(),
      endDate: new Date(),
    });

    // 메모 카운트 초기화
    setMemoCount(0);
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

  // 색상 선택 박스 토글
  const toggleSelectBox = () => {
    setIsOpen(!isOpen);
  };

  // 하루 종일 토글
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
    setOpenComponent(openComponent === component ? null : component);
  };

  // 메모 변경 핸들러
  const handleMemoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMemoCount(e.target.value.length);
  };

  // 로딩 상태 시 로더 표시
  if (isLoading) return <Loader />;

  return (
    <main className={styles.editMain}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Header title="일정 수정" onConfirm={handleSubmit(onSubmit)} />

        {eventData && (
          <>
            <div className={styles.titleIpt}>
              <LabelInput
                type="text"
                label="Title"
                placeholder="제목"
                register={register("title", {
                  required: { value: true, message: "제목을 입력하세요." },
                  minLength: {
                    value: 3,
                    message: "제목은 최소 3자 이상 입력하세요.",
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