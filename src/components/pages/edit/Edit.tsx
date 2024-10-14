import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "../create/create.module.scss";
import { ko } from "date-fns/locale/ko";
import LabelInput from "../../inputs/input/LabelInput";
import CustomTimePicker from "../create/CustomTimePicker";
import { useQuery } from "@tanstack/react-query";
import { queryClient, userDataFetch } from "../../../utils/http";
import { appAuth, appFireStore } from "../../../firebase/config";
import Header from "../../header/Header";
import { EventsData } from "../../../types";
import { EventTypeEnum } from "../../../types/enum/EventTypeEnum";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Loader from "../../loader/Loader";

const Edit: React.FC = () => {
  const [isMount, setIsMount] = useState<boolean>(false);

  const { id } = useParams(); // 이벤트 ID 가져오기
  

  const { data: authData } = useQuery({
    queryKey: ["auth", appAuth.currentUser?.uid],
    queryFn: () => userDataFetch(appAuth.currentUser?.uid as string),
    enabled: !!appAuth.currentUser?.uid,
  });

  const [eventData, setEventData] = useState<EventsData | null>(null);

  useEffect(() => {
    if (!isMount) {
      setIsMount(true);
    }
  }, []);

  // 이벤트 데이터 가져오기
  useEffect(() => {
    const fetchEventData = async () => {
      const eventDoc = doc(appFireStore, "events", id as string);
      const docSnap = await getDoc(eventDoc);

      if (docSnap.exists()) {
        setEventData(docSnap.data() as EventsData);
      } else {
        console.error("해당 이벤트를 찾을 수 없습니다.");
      }
    };

    if (id) {
      fetchEventData();
    }
  }, [id]);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState("blue");
  const [selectedText, setSelectedText] = useState("Blue");

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [memoCount, setMemoCount] = useState(0);
  const maxLength = 100;

  const [openComponent, setOpenComponent] = useState<string | null>(null);

  const {
    handleSubmit,
    register,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitted },
  } = useForm<EventsData>();

  const navigate = useNavigate();

  useEffect(() => {
    if (eventData) {
      // 초기값 설정
      setValue("title", eventData.title);
      setValue("eventColor", eventData.eventColor);
      setValue("eventMemo", eventData.eventMemo);
      setSelectedColor(eventData.eventColor || "blue");
      setSelectedText(eventData.eventColor || "Blue");
      if(eventData.startDate && eventData.endDate) {
        setStartDate(eventData.startDate.toDate());
        setEndDate(eventData.endDate.toDate());
      }
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

    try {
      const eventDoc = doc(appFireStore, "events", id as string);
      await updateDoc(eventDoc, {
        ...eventData,
        ...data,
        startDate: newEventStartDate,
        endDate: newEventEndDate,
        updateDate: new Date(),
      });

      navigate("/calendar");

      reset({
        title: "",
        eventColor: "blue",
        eventMemo: "",
        startDate: new Date(),
        endDate: new Date(),
      });

      setMemoCount(0);

      queryClient.invalidateQueries({queryKey: [
        "events",
        appAuth.currentUser?.uid,
        id
      ]});

    } catch (error) {
      console.error("데이터 업데이트 중 오류 발생:", error);
      alert("데이터 업데이트에 실패했습니다.");
    }
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
  if(!isMount) return <Loader />;
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
                      <span className={styles.listName}>{option.colorName}</span>
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
