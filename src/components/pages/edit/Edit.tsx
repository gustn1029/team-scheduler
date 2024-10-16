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
import { updateEvent } from "../../../utils/http";

const Edit: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState("blue");
  const [selectedText, setSelectedText] = useState("Blue");

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [memoCount, setMemoCount] = useState(0);
  const maxLength = 100;

  const [openComponent, setOpenComponent] = useState<string | null>(null);
  
  const { id } = useParams(); // 이벤트 ID 가져오기
  const navigate = useNavigate();
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

  const {
    handleSubmit,
    register,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitted },
  } = useForm<EventsData>();

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

  const onSubmit: SubmitHandler<EventsData> = async (data: EventsData) => {
    let newEventStartDate = startDate;
    let newEventEndDate = endDate;

    if (isChecked) {
      newEventStartDate = new Date(startDate!.setHours(0, 0, 0, 0));
      newEventEndDate = new Date(endDate!.setHours(23, 59, 59, 999));
    }

    const updateEventData: EventsData = {
        ...data,
        startDate: newEventStartDate as Date,
        endDate: newEventEndDate as Date,
        eventColor: selectedColor,
    };
    updateEventMutation.mutateAsync(updateEventData);
  };

  const colorOptions = [
    { colorClass: "red", colorName: "Red" },
    { colorClass: "pink", colorName: "Pink" },
    { colorClass: "orange", colorName: "Orange" },
    { colorClass: "yellow", colorName: "Yellow" },
    { colorClass: "mint", colorName: "Mint" },
    { colorClass: "blue", colorName: "Blue" },
    { colorClass: "gray", colorName: "Gray" },
  ];

  const handleColorSelect = (colorClass: string, colorName: string) => {
    setSelectedColor(colorClass);
    setSelectedText(colorName);
    setIsOpen(false);
  };

  const toggleSelectBox = () => {
    setIsOpen(!isOpen);
  };

  const [isChecked, setIsChecked] = useState(false);
  const handleToggleAllDay = (checked: boolean) => {
    setIsChecked(checked);
  };

  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      setStartDate(date);
      if (date > (endDate as Date)) {
        setEndDate(new Date(date));
      }
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      if (date < (startDate as Date)) {
        setEndDate(new Date(startDate as Date));
      } else {
        setEndDate(date);
      }
    }
  };

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

  const handleToggleComponent = (component: string) => {
    setOpenComponent(openComponent === component ? null : component);
  };

  const handleMemoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMemoCount(e.target.value.length);
  };

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