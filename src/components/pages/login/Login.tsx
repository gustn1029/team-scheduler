import { useMutation } from "@tanstack/react-query";
import { googleAuthFetch, queryClient } from "../../../utils/http";
import styles from "./login.module.scss";
import LabelInput from "../../inputs/input/LabelInput";
import { useForm } from "react-hook-form";
import Button from "../../button/Button";
import { ButtonStyleEnum } from "../../../types/enum/ButtonEnum";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { appAuth } from "../../../firebase/config";
import LinkButton from "../../button/LinkButton";
import logo from "../../../assets/images/logo.svg";
import googleLogo from "../../../assets/images/googleLogo.svg";
import MainAnimationLayout from "../../layouts/MainAnimationLayout";
import { layoutYVarients } from "../../../utils/Animations";

interface FormData {
  userEmail: string;
  userPassword: string;
}

const Login: React.FC = () => {
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    handleSubmit,
    register,
    watch,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<FormData>();

  const navigate = useNavigate();

  const onSubmit = async (data: FormData) => {
    try {
      await signInWithEmailAndPassword(
        appAuth,
        data.userEmail,
        data.userPassword
      );
      await queryClient.invalidateQueries({
        queryKey: ["auth", appAuth.currentUser?.uid],
      });
      console.log("로그인 완료");
      sessionStorage.setItem("user", "true");
      navigate("/calendar");
      setLoginError(null);
    } catch (error) {
      console.error("로그인 실패:", error);
      setLoginError("이메일/비밀번호가 일치하지 않습니다.");
    }
  };

  const googleLoginMutation = useMutation({
    mutationFn: googleAuthFetch,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["auth", appAuth.currentUser?.uid],
      });
      sessionStorage.setItem("user", "true");
      navigate("/calendar");
    },
    onError: (error) => {
      throw new Error(error.message);
    },
  });

  const handleGoogleSignIn = async () => {
    await googleLoginMutation.mutateAsync();
  };

  const handleNavigateToFindPassword = React.useCallback(() => {
    navigate("/findpassword");
  }, [navigate]);

  return (
    <MainAnimationLayout variants={layoutYVarients} className={styles.mainContainer}>
      <section className={styles.logoContainer}>
        <img className={styles.logo} src={logo} alt="TimeFlow" />
      <h1 className={styles.h1}>TimeFlow</h1>
      </section>
      <div className={styles.formContainer}>
        <h2>로그인</h2>
        <form
          className={styles.formGroup}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div className={styles.inputContainer}>
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
              errorView={errors.userPassword}
              isLabelTextHidden={true}
            />
          </div>
          {loginError && <p className={styles.errorMessage}>{loginError}</p>}
          <div className={styles.buttonContainer}>
            <Button
              type="submit"
              buttonStyle={ButtonStyleEnum.Normal}
              disabled={isSubmitting}
              buttonClassName={styles.loginButton}
            >
              {isSubmitting ? "처리중" : "로그인"}
            </Button>
          </div>
        </form>
        <LinkButton
          href={"/signup"}
          buttonStyle={ButtonStyleEnum.NormalWhite}
          buttonClassName={styles.signInButton}
        >
          회원가입
        </LinkButton>
        <button onClick={handleGoogleSignIn} className={styles.googleLogin}>
          <img src={googleLogo} alt="구글 로그인" />
        </button>
        <Button
          onClick={handleNavigateToFindPassword}
          type="button"
          className={styles.lostPw}
        >
          비밀번호를 분실하셨나요?
        </Button>
      </div>
    </MainAnimationLayout>
  );
};
export default Login;
