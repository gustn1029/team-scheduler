import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { RiCloseFill } from 'react-icons/ri';
import { IoMdCheckmark } from 'react-icons/io';
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import styles from './create.module.scss';
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
          <span>작성자</span>
          <img
            className={styles.writerProfile}
            src=""
            alt="writerProfile"
          />
        </div>
        <div className={styles.titleIpt}>
          <LabelInput
            type="text"
            label="userNickName"
            placeholder="제목"
            register={register("title", {
              required: { value: true, message: "제목을 입력하세요." },
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
            <span className={styles.colorTitle}>색상 선택</span>
            <button className={styles.val} type="button" onClick={toggleSelectBox}>
              <div className={`${styles.colorBox} ${selectedColor}`}></div>
              <span className={styles.selectName}>{selectedText}</span>
              <i className={styles.selectIcon}>{isOpen ? <IoMdArrowDropup /> : <IoMdArrowDropdown />}</i>
            </button>
          </div>
          {isOpen && (
            <ul className={`${styles.colorList} ${isOpen ? styles.view : styles.hidden}`}>
              {colorOptions.map((option) => (
                <li className={styles.selectOption} key={option.colorClass} onClick={() => handleColorSelect(option.colorClass, option.colorName)}>
                  <div className={`colorBox ${option.colorClass}`}></div>
                  <span>{option.colorName}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </form>
    </main>
  );
};

export default Create;