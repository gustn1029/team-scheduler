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
      console.log("로그인 완료");
      setLoginError(null);
      navigate("/");
    } catch (error) {
      console.error("로그인 실패:", error);
      setLoginError("이메일/비밀번호가 일치하지 않습니다.");
    }
  };

  const googleLoginMutation = useMutation({
    mutationFn: googleAuthFetch,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      navigate("/");
    },
    onError: (error) => {
      throw new Error(error.message);
    },
  });

  // const logoutMutation = useMutation({
  //   mutationFn: logoutFetch,
  //   onSuccess: async () => {
  //     await queryClient.invalidateQueries({ queryKey: ["users"] });
  //   },
  //   onError: (err) => {
  //     console.error(err.message);
  //   },
  // });

  const handleGoogleSignIn = async () => {
    await googleLoginMutation.mutateAsync();
  };

  const handleNavigateToFindPassword = React.useCallback(() => {
    navigate("/findpassword");
  }, [navigate]);

  // const handleLogout = () => {
  //   logoutMutation.mutateAsync();
  // };

  return (
    <main>
      <div className={styles.logoContainer}>
        <img
          className={styles.logo}
          src="/src/assets/images/logo.svg"
          alt="TimeFlow"
        />
      </div>
      <h1 className={styles.h1}>TimeFlow</h1>
      <div className={styles.formContainer}>
        <h2>로그인</h2>
        <form className={styles.formGroup} onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.inputContainer}>
            <LabelInput
              type="email"
              label="userEmail"
              placeholder="이메일 주소"
              register={register("userEmail", {
                required: { value: true, message: "필수 입력칸 입니다" },
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
            >
              {isSubmitting ? "처리중" : "로그인"}
            </Button>
            <LinkButton
              href={"/signup"}
              buttonStyle={ButtonStyleEnum.NormalWhite}
            >
              회원가입
            </LinkButton>
            <button onClick={handleGoogleSignIn}>
              <img src="/src/assets/images/googleLogo.svg" alt="구글 로그인" />
            </button>
            <Button
              onClick={handleNavigateToFindPassword}
              type="button"
              className={styles.lostPw}
            >
              비밀번호를 분실하셨나요?
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
};
export default Login;
