import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './create.module.scss';
import { ko } from 'date-fns/locale/ko';
import LabelInput from '../../inputs/input/LabelInput';
import CustomTimePicker from './CustomTimePicker';
import { useQuery } from '@tanstack/react-query';
import { userDataFetch } from '../../../utils/http';
import { appAuth } from '../../../firebase/config';
import Header from '../../header/Header';


interface FormInputs {
  title: string;
}

const Create: React.FC = () => {
  const { data: authData } = useQuery({
    queryKey: ["auth", appAuth.currentUser?.uid],
    queryFn: () => userDataFetch(appAuth.currentUser?.uid as string),
    enabled: !!appAuth.currentUser?.uid,
  });

  // console.log(authData);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancel = () => {
    console.log('취소 버튼 클릭');
  };

  const {
    handleSubmit,
    register,
    watch,
    formState: { errors, isSubmitted },
  } = useForm<FormInputs>();

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    setIsSubmitting(true);
    try {
      console.log(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isOpen, setIsOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState('blue');
  const [selectedText, setSelectedText] = useState('Blue');

  const colorOptions = [
    { colorClass: 'red', colorName: 'Red' },
    { colorClass: 'pink', colorName: 'Pink' },
    { colorClass: 'orange', colorName: 'Orange' },
    { colorClass: 'yellow', colorName: 'Yellow' },
    { colorClass: 'mint', colorName: 'Mint' },
    { colorClass: 'blue', colorName: 'Blue' },
    { colorClass: 'gray', colorName: 'Gray' },
  ];

  useEffect(() => {
    setSelectedColor('blue');
    setSelectedText('Blue');
  }, []);

  const handleColorSelect = (colorClass: string, colorName: string) => {
    setSelectedColor(colorClass);
    setSelectedText(colorName);
    setIsOpen(false);
  };

  const toggleSelectBox = () => {
    setIsOpen(!isOpen);
  };

  const [isChecked, setIsChecked] = useState(false);

  // 현재 날짜와 시간을 명확하게 설정하는 부분
  const initalTime = useState(() => {
    const date = new Date();
    date.setHours(12, 0, 0, 0); // 시간을 12:00으로 설정
    return date;
  })[0]; // useState로 초기화

  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  const [startTime, setStartTime] = useState<Date | null>(initalTime);
  const [endTime, setEndTime] = useState<Date | null>(initalTime);

  const [openComponent, setOpenComponent] = useState<string | null>(null);

  // 시작 시간 변경 핸들러
  const handleStartTimeChange = (time: Date | null) => {
    setStartTime(time);

    // 시작 시간이 종료 시간보다 늦을 경우, 종료 시간을 시작 시간과 동기화
    if (time && endTime && time > endTime) {
      setEndTime(time);
    }
  };

  // 종료 시간 변경 핸들러
  const handleEndTimeChange = (time: Date | null) => {
    setEndTime(time);

    // 종료 시간이 시작 시간보다 빠를 경우, 시작 시간을 종료 시간과 동기화
    if (time && startTime && time < startTime) {
      setStartTime(time);
    }
  };

  // 시작 날짜 변경 핸들러
  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
    if (date && (!endDate || date > endDate)) {
      setEndDate(date); // 시작 날짜가 변경되면 종료 날짜도 업데이트
    }
  };

  // 종료 날짜 변경 핸들러
  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date);
    if (date && startDate && date < startDate) {
      setStartDate(date); // 종료 날짜가 시작 날짜보다 이르면 시작 날짜도 변경
    }
  };

  const handleToggleComponent = (component: string) => {
    setOpenComponent(openComponent === component ? null : component);
  };

  const profileImage = authData?.imageUrl || 'default-profile-image-url';

  return (
    <main>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Header title="일정 추가" onCancel={handleCancel} onConfirm={handleSubmit(onSubmit)} />
        
        <div className={styles.sheduleWriter}>
          <h3>작성자</h3>
          <img
            className={styles.writerProfile}
            src={profileImage}
            alt="writerProfile"
          />
        </div>
        <div className={styles.titleIpt}>
          <LabelInput
            type="text"
            label="Title"
            placeholder="제목"
            register={register('title', {
              required: { value: true, message: '제목을 입력하세요.' },
              minLength: { value: 3, message: '제목은 최소 3자 이상 입력하세요.' },
            })}
            watch={watch}
            ariaInvalid={isSubmitted ? (errors.title ? true : false) : undefined}
            error={errors}
            errorView={errors.title}
            isLabelTextHidden={true}
          />
        </div>

        <div className={`${styles.colorSelect} ${isOpen ? 'on' : ''}`}>
          <div className={styles.colorFlex}>
            <h3 className={styles.colorTitle}>색상 선택</h3>
            <button className={styles.val} type="button" onClick={toggleSelectBox}>
              <div className={`${styles.colorBox} ${styles[selectedColor]}`}></div>
              <span className={styles.selectName}>{selectedText}</span>
              <i className={styles.selectIcon}>{isOpen ? <IoMdArrowDropup /> : <IoMdArrowDropdown />}</i>
            </button>
          </div>
          {isOpen && (
            <ul className={`${styles.colorList} ${isOpen ? styles.view : styles.hidden}`}>
              {colorOptions.map((option) => (
                <li className={styles.selectOption} key={option.colorClass} onClick={() => handleColorSelect(option.colorClass, option.colorName)}>
                  <div className={`${styles.colorBox} ${styles[option.colorClass]}`}></div>
                  <span className={styles.listName}>{option.colorName}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.toggleArea}>
          <label className={styles.toggleStyle} htmlFor="toggleSwitch" role="switch">
            <h3>하루 종일</h3>
            <input
              id="toggleSwitch"
              className={styles.toggleBar}
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
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
              open={openComponent === 'startDate'}
              onInputClick={() => handleToggleComponent('startDate')}
              onClickOutside={() => setOpenComponent(null)}
            />
            {!isChecked && (
              <CustomTimePicker
                selectedTime={startTime}
                onTimeChange={handleStartTimeChange}
                isOpen={openComponent === 'startTime'}
                onToggle={() => handleToggleComponent('startTime')}
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
              open={openComponent === 'endDate'}
              onInputClick={() => handleToggleComponent('endDate')}
              onClickOutside={() => setOpenComponent(null)}
            />
            {!isChecked && (
              <CustomTimePicker
                selectedTime={endTime}
                onTimeChange={handleEndTimeChange}
                isOpen={openComponent === 'endTime'}
                onToggle={() => handleToggleComponent('endTime')}
              />
            )}
          </div>
        </div>

        <div className={styles.meMo}>
          <h3>메모</h3>
          <textarea className={styles.textArea} placeholder="메모를 입력하세요"></textarea>
        </div>
      </form>
    </main>
  );
};

export default Create;
