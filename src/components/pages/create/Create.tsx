import React, { useState, useEffect, MouseEvent } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "./create.module.scss";
import { ko } from "date-fns/locale/ko";
import LabelInput from "../../inputs/input/LabelInput";
import CustomTimePicker from "./CustomTimePicker";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  addEventsFetch,
  eventAddressFetch,
  queryClient,
  userDataFetch,
} from "../../../utils/http";
import { appAuth } from "../../../firebase/config";
import Header from "../../header/Header";
import { AddressResult, EventAddress, EventsData } from "../../../types";
import { EventTypeEnum } from "../../../types/enum/EventTypeEnum";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from 'react-hot-toast';
import Loader from "../../loader/Loader";
import Modal from "../../modal/Modal";
import Button from "../../button/Button";
import { ButtonStyleEnum } from "../../../types/enum/ButtonEnum";
import IconButton from "../../button/iconButton/IconButton";

import { MdCancel } from "react-icons/md";
import { AnimatePresence, motion } from "framer-motion";
import MainAnimationLayout from "../../layouts/MainAnimationLayout";
import {
  layoutYVarients,
  listItemVariants,
  listVariants,
} from "../../../utils/Animations";

const Create: React.FC = () => {
  // 현재 로그인한 사용자 정보 가져오기
  const { data: authData } = useQuery({
    queryKey: ["auth", appAuth.currentUser?.uid],
    queryFn: () => userDataFetch(appAuth.currentUser?.uid as string),
    enabled: !!appAuth.currentUser?.uid,
  });

  // URL의 파라미터에서 date를 가져오기
  const [params] = useSearchParams();
  const dateParam = params.get("date");

  // 색상 선택 관련 useState
  const [isOpen, setIsOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState("blue");
  const [selectedText, setSelectedText] = useState("Blue");

  // 주소 관련 state
  const [isAddressModal, setIsAddressModal] = useState<boolean>(false);
  const [isDetailAddress, setIsDetailAddress] = useState<boolean>(false);
  const [isAddAddress, setIsAddAddress] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const [detailQuery, setDetailQuery] = useState<string>("");
  const [eventAddress, setEventAddress] = useState<EventAddress | undefined>(
    undefined
  );

  // 날짜 파싱 함수 (String -> Date 로 변환)
  const parseDate = (dateString: string | null) => {
    if (dateString) {
      const parsedDate = new Date(dateString);
      return !isNaN(parsedDate.getTime()) ? parsedDate : new Date();
    }
    const hours = new Date().setHours(9, 0, 0, 0);
    return new Date(hours);
  };

  // 시작 날짜, 종료 날짜 관련 useState
  const [startDate, setStartDate] = useState<Date>(() => parseDate(dateParam));
  const [endDate, setEndDate] = useState<Date>(() => parseDate(dateParam));

  // 메모 maxlength 핸들러(메모 길이 제한 useState)
  const [memoCount, setMemoCount] = useState(0);
  const maxLength = 100;

  // 날짜 및 시간 선택 컴포넌트의 열림 상태 관리 useState
  const [openComponent, setOpenComponent] = useState<string | null>(null);

  // 이벤트 추가 Mutation 설정 (성공 시 이벤트 목록을 업데이트하고, 페이지 이동)
  const addEventMutation = useMutation({
    mutationFn: addEventsFetch,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events", appAuth.currentUser?.uid],
      });
      navigate("../");
      toast.success("일정이 추가되었습니다.");
    },
  });

  const {
    data: addressData,
    isLoading,
    refetch,
  } = useQuery<AddressResult[], Error>({
    queryKey: ["addressSearch", query],
    queryFn: () => eventAddressFetch(query),
    enabled: false,
  });

  // React Hook Form 설정
  const {
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { errors, isSubmitted },
  } = useForm<EventsData>();

  // 메모 길이 초기화(setValue 변경 시)
  useEffect(() => {
    setMemoCount(0);
  }, [setValue]);

  // 페이지 이동을 위한 useNavigate 설정
  const navigate = useNavigate();

  // Form Submit 핸들러
  const onSubmit: SubmitHandler<EventsData> = async (data: EventsData) => {
    let newEventStartDate = startDate;
    let newEventEndDate = endDate;

    // 하루 종일 선택 시 시간을 00:00 ~ 23:59로 설정
    if (isChecked) {
      newEventStartDate = new Date(startDate?.setHours(0, 0, 0, 0));
      newEventEndDate = new Date(endDate?.setHours(23, 59, 59, 999));
    }

    // 새로운 이벤트 데이터 생성
    const newEvent: EventsData = {
      ...data,
      uid: authData?.uid,
      startDate: newEventStartDate,
      endDate: newEventEndDate,
      createDate: new Date(),
      updateDate: null,
      eventColor: selectedColor,
      eventType: EventTypeEnum.EVENTS,
      like: 0,
      address: eventAddress ? eventAddress : null,
      comments: [],
      category: [],
    };
    // 이벤트 추가 Mutation 실행
    addEventMutation.mutateAsync(newEvent);
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
    setIsOpen((prev) => !prev);
  };

  // 하루 종일 토글
  const [isChecked, setIsChecked] = useState(false);
  const handleToggleAllDay = (checked: boolean) => {
    setIsChecked(checked);
  };

  // 시작 날짜 변경 핸들러
  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      setStartDate(date);
      if (date > endDate) {
        setEndDate(new Date(date));
      }
      setOpenComponent(null);
    }
  };

  // 종료 날짜 변경 핸들러
  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      if (date < startDate) {
        setEndDate(new Date(startDate));
      } else {
        setEndDate(date);
      }
      setOpenComponent(null);
    }
  };

  // 시작 시간 변경 핸들러
  const handleStartTimeChange = (date: Date | null) => {
    if (date) {
      const newStartDate = new Date(startDate);
      newStartDate.setHours(date.getHours(), date.getMinutes(), 0, 0);
      setStartDate(newStartDate);

      if (newStartDate > endDate) {
        const newEndDate = new Date(newStartDate);
        setEndDate(newEndDate);
      }
    }
  };

  // 종료 시간 변경 핸들러
  const handleEndTimeChange = (date: Date | null) => {
    if (date) {
      const newEndDate = new Date(endDate);
      newEndDate.setHours(date.getHours(), date.getMinutes(), 0, 0);

      if (newEndDate < startDate) {
        setEndDate(new Date(startDate));
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
  };

  // 주소 검색
  const handleSearch = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    refetch();
  };

  // 선택한 주소 데이터 저장하는 함수
  const handleSetAddress = (data: AddressResult) => {
    const addressData: EventAddress = {
      place_name: data?.place_name || "",
      road_address_name: data?.road_address_name || data?.address_name,
      region_address_name: data?.address?.address_name || data?.address_name,
      x: data.x,
      y: data.y,
    };

    setEventAddress(addressData);

    if (!data?.place_name) {
      setIsDetailAddress(true);
    } else {
      setIsDetailAddress(false);
      if (detailQuery && detailQuery.trim() !== "") {
        setDetailQuery("");
      }
    }
  };

  // 최종 주소 데이터 저장
  const handleAddAddress = (detail: string | null) => {
    if (detail !== null && detail.trim() !== "") {
      setEventAddress((addr) => ({ ...addr, detail_address: detail }));
    }
    setIsAddressModal(false);
    setIsAddAddress(true);
    setQuery("");
  };

  // 주소 검색하는 모달 띄우기
  const handleShowAddressModal = () => {
    setIsAddressModal(true);
  };

  // 주소 검색 모달 숨기기
  const handleHideAddressModal = () => {
    setIsDetailAddress(false);
    if (!isAddAddress) {
      setEventAddress(undefined);
    }
    setDetailQuery("");
    setQuery("");
    setIsAddressModal(false);
  };

  // 저장된 주소 데이터 삭제
  const handleRemoveAddress = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (eventAddress) {
      setEventAddress(undefined);
      setIsAddAddress(false);
    }
    if (detailQuery !== "") {
      setDetailQuery("");
    }
  };

  return (
    <MainAnimationLayout
      variants={layoutYVarients}
      className={styles.createMain}
    >
      {isLoading && <Loader />}
      <Header title="일정 추가" onConfirm={handleSubmit(onSubmit)} />
      <form>
        <section className={styles.sheduleWriter}>
          <h3 className={styles.writer}>작성자</h3>
          <img
            className={styles.writerProfile}
            src={`${authData?.profileImg}` || "default-profile-image-url"}
            alt="writerProfile"
          />
          <span className={styles.writerName}>{`${authData?.nickname}`}</span>
        </section>

        <section className={styles.titleIpt}>
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
        </section>

        <section className={`${styles.colorSelect} ${isOpen ? "on" : ""}`}>
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

          <AnimatePresence>
            {isOpen && (
              <motion.ul
                variants={{
                  hidden: { opacity: 0, y: -10 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -10 }}
                className={`${styles.colorList} ${
                  isOpen ? styles.view : styles.hidden
                }`}
              >
                {colorOptions.map((option) => (
                  <motion.li
                    variants={listItemVariants}
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
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
          <input
            type="hidden"
            {...register("eventColor")}
            value={selectedColor}
          />
        </section>

        <section className={styles.toggleArea}>
          <h3 className="sOnly">하루 종일 선택</h3>
          <label
            className={styles.toggleStyle}
            htmlFor="toggleSwitch"
            role="switch"
          >
            <span>하루 종일</span>
            <input
              id="toggleSwitch"
              className={styles.toggleBar}
              type="checkbox"
              checked={isChecked}
              onChange={(e) => handleToggleAllDay(e.target.checked)}
            />
          </label>
        </section>

        <section className={styles.calendar}>
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
            <AnimatePresence>
              {!isChecked && (
                <CustomTimePicker
                  selectedDate={endDate as Date}
                  onTimeChange={handleEndTimeChange}
                  isOpen={openComponent === "endTime"}
                  onToggle={() => handleToggleComponent("endTime")}
                />
              )}
            </AnimatePresence>
          </div>
        </section>
        <section className={styles.address}>
          <h3>주소 입력</h3>
          <div>
            <Button
              buttonStyle={ButtonStyleEnum.NONE}
              onClick={handleShowAddressModal}
              buttonClassName={`${styles.addressAddBtn}
                ${eventAddress ? styles.addressUpdateBtn : styles.addressBtn}`}
            >
              {eventAddress
                ? eventAddress.road_address_name
                : "주소를 입력해 주세요."}
            </Button>
            {isAddAddress && (
              <IconButton
                onClick={handleRemoveAddress}
                className={styles.cancelBtn}
                icon={<MdCancel />}
              />
            )}
          </div>
        </section>
        <section className={styles.meMo}>
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
        </section>
      </form>
      <AnimatePresence>
        {isAddressModal && (
          <Modal isOpen={isAddressModal} onClose={handleHideAddressModal}>
            <div className={styles.modalInputWrap}>
              <label htmlFor="event_address" className={styles.addressLabel}>
                <span className="sOnly">주소 입력</span>
                <input
                  type="text"
                  id="event_address"
                  className={styles.addressInput}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="주소를 입력해 주세요."
                />
              </label>
              <Button
                onClick={(e) => handleSearch(e)}
                buttonStyle={ButtonStyleEnum.NormalWhite}
                buttonClassName={`${styles.modalBtn}`}
              >
                검색
              </Button>
            </div>
            <AnimatePresence>
              <motion.ul
                key="address"
                variants={listVariants}
                initial="hidden"
                animate="visible"
                className={styles.addressList}
              >
                {!addressData || addressData.length === 0 ? (
                  <li>검색된 주소가 없습니다.</li>
                ) : (
                  addressData?.map((result) => (
                    <motion.li
                      variants={listItemVariants}
                      key={`${result?.id ? result?.id : result.address_name}`}
                      className={styles.addressListItem}
                      onClick={() => handleSetAddress(result)}
                    >
                      <strong>
                        {result?.place_name || result?.address_name}
                      </strong>
                      <p>
                        {result?.address?.address_name ||
                          result?.road_address_name}
                      </p>
                    </motion.li>
                  ))
                )}
              </motion.ul>
            </AnimatePresence>
            <AnimatePresence>
              {eventAddress && eventAddress.road_address_name && (
                <motion.address
                  variants={layoutYVarients}
                  exit={{ opacity: 1, y: 0 }}
                  className={`${styles.addressData} ${
                    isDetailAddress
                      ? styles.showAddressDetail
                      : styles.hideAddressDetail
                  }`}
                >
                  {eventAddress.place_name && <p>{eventAddress.place_name}</p>}
                  <p>{eventAddress.road_address_name}</p>
                </motion.address>
              )}
            </AnimatePresence>
            {isDetailAddress && (
              <label
                htmlFor="event_address_detail"
                className={`${styles.addressLabel} ${styles.detail}`}
              >
                <span className="sOnly">상세 주소 입력</span>
                <input
                  type="text"
                  id="event_address_detail"
                  className={`${styles.addressInput} ${styles.detail}`}
                  value={detailQuery}
                  onChange={(e) => setDetailQuery(e.target.value)}
                  placeholder="상세 주소를 입력해 주세요."
                />
              </label>
            )}
            <div className={styles.btnWrap}>
              <Button
                buttonStyle={ButtonStyleEnum.Cancel}
                onClick={handleHideAddressModal}
                buttonClassName={`${styles.modalBtn}`}
              >
                취소
              </Button>
              <Button
                buttonStyle={ButtonStyleEnum.Normal}
                onClick={() => handleAddAddress(detailQuery)}
                buttonClassName={`${styles.modalBtn}`}
              >
                확인
              </Button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </MainAnimationLayout>
  );
};

export default Create;
