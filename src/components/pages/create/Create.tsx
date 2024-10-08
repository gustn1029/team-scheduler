import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { RiCloseFill } from 'react-icons/ri';
import { IoMdCheckmark } from 'react-icons/io';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './create.module.scss';
import { ko } from 'date-fns/locale/ko';
import LabelInput from '../../inputs/input/LabelInput';
import CustomTimePicker from './CustomTimePicker';
import { useQuery } from '@tanstack/react-query';
import { userDataFetch } from '../../../utils/http';
import { appAuth } from '../../../firebase/config';

interface FormInputs {
  title: string;
}

const Create: React.FC = () => {
  const { data: authData } = useQuery({
    queryKey: ["auth", appAuth.currentUser?.uid],
    queryFn: () => userDataFetch(appAuth.currentUser?.uid as string),
    enabled: !!appAuth.currentUser?.uid,
  });

  console.log(authData);

  const {
    handleSubmit,
    register,
    watch,
    formState: { errors, isSubmitted, isSubmitting },
  } = useForm<FormInputs>();

  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    console.log(data);
  };

  const [isChecked, setIsChecked] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  const initalTime = new Date();
  initalTime.setHours(12, 0, 0, 0);

  const [startTime, setStartTime] = useState<Date | null>(initalTime);
  const [endTime, setEndTime] = useState<Date | null>(initalTime);

  const [openComponent, setOpenComponent] = useState<string | null>(null);

  // 시간 동기화 함수
  // const handleTimeSync = (start: Date | null, end: Date | null) => {
  //   if (start && end && start > end) {
  //     setEndTime(start); // 시작 시간이 종료 시간보다 이후인 경우, 종료 시간을 시작 시간으로 맞춤
  //   }
  // };

  const handleStartTimeChange: React.Dispatch<React.SetStateAction<Date | null>> = (time) => {
    setStartTime(time);
  };
  
  const handleEndTimeChange: React.Dispatch<React.SetStateAction<Date | null>> = (time) => {
    setEndTime(time);
  };

  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
    if (date && (!endDate || date > endDate)) {
      setEndDate(date);
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date);
    if (date && startDate && date < startDate) {
      setStartDate(date);
    }
  };

  const handleToggleComponent = (component: string) => {
    setOpenComponent(openComponent === component ? null : component);
  };

  const profileImage = authData?.imageUrl || 'default-profile-image-url';

  return (
    <main>
      <form onSubmit={handleSubmit(onSubmit)}>
        <header>
          <RiCloseFill className={styles.closeButton} />
          <h2 className={styles.h2}>일정 추가</h2>
          <button type="submit" className={styles.checkButton} disabled={isSubmitting}>
            <IoMdCheckmark />
          </button>
        </header>
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

        <div className={styles.toggleArea}>
          <label className={styles.toggleStyle} htmlFor="toggleSwitch" role="switch">
            <h3>하루 종일</h3>
            <input
              id="toggleSwitch"
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
