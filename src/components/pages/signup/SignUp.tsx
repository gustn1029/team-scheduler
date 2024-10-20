import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Button from "../../button/Button";
import LabelInput from "../../inputs/input/LabelInput";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { appAuth, appFireStore, appStorage } from "../../../firebase/config";
import { ButtonStyleEnum } from "../../../types/enum/ButtonEnum";
import styles from "./signup.module.scss";
import { doc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import LinkButton from "../../button/LinkButton";
import logo from "../../../assets/images/logo.svg";
import defaultProfileImage from "../../../assets/images/profile/profile.png";
import { FirebaseError } from "firebase/app";
import MainAnimationLayout from "../../layouts/MainAnimationLayout";
import { layoutYVarients } from "../../../utils/Animations";

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
    const imagePath = "profileImages/profile.png";
    const imageRef = ref(appStorage, imagePath);

    try {
      const url = await getDownloadURL(imageRef);
      return url;
    } catch (error) {
      console.error("다운로드 URL을 가져오는 중 오류가 발생했습니다. ", error);
      throw uploadDefaultImage();
    }
  }

  async function uploadDefaultImage(): Promise<string> {
    const imagePath = `profileImages/profile.png`;
    const imageRef = ref(appStorage, imagePath);

    try {
      const response = await fetch(defaultProfileImage);
      const blob = await response.blob();

      await uploadBytes(imageRef, blob);

      const url = await getDownloadURL(imageRef);
      return url;
    } catch (error) {
      console.error("기본 이미지 업로드 중 오류가 발생했습니다. ", error);
      return defaultProfileImage;
    }
  }

  const navigate = useNavigate();

  const onSubmit = async (data: FormData) => {
    try {
      clearErrors("userEmail");
      const userCredential = await createUserWithEmailAndPassword(
        appAuth,
        data.userEmail,
        data.userPassword
      );
      const userId = userCredential.user.uid;

      let userProfileImg;
      try {
        userProfileImg = await getImageUrl();
      } catch (error) {
        console.error(
          "프로필 이미지를 가져오는 중 오류가 발생했습니다. ",
          error
        );
        userProfileImg = defaultProfileImage;
      }

      await setDoc(doc(appFireStore, "users", userCredential.user.uid), {
        uid: userId,
        email: data.userEmail,
        nickname: data.userNickName,
        profileImg: userProfileImg,
      });
      navigate("/login");
      reset();
    } catch (error: unknown) {
      console.error("Error signing up", error);
      if (error instanceof FirebaseError && "code" in error) {
        if (error.code === "auth/email-already-in-use") {
          setError("userEmail", {
            type: "manual",
            message: "이미 사용 중인 이메일 주소입니다.",
          });
        } else {
          setError("userEmail", {
            type: "manual",
            message: "회원가입 중 오류가 발생했습니다. 다시 시도해 주세요.",
          });
        }
      } else {
        setError("userEmail", {
          type: "manual",
          message: "알 수 없는 오류가 발생했습니다. 다시 시도해 주세요.",
        });
      }
    }
  };

  useEffect(() => {
    if (
      watch("userPassword") !== watch("userPasswordCheck") &&
      watch("userPasswordCheck")
    ) {
      setError("userPasswordCheck", {
        type: "password-mismatch",
        message: "비밀번호가 일치하지 얺습니다.",
      });
    } else {
      clearErrors("userPasswordCheck");
    }
  }, [clearErrors, setError, watch]);

  return (
    <MainAnimationLayout variants={layoutYVarients}>
      <div className={styles.logoContainer}>
        <img className={styles.logo} src={logo} alt="TimeFlow" />
      </div>
      <h1 className={styles.h1}>TimeFlow</h1>
      <div className={styles.formContainer}>
        <h2>회원가입</h2>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={styles.formGroup}
          noValidate
        >
          <div className={styles.inputContainer}>
            <LabelInput
              type="text"
              label="userNickName"
              placeholder="닉네임 설정"
              register={register("userNickName", {
                required: { value: true, message: "필수 입력칸입니다." },
                maxLength: {
                  value: 10,
                  message: "닉네임은 최대 10자입니다.",
                },
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
                required: { value: true, message: "필수 입력칸입니다." },
                validate: {
                  emailFormat: (value) => {
                    const emailRegex =
                      /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;
                    return (
                      emailRegex.test(value) || "올바른 이메일 형식이 아닙니다."
                    );
                  },
                  localPartLength: (value) => {
                    const localPart = value.split("@")[0];
                    return (
                      localPart.length <= 30 ||
                      "로컬 부분(@ 앞)은 30자 내로 작성해야 합니다."
                    );
                  },
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
                required: { value: true, message: "필수 입력칸입니다." },
                minLength: {
                  value: 8,
                  message: "8자리 이상 입력해야 합니다.",
                },
                pattern: {
                  value:
                    /^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\\[\]{};':"\\|,.<>\\/?]).*$/,
                  message: "소문자, 숫자, 특수문자 모두 포함해야 합니다.",
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
                required: { value: true, message: "필수 입력칸입니다." },
                validate: {
                  matchPassword: (value) => {
                    const { userPassword } = getValues();
                    return (
                      userPassword === value || "비밀번호가 일치하지 않습니다."
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
    </MainAnimationLayout>
  );
};
