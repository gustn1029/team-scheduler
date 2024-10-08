import { ChangeEvent } from "react";
import { OptionList } from "../../types";
import { FieldError, useForm } from "react-hook-form";
import LabelTextarea from "../inputs/textarea/LabelTextarea";
import LabelSelect from "../inputs/select/LabelSelect";
import LabelRadio from "../inputs/radio/LabelRadio";
import LabelCheckbox from "../inputs/checkbox/LabelCheckbox";
import LabelInput from "../inputs/input/LabelInput";
import styles from './formTest.module.scss'
import LabelToggle from "../inputs/toggle/LabelToggle";

const FormTest = () => {
  const checkboxOptionList: OptionList[] = [
    { text: "체크박스1", value: "1" },
    { text: "체크박스2", value: "2" },
  ];

  const radioOptionList: OptionList[] = [
    { text: "라디오1", value: "1" },
    { text: "라디오2", value: "2" },
  ];

  const selectOptionList: OptionList[] = [
    { text: "select1", value: "1" },
    { text: "select2", value: "2" },
  ];

  const hookForm = useForm();
  console.log(hookForm.formState.errors)
  const onSubmit = (data: any) => {
    console.log(data);
  };
  return (
    <div>
      <h2>form test</h2>
      <form onSubmit={hookForm.handleSubmit(onSubmit)} className={styles.wrap}>
        <LabelInput
          register={hookForm.register("userName", {
            required: {
                value: true, message: "이건 필수로 입력"
            },
            onChange: (e: ChangeEvent<HTMLInputElement>) => {
              console.log(e.target.value);
            },
          })}
          label="userName"
          watch={hookForm.watch}
          error={hookForm.formState.errors}
          errorView={hookForm.formState.errors.userName as FieldError}
        />
        <LabelCheckbox
          optionList={checkboxOptionList}
          label="myCheckbox"
          register={hookForm.register("myCheckbox", {
            required: {
                value: true, message: "이건 필수로 선택"
            },
            onChange: (e: ChangeEvent<HTMLInputElement>) => {
              console.log(e.target.value);
            },
          })}
          watch={hookForm.watch}
          error={hookForm.formState.errors}
          errorView={hookForm.formState.errors.myCheckbox as FieldError}
        />
        <LabelRadio
          optionList={radioOptionList}
          label="myRadio"
          register={hookForm.register("myRadio", {
            required: {
                value: true, message: "이건 필수로 선택"
            },
            onChange: (e: ChangeEvent<HTMLInputElement>) => {
              console.log(e.target.value);
            },
          })}
          watch={hookForm.watch}
          error={hookForm.formState.errors}
          errorView={hookForm.formState.errors.myRadio as FieldError}
        />
        <LabelSelect
          optionList={selectOptionList}
          label="mySelect"
          register={hookForm.register("mySelect", {
            required: {
              value: true,
              message: "이건 필수로 선택",
            },
            onChange: (e: ChangeEvent<HTMLInputElement>) => {
              console.log(e.target.value);
            },
          })}
          watch={hookForm.watch}
          error={hookForm.formState.errors}
          errorView={hookForm.formState.errors.mySelect as FieldError}
        />
        <LabelTextarea
          register={hookForm.register("userText", {
            required: {
              value: true,
              message: "이건 필수로 입력",
            },
            onChange: (e: ChangeEvent<HTMLTextAreaElement>) => {
              console.log(e.target.value);
            },
          })}
          label="userText"
          watch={hookForm.watch}
          error={hookForm.formState.errors}
          errorView={hookForm.formState.errors.userText as FieldError}
        />
        <LabelToggle
            label="userToggle"
            watch={hookForm.watch}
            register={hookForm.register('userToggle')}
            error={hookForm.formState.errors}
            errorView={hookForm.formState.errors.userToggle as FieldError}
        />
        <button type="submit">버튼</button>
      </form>
    </div>
  );
};

export default FormTest;
