import { useMutation, useQuery } from "@tanstack/react-query";
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

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDeleteUserModal, setIsDeleteUserModal] = useState<boolean>(false);
  const navigate = useNavigate();

  const { data: userData, isPending } = useQuery({
    queryKey: ["auth", appAuth!.currentUser!.uid],
    queryFn: () => userDataFetch(appAuth!.currentUser!.uid),
    enabled: !!appAuth!.currentUser!.uid,
  });

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
    formState: { errors, isSubmitted },
    handleSubmit,
    setValue,
  } = useForm<ProfileData>();

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userData) {
      setValue("nickname", userData?.nickname);
    }
  }, [userData, setValue]);

  useEffect(() => {
    if (!isEditing) {
      setImagePreview(null);
      setFile(null);
    }
  }, [isEditing]);

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

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
    updateProfileMutation.mutateAsync({
      data: updateProfile,
      id: userData.id as string,
    });
  };

  const handleCloseModal = () => {
    setIsEditing(false);
  };

  async function reauthenticate(password: string) {
    const user = appAuth.currentUser;
    if (!user || !user.email) throw new Error("No user logged in");

    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
  }

  function promptForPassword(): Promise<string> {
    return new Promise((resolve) => {
      const password = prompt("계정 삭제를 위해 비밀번호를 입력해주세요:");
      resolve(password || "");
    });
  }

  const handleDeleteAccount = async () => {
    const currentUser = appAuth.currentUser;

    if (!currentUser || !userData || !userData.id) {
      toast.error("로그인 된 사용자가 없습니다.");
      return;
    }

    const password = await promptForPassword();

    // 재인증
    await reauthenticate(password);

    deleteUserMutation.mutateAsync({
      user: currentUser,
      id: userData?.id,
      uid: currentUser.uid,
    });
  };

  return (
    <main>
      {(updateProfileMutation.isPending || deleteUserMutation.isPending) && (
        <Loader />
      )}
      <Header title={`${isEditing ? "프로필 편집" : "프로필 관리"}`}>
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
        {isEditing ? (
          <>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
              accept="image/*"
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
                ariaInvalid={
                  isSubmitted ? (errors.nickname ? true : false) : undefined
                }
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
          </>
        ) : (
          <>
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
          </>
        )}
      </section>
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
              onClick={handleDeleteAccount}
            >
              탈퇴
            </Button>
          </div>
        </Modal>
      )}
    </main>
  );
};

export default Profile;
