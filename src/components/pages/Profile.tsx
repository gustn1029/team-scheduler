import { useIsMutating, useMutation, useQuery } from "@tanstack/react-query";
import { appAuth } from "../../firebase/config";
import {
  userDataFetch,
  uploadProfileImage,
  profileUpdateFetch,
  queryClient,
  deleteUserFetch,
} from "../../utils/http";
import React, { useState, useRef, useEffect } from "react";
import styles from "./Profile.module.scss";
import LabelInput from "../inputs/input/LabelInput";
import { FieldError, useForm } from "react-hook-form";
import Button from "../button/Button";
import { ButtonStyleEnum } from "../../types/enum/ButtonEnum";
import Header from "../header/Header";

import { FaPen } from "react-icons/fa6";
import { ProfileData } from "../../types";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Modal from "../modal/Modal";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import Loader from "../loader/Loader";
import { AnimatePresence, motion } from "framer-motion";
import MainAnimationLayout from "../layouts/MainAnimationLayout";
import { layoutYVarients } from "../../utils/Animations";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDeleteUserModal, setIsDeleteUserModal] = useState<boolean>(false);
  const [isCheckPasswordDeleteUserModal, setIsCheckPasswordDeleteUserModal] =
    useState<boolean>(false);
  const [isDeleteUserLoading, setIsDeleteUserLoading] =
    useState<boolean>(false);
  const navigate = useNavigate();
  const isMutating = useIsMutating();

  // 현재 로그인한 사용자의 프로필 데이터를 가져오는 쿼리
  const { data: userData, isPending } = useQuery({
    queryKey: ["auth", appAuth!.currentUser!.uid],
    queryFn: () => userDataFetch(appAuth!.currentUser!.uid),
    enabled: !!appAuth!.currentUser!.uid,
  });

  // 프로필 업데이트를 위한 뮤테이션
  const updateProfileMutation = useMutation({
    mutationFn: profileUpdateFetch,
    onSuccess: () => {
      toast.success("프로필을 수정했습니다.");
      setIsEditing(false);
      queryClient.invalidateQueries({
        queryKey: ["auth", appAuth!.currentUser!.uid],
      });
    },
  });

  // 사용자 계정 삭제를 위한 뮤테이션
  const deleteUserMutation = useMutation({
    mutationFn: deleteUserFetch,
    onSuccess: () => {
      toast.dark("정상적으로 탈퇴되었습니다.");
      sessionStorage.removeItem("user");
      queryClient.removeQueries({ queryKey: ["auth"] });

      navigate("/login");
    },
    onError: () => {
      setIsDeleteUserModal(false);
    },
  });

  const {
    register,
    watch,
    formState: { errors },
    handleSubmit,
    setValue,
  } = useForm<ProfileData>();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // userData가 변경될 때 닉네임 필드 값을 설정
  useEffect(() => {
    if (userData) {
      setValue("nickname", userData?.nickname);
    }
  }, [userData, setValue]);

  // 편집 모드가 종료될 때 이미지 프리뷰와 파일 선택 초기화
  useEffect(() => {
    if (!isEditing) {
      setImagePreview(null);
      setFile(null);
    }
  }, [isEditing]);

  // 숨겨진 파일 입력 요소 클릭 트리거
  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  // 편집 모드 활성화
  const handleEditClick = () => {
    setIsEditing(true);
  };

  // 파일 선택 시 처리 함수
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  // 프로필 업데이트 제출 핸들러
  const onSubmit = async (data: ProfileData) => {
    const currentUser = appAuth.currentUser;
    if (!userData || !currentUser) return;

    const { profileImg } = await uploadProfileImage(
      file,
      file ? file?.name : ""
    );

    setImagePreview(profileImg !== "" ? profileImg : userData?.profileImg);

    const updateProfile: ProfileData = {
      nickname: data.nickname,
      profileImg: profileImg !== "" ? profileImg : userData?.profileImg,
    };
    await updateProfileMutation.mutateAsync({
      data: updateProfile,
      id: userData.id as string,
    });
  };

  // 모달 창 닫기 함수
  const handleCloseModal = () => {
    setIsEditing(false);
    if (isDeleteUserModal) {
      setIsDeleteUserModal(false);
    }

    if (isCheckPasswordDeleteUserModal) {
      setIsCheckPasswordDeleteUserModal(false);
    }
  };

  // 사용자 재인증 함수
  async function reauthenticate(password: string) {
    const user = appAuth.currentUser;
    if (!user || !user.email) throw new Error("No user logged in");

    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      return true;
    } catch (error) {
      console.error(error);
      alert("비밀번호가 일치하지 않습니다.");
      return false;
    }
  }

  // 비밀번호 확인 모달 표시 함수
  const handleShowIsCheckPasswordDeleteUserModal = () => {
    setIsCheckPasswordDeleteUserModal(true);
    setIsDeleteUserModal(false);
  };

  // 비밀번호 확인 모달 취소 함수
  const handleCancelIsCheckPasswordDeleteUserModal = () => {
    setIsCheckPasswordDeleteUserModal(false);
  };

  // 계정 삭제 처리 함수
  const handleDeleteAccount = async () => {
    const currentUser = appAuth.currentUser;

    if (!currentUser || !userData || !userData.id) {
      alert("로그인 된 사용자가 없습니다.");
      return;
    }

    const password: string = watch("userPassword") ?? "";

    if (password === "") {
      alert("비밀번호가 입력되지 않았습니다.");
      return;
    }

    setIsDeleteUserLoading(true);

    try {
      // 재인증
      const checkAuth = await reauthenticate(password);

      if (!checkAuth) {
        return;
      }

      handleCancelIsCheckPasswordDeleteUserModal();

      await deleteUserMutation.mutateAsync({
        user: currentUser,
        id: userData?.id,
        uid: currentUser.uid,
      });
    } catch (error) {
      console.error("오류 발생:", error);
      throw new Error("계정 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleteUserLoading(false);
    }
  };

  return (
    <MainAnimationLayout variants={layoutYVarients}>
      {isMutating || (isDeleteUserLoading && <Loader />)}
      <Header
        onCancel={isEditing ? () => setIsEditing(false) : undefined}
        title={`${isEditing ? "프로필 편집" : "프로필 관리"}`}
      >
        {isEditing ? (
          <Button
            buttonStyle={ButtonStyleEnum.NONE}
            style={{
              padding: "0px 0px 1px",
              borderBottom: "1px solid #333",
              borderRadius: "0",
              fontSize: "14px",
            }}
            onClick={() => setIsDeleteUserModal(true)}
          >
            회원탈퇴
          </Button>
        ) : undefined}
      </Header>
      <section className={styles.profileContainer}>
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="editing"
              initial={{
                scale: 0.5,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              exit={{
                scale: 0.5,
                opacity: 0,
              }}
              transition={{
                duration: 0.15,
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png"
              />
              <Button
                type="button"
                buttonClassName={styles.imgUploadBtn}
                buttonStyle={ButtonStyleEnum.NONE}
                onClick={handleFileButtonClick}
              >
                <img
                  className={styles.profileImage}
                  src={imagePreview || userData?.profileImg}
                  alt="프로필 사진"
                />
                <span className={styles.editImgIcon}>
                  <FaPen />
                </span>
              </Button>
              <form
                className={styles.profileForm}
                onSubmit={handleSubmit(onSubmit)}
              >
                <LabelInput
                  labelClassName={styles.label}
                  inputClassName={styles.input}
                  type="text"
                  label="별명"
                  register={register("nickname", {
                    required: { value: true, message: "별명을 입력하세요." },
                    maxLength: {
                      value: 20,
                      message: "20자리 이하 입력",
                    },
                    minLength: {
                      value: 3,
                      message: "3자리 이상 입력",
                    },
                  })}
                  watch={watch}
                  error={errors}
                  errorView={errors.nickname as FieldError}
                />
                <section className={styles.emailWrap}>
                  <strong className={styles.emailLabel}>이메일</strong>
                  <p className={styles.email}>{userData?.email || ""}</p>
                </section>
                <section className={styles.modalButtons}>
                  <Button
                    type="button"
                    buttonStyle={ButtonStyleEnum.Cancel}
                    onClick={handleCloseModal}
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    buttonStyle={ButtonStyleEnum.Normal}
                    disabled={isPending}
                  >
                    {isPending ? "업로드 중..." : "확인"}
                  </Button>
                </section>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="viewing"
              initial={{
                scale: 0.5,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              exit={{
                scale: 0.5,
                opacity: 0,
              }}
              transition={{
                duration: 0.15,
              }}
            >
              <div>
                <img
                  className={`${styles.profileImage} ${styles.view}`}
                  src={imagePreview || userData?.profileImg}
                  alt="Profile"
                />
              </div>
              <strong className={styles.nickname}>{userData?.nickname}</strong>
              <p className={styles.email}>{userData?.email}</p>
              <Button
                buttonStyle={ButtonStyleEnum.NormalWhite}
                onClick={handleEditClick}
                buttonClassName={styles.editButton}
              >
                프로필 편집
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
      <AnimatePresence>
        {isDeleteUserModal && (
          <Modal
            isOpen={isDeleteUserModal}
            onClose={() => setIsDeleteUserModal(false)}
          >
            <strong className={styles.deleteModalTitle}>
              회원탈퇴하시면
              <br />
              관련된 모든 데이터가 삭제 됩니다.
              <br />
              탈퇴하시겠습니까?
            </strong>
            <div className={styles.deleteModalBtnWrap}>
              <Button
                buttonStyle={ButtonStyleEnum.Cancel}
                onClick={() => setIsDeleteUserModal(false)}
              >
                취소
              </Button>
              <Button
                buttonStyle={ButtonStyleEnum.Normal}
                onClick={handleShowIsCheckPasswordDeleteUserModal}
              >
                탈퇴
              </Button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isCheckPasswordDeleteUserModal && (
          <Modal
            isOpen={isCheckPasswordDeleteUserModal}
            onClose={handleCancelIsCheckPasswordDeleteUserModal}
          >
            <strong className={styles.deleteModalTitle}>
              계정 삭제를 위해
              <br />
              비밀번호를 입력해주세요.
            </strong>
            <LabelInput
              label="userPassword"
              type="password"
              register={register("userPassword", {
                required: {
                  value: true,
                  message: "비밀번호를 입력해 주세요.",
                },
              })}
              isLabelTextHidden
              labelClassName={styles.passwordCheckModalLabel}
              inputClassName={styles.input}
              watch={watch}
              error={errors}
              errorView={errors.userPassword}
            />
            <div className={styles.deleteModalBtnWrap}>
              <Button
                buttonStyle={ButtonStyleEnum.Cancel}
                onClick={handleCancelIsCheckPasswordDeleteUserModal}
              >
                취소
              </Button>
              <Button
                buttonStyle={ButtonStyleEnum.Normal}
                onClick={handleDeleteAccount}
              >
                확인
              </Button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </MainAnimationLayout>
  );
};

export default Profile;
