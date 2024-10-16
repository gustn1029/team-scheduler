import { useQuery } from "@tanstack/react-query";
import { appAuth, appFireStore } from "../../firebase/config";
import { userDataFetch, queryClient } from "../../utils/http";
import React, { useState, useRef, useMemo, useEffect } from "react";
import styles from "./Profile.module.scss";
import LabelInput from "../inputs/input/LabelInput";
import { FieldError, useForm } from "react-hook-form";
import Button from "../button/Button";
import { ButtonStyleEnum } from "../../types/enum/ButtonEnum";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Header from "../header/Header";

const Profile = () => {
  const { data: userData, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: () => userDataFetch(appAuth!.currentUser!.uid),
  });

  const { register, watch, formState: { errors, isSubmitted }, handleSubmit } = useForm({
    defaultValues: useMemo(() => {
      return {
        userNickName: userData?.nickname || '',
        userEmail: userData?.email || '',
      };
    }, [userData]),
  });

  const [isEditing, setIsEditing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const uploadProfileImage = async (file: File | null, userId: string): Promise<string> => {
    if (!file) return '';

    const storage = getStorage();
    const storageRef = ref(storage, `profileImage/${userId}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const onSubmit = async (data: any) => {
    try {
      const currentUser = appAuth.currentUser;
      if (!currentUser) return;

      setIsUploading(true);

      const profileImg = await uploadProfileImage(file, currentUser.uid);

      setImagePreview(profileImg || currentUser.photoURL);

      await updateProfile(currentUser, {
        displayName: data.userNickName,
        photoURL: profileImg || currentUser.photoURL
      });

      const userDocRef = doc(appFireStore, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        nickname: data.userNickName,
        profileImg: profileImg || currentUser.photoURL
      });

      await queryClient.invalidateQueries({queryKey: ["user"]});

      console.log("프로필이 성공적으로 업데이트되었습니다.", userData);
      setIsEditing(false);
      setIsUploading(false);
    } catch (error) {
      console.error("프로필 업데이트 중 오류 발생:", error);
      setIsUploading(false);
    }
  };

  const handleCloseModal = () => {
    setIsEditing(false);
  };

  const handleDeleteAccount = () => {
    console.log("회원탈퇴 처리");
  };


  if (isLoading) {
    return <p>로딩 중...</p>;
  }

  return (
    <div className={styles.profileContainer}>
      {isEditing ? (
        <div>
          <Header 
            title="프로필 편집" 
          />
          <div className={styles.modalContent}>
            <div className={styles.profileImage}>
              <img src={imagePreview || userData?.profileImg} alt="프로필 사진" />
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <LabelInput
                labelClassName={styles.label}
                type="text"
                label="별명"
                placeholder={`(현재: ${userData?.nickname || ''})`}
                register={register("userNickName", {
                  required: { value: true, message: "별명을 입력하세요." },
                  maxLength: {
                    value: 8,
                    message: "8자리 이하 입력",
                  },
                  minLength: {
                    value: 3,
                    message: "3자리 이상 입력",
                  },
                })}
                watch={watch}
                ariaInvalid={
                  isSubmitted ? (errors.userNickName ? true : false) : undefined
                }
                error={errors}
                errorView={errors.userNickName as FieldError}
              />
              <LabelInput
                labelClassName={styles.label}
                type="text"
                label="이메일"
                placeholder={`${userData?.email || ''}`}
                register={register("userEmail")}
                watch={watch}
              />

              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept="image/*"
              />

              <Button
                type="button"
                buttonStyle={ButtonStyleEnum.NormalWhite}
                onClick={handleFileButtonClick}
              >
                프로필 사진 변경
              </Button>
              <div className={styles.modalButtons}>
                <Button type="button" buttonStyle={ButtonStyleEnum.Cancel} onClick={handleCloseModal}>
                  취소
                </Button>
                <Button type="submit" buttonStyle={ButtonStyleEnum.Primary} disabled={isUploading}>
                  {isUploading ? '업로드 중...' : '확인'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <>
          <Header 
            title="계정 관리" 
          />
          <div className={styles.profileImage}>
            <img src={imagePreview || userData?.profileImg} alt="Profile" />
          </div>
          <div className={styles.profileInfo}>
            <p className={styles.nickname}>{userData?.nickname}</p>
            <p className={styles.email}>{userData?.email}</p>
          </div>
          <Button buttonStyle={ButtonStyleEnum.NormalWhite} onClick={handleEditClick}>프로필 편집</Button>
        </>
      )}
    </div>
  );
};

export default Profile;
