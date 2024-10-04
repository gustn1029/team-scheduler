import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { RiCloseFill } from 'react-icons/ri';
import { IoMdCheckmark } from 'react-icons/io';
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './create.module.scss';
import { ko } from 'date-fns/locale/ko';
import LabelInput from '../../inputs/input/LabelInput';

interface FormInputs {
  title: string;
}

const Create: React.FC = () => {
  const {
    handleSubmit,
    register,
    watch,
    formState: { errors, isSubmitted, isSubmitting },
    reset,
  } = useForm<FormInputs>();

  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    console.log(data);
  };

  const handleClose = () => {
    console.log('close');
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
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  const initalTime = new Date();
  initalTime.setHours(12, 0, 0, 0);

  const [startTime, setStartTime] = useState<Date | null>(initalTime);
  const [endTime, setEndTime] = useState<Date | null>(initalTime);

  const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(event.target.checked);
  };

  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      setStartDate(date);
      if (!endDate || date > endDate) {
        setEndDate(date);
      }
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      if (startDate && date < startDate) {
        setStartDate(date);
      }
      setEndDate(date);
    }
  };

  const CustomTimePicker: React.FC<{ selectedTime: Date | null, onTimeChange: React.Dispatch<React.SetStateAction<Date | null>> }> = ({ selectedTime, onTimeChange }) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const time = event.target.value;
      const [hours, minutes] = time.split(':').map(Number);

      const updatedDate = new Date();
      updatedDate.setHours(hours, minutes, 0, 0);

      onTimeChange(updatedDate);
    };

    const getTimeValue = (date: Date | null) => {
      if (!date) return '';
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    };

    return (
      <input
        className={styles.timeInput}
        type="time"
        value={getTimeValue(selectedTime)}
        onChange={handleChange}
        step="900"
      />
    );
  };

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
            src=""
            alt="writerProfile"
          />
        </div>
        <div className={styles.titleIpt}>
          <LabelInput
            type="text"
            label="Title"
            placeholder="제목"
            register={register("title", {
              required: { value: true, message: "제목을 입력하세요." },
              minLength: { value: 3, message: "제목은 최소 3자 이상 입력하세요." },
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
              type="checkbox"
              checked={isChecked}
              onChange={handleToggleChange}
            />
          </label>
        </div>
        <div className={styles.calendar}>
          <div className={styles.pickerGroup}>
            <DatePicker
              className={styles.datePicker}
              selected={startDate}
              onChange={handleStartDateChange}
              dateFormat='yyyy년 MM월 dd일 (EEE)'
              locale={ko}
              placeholderText="시작 날짜를 선택하세요"
            />
            {!isChecked && (
              <div className={styles.timePickerWrapper}>
                <CustomTimePicker selectedTime={startTime} onTimeChange={setStartTime} />
              </div>
            )}
          </div>
          <div className={styles.pickerGroup}>
            <DatePicker
              className={styles.datePicker}
              selected={endDate}
              onChange={handleEndDateChange}
              dateFormat='yyyy년 MM월 dd일 (EEE)'
              locale={ko}
              placeholderText="종료 날짜를 선택하세요"
            />
            {!isChecked && (
              <div className={styles.timePickerWrapper}>
                <CustomTimePicker
                  selectedTime={endTime}
                  onTimeChange={setEndTime}
                />
              </div>
            )}
          </div>
        </div>
        <div className={styles.meMo}>
          <h3>메모</h3>
          <textarea
            className={styles.textArea}
            placeholder="메모를 입력하세요">
          </textarea>
        </div>
      </form>
    </main>
  );
};

export default Create;
