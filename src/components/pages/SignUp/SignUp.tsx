import React from "react";
import { useForm } from "react-hook-form";
import Button from "../../button/Button";
import LabelInput from "../../inputs/input/LabelInput";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { appAuth } from "../../../firebase/config";
import styles from "./signup.module.scss";

interface FormData {
  userEmail: string;
  userPassword: string;
}

export const SignUp: React.FC = () => {
  const {
    handleSubmit,
    register,
    watch,
    formState: { errors, isSubmitted, isSubmitting },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        appAuth,
        data.userEmail,
        data.userPassword
      );
      console.log("User signed up:", userCredential.user);
    } catch (error) {
      console.error("Error signing up", error);
    }
  };

  return (
    <>
      <img src="/src/assets/images/logo.svg" alt="TimeFlow" />
      <h1>TimeFlow</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <LabelInput
          type="email"
          label="userEmail"
          placeholder="이메일 주소"
          register={register("userEmail", {
            required: { value: true, message: "필수 입력칸 입니다" },
          })}
          watch={watch}
          aria-invalid={
            isSubmitted ? (errors.userEmail ? true : false) : undefined
          }
          children={undefined}
          error={errors}
          errorView={errors.userEmail}
        />

        <LabelInput
          type="password"
          label="userPassword"
          placeholder="비밀번호"
          register={register("userPassword", {
            required: { value: true, message: "필수 입력칸 입니다" },
            minLength: {
              value: 8,
              message: "8자리 이상 입력",
            },
          })}
          watch={watch}
          aria-invalid={
            isSubmitted ? (errors.userEmail ? true : false) : undefined
          }
          children={undefined}
          error={errors}
          errorView={errors.userPassword}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "처리중" : "확인"}
        </Button>
      </form>
    </>
  );
};
