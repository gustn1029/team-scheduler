import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Button from "../../button/Button";
import LabelInput from "../../inputs/input/LabelInput";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { appAuth, appFireStore, appStorage } from "../../../firebase/config";
import styles from "./signup.module.scss";
import { ButtonStyleEnum } from "../../../types/enum/ButtonEnum";
import { doc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import LinkButton from "../../button/LinkButton";
import logo from "../../../assets/images/logo.svg";

interface FormData {
  userNickName: string;
  userEmail: string;
  userPassword: string;
  userPasswordCheck: string;
}

export const SignUp: React.FC = () => {
  const {
    handleSubmit,
    register,
    watch,
    formState: { errors, isSubmitted, isSubmitting },
    reset,
    getValues,
    setError,
    clearErrors,
  } = useForm<FormData>();

  const [isFormFilled, setIsFormFilled] = useState(false);

  useEffect(() => {
    const subscription = watch((value) => {
      const { userNickName, userEmail, userPassword, userPasswordCheck } =
        value;
      setIsFormFilled(
        !!userNickName && !!userEmail && !!userPassword && !!userPasswordCheck
      );
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  async function getImageUrl(): Promise<string> {
    const imagePath =
      "gs://timeflow-e3a51.appspot.com/profileImages/profile.png";
    const imageRef = ref(appStorage, imagePath);

    try {
      const url = await getDownloadURL(imageRef);
      return url;
    } catch (error) {
      console.error("Error getting download URL: ", error);
      throw error;
    }
  }

  const navigate = useNavigate();

  const onSubmit = async (data: FormData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        appAuth,
        data.userEmail,
        data.userPassword
      );
      const userId = userCredential.user.uid;
      const userProfileImg = await getImageUrl();

      await setDoc(doc(appFireStore, "users", userCredential.user.uid), {
        uid: userId,
        email: data.userEmail,
        nickname: data.userNickName,
        profileImg: userProfileImg,
      });
      navigate("/login");
      reset();
    } catch (error) {
      console.error("Error signing up", error);
    }
  };

  // 비밀번호 값 수정 시 비밀번호 확인 값도 유효성 체크
  useEffect(() => {
    if (
      watch("userPassword") !== watch("userPasswordCheck") &&
      watch("userPasswordCheck")
    ) {
      setError("userPasswordCheck", {
        type: "password-mismatch",
        message: "비밀번호가 일치하지 않습니다",
      });
    } else {
      clearErrors("userPasswordCheck");
    }
  }, [clearErrors, setError, watch]);

  return (
    <main>
      <div className={styles.logoContainer}>
        <img className={styles.logo} src={logo} alt="TimeFlow" />
      </div>
      <h1 className={styles.h1}>TimeFlow</h1>
      <div className={styles.formContainer}>
        <h2>회원가입</h2>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.formGroup}>
          <div className={styles.inputContainer}>
            <LabelInput
              type="text"
              label="userNickName"
              placeholder="닉네임 설정"
              register={register("userNickName", {
                required: { value: true, message: "필수 입력칸 입니다" },
              })}
              watch={watch}
              ariaInvalid={
                isSubmitted ? (errors.userNickName ? true : false) : undefined
              }
              error={errors}
              errorView={errors.userNickName}
              isLabelTextHidden={true}
            />
            <LabelInput
              type="email"
              label="userEmail"
              placeholder="이메일 주소"
              register={register("userEmail", {
                required: { value: true, message: "필수 입력칸 입니다" },
                pattern: {
                  value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i,
                  message: "이메일 형식에 맞춰 작성",
                },
              })}
              watch={watch}
              ariaInvalid={
                isSubmitted ? (errors.userEmail ? true : false) : undefined
              }
              error={errors}
              errorView={errors.userEmail}
              isLabelTextHidden={true}
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
                pattern: {
                  value:
                    /^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\\[\]{};':"\\|,.<>\\/?]).*$/,
                  message: "영어 소문자, 숫자, 특수문자 포함하여 입력",
                },
              })}
              watch={watch}
              ariaInvalid={
                isSubmitted ? (errors.userPassword ? true : false) : undefined
              }
              error={errors}
              errorView={
                errors.userPassword && (
                  <ul>
                    {errors.userPassword.type === "required" && (
                      <li>{errors.userPassword.message}</li>
                    )}
                    {errors.userPassword.type === "minLength" && (
                      <li>{errors.userPassword.message}</li>
                    )}
                    {errors.userPassword.type === "pattern" && (
                      <li>{errors.userPassword.message}</li>
                    )}
                  </ul>
                )
              }
              isLabelTextHidden={true}
            />
            <LabelInput
              type="password"
              label="userPasswordCheck"
              placeholder="비밀번호 확인"
              register={register("userPasswordCheck", {
                required: { value: true, message: "필수 입력칸 입니다" },
                validate: {
                  matchPassword: (value) => {
                    const { userPassword } = getValues();
                    return (
                      userPassword === value || "비밀번호가 일치하지 않습니다"
                    );
                  },
                },
              })}
              watch={watch}
              ariaInvalid={
                isSubmitted
                  ? errors.userPasswordCheck
                    ? true
                    : false
                  : undefined
              }
              error={errors}
              errorView={errors.userPasswordCheck}
              isLabelTextHidden={true}
            />
          </div>
          <div className={styles.buttonContainer}>
            <LinkButton href={"/login"} buttonStyle={ButtonStyleEnum.Cancel}>
              취소
            </LinkButton>
            <Button
              type="submit"
              disabled={isSubmitting}
              buttonStyle={
                isFormFilled ? ButtonStyleEnum.Normal : ButtonStyleEnum.Primary
              }
            >
              {isSubmitting ? "처리중" : "확인"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
};
