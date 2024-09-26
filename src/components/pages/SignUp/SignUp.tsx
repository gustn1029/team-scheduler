import React, { ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import Button from "../../button/Button";
import LabelInput from "../../inputs/input/LabelInput";

export const SignUp: React.FC = () => {
  const onSubmit = (data: any) => {
    console.log(data);
  };

  const {
    handleSubmit,
    register,
    watch,
    formState: { errors, isSubmitted, isSubmitting },
  } = useForm();

  return (
    <>
      <img src="../../../assets/images/logo.svg" alt="TimeFlow" />
      <h1>TimeFlow</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <LabelInput
          type="email"
          label="userEmail"
          placeholder="이메일 주소"
          register={register("userEmail", {
            required: { value: true, message: "필수 입력칸 입니다" },
            onChange: (e: ChangeEvent<HTMLInputElement>) => {
              console.log(e.target.value);
            },
          })}
          watch={watch}
          aria-invalid={
            isSubmitted ? (errors.userEmail ? true : false) : undefined
          }
        />
        {errors.userEmail && (
          <p>{errors.userEmail.message as React.ReactNode}</p>
        )}
        <LabelInput
          type="password"
          label="userPassword"
          placeholder="비밀번호"
          register={register("userPassword", {
            required: { value: true, message: "필수 입력칸 입니다" },
            onChange: (e: ChangeEvent<HTMLInputElement>) => {
              console.log(e.target.value);
            },
            minLength: {
              value: 8,
              message: "8자리 이상 입력",
            },
          })}
          watch={watch}
          aria-invalid={
            isSubmitted ? (errors.userEmail ? true : false) : undefined
          }
        />
        {errors.userPassword && (
          <p>{errors.userPassword.message as React.ReactNode}</p>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "처리중" : "확인"}
        </Button>
      </form>
    </>
  );
};
