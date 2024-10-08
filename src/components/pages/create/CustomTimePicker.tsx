import React, { useRef, useEffect } from 'react';
import { IoMdArrowDropdown, IoMdArrowDropup } from 'react-icons/io';
import styles from './create.module.scss';

interface CustomTimePickerProps {
  selectedTime: Date | null;
  onTimeChange: React.Dispatch<React.SetStateAction<Date | null>>;
  isOpen: boolean;
  onToggle: () => void;
}

const CustomTimePicker: React.FC<CustomTimePickerProps> = ({ selectedTime, onTimeChange, isOpen, onToggle }) => {
  const pickerRef = useRef<HTMLDivElement>(null);
  
  const generateTimeOptions = () => {
    const times: string[] = [];
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 60; j += 15) {
        const hour = i.toString().padStart(2, '0');
        const minute = j.toString().padStart(2, '0');
        times.push(`${hour}:${minute}`);
      }
    }
    return times;
  };

  const getTimeValue = (date: Date | null) => {
    if (!date) return '';
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleSelectTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(':').map(Number);
      const updatedDate = new Date();
      updatedDate.setHours(hours, minutes, 0, 0);
      onTimeChange(updatedDate);
      onToggle(); // 선택 후 드롭다운 닫기
    } catch (error) {
      console.error("시간 선택에 문제가 발생했습니다.", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onToggle();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    // Cleanup 이벤트 리스너
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggle]);

  const timeOptions = generateTimeOptions();

  return (
    <div className={styles.customDropdown} ref={pickerRef}>
      <div className={styles.selectedTime} onClick={onToggle}>
        <span>{selectedTime ? getTimeValue(selectedTime) : '시간 선택'}</span>
        <i className={styles.arrowIcon}>
          {isOpen ? <IoMdArrowDropup /> : <IoMdArrowDropdown />}
        </i>
      </div>
      {isOpen && (
        <ul className={styles.timeOptions}>
          {timeOptions.map((time, index) => (
            <li
              key={index}
              className={styles.timeOption}
              onClick={() => handleSelectTime(time)}
            >
              {time}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomTimePicker;
