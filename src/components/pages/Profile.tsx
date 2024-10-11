import { useQuery, useQueryClient } from "@tanstack/react-query";
import { appAuth, appFireStore } from "../../firebase/config";
import { userDataFetch } from "../../utils/http";
import React, { useState } from "react";
import styles from "./Profile.module.scss";
import { IoClose } from "react-icons/io5";
import LabelInput from "../inputs/input/LabelInput";
import { FieldError, useForm } from "react-hook-form";
import Button from "../button/Button";
import { ButtonStyleEnum } from "../../types/enum/ButtonEnum";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const Profile = () => {
  const {register, watch, formState:{errors, isSubmitted}, handleSubmit} = useForm();
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const user = useQuery({
    queryKey: ["user"],
    queryFn: () => userDataFetch(appAuth!.currentUser!.uid),
  });

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const currentUser = appAuth.currentUser;
      if (!currentUser) return;

      setIsUploading(true);

      let photoURL = currentUser.photoURL;

      if (file) {
        const storage = getStorage();
        const storageRef = ref(storage, `profileImg/${currentUser.uid}`);
        await uploadBytes(storageRef, file);
        photoURL = await getDownloadURL(storageRef);
      }

      // Firebase Auth 프로필 업데이트
      await updateProfile(currentUser, { 
        displayName: data.userNickName,
        photoURL: photoURL
      });

      // Firestore 사용자 문서 업데이트
      const userDocRef = doc(appFireStore, 'users', currentUser.uid);
      await updateDoc(userDocRef, { 
        nickname: data.userNickName,
        imageUrl: photoURL
      });

      // 쿼리 무효화 및 재요청
      queryClient.invalidateQueries(["user"]);

      console.log("프로필이 성공적으로 업데이트되었습니다.");
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

  console.log(user.data);
  return (
    <div className={styles.profileContainer}>
      {isEditing ? (
        <div>
          <div className={styles.modalContent}>
            <div className={styles.header}>
            <IoClose className = {styles.xButton} onClick={handleCloseModal}>
                  &times;
                  </IoClose>
                <h3 className={styles.editTitle}>프로필 편집</h3>
            </div>
            <div className={styles.profileImage}>
              <img src={user.data?.imageUrl} alt="프로필 사진" />
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <LabelInput
            labelClassName={styles.label}
            type="text"
            label="별명"
            placeholder="별명을 입력하세요."
            register={register("userNickName", {
              required: { value: true, message: "별명을 입력하세요." },
            })}
            watch={watch}
            ariaInvalid={
              isSubmitted ? (errors.userNickName ? true : false) : undefined
            }
            error={errors}
            errorView={errors.userNickName as FieldError}
          />
              <label>이메일</label>
              <p className={styles.email}>{user.data?.email}</p>
              <input type="file" onChange={handleFileChange} accept="image/*" />
              <div className={styles.modalButtons}>
                <Button type="button" buttonStyle={ButtonStyleEnum.Cancel} onClick={handleCloseModal}>
                  취소
                </Button>
                <Button type="submit" buttonStyle={ButtonStyleEnum.Primary} onClick={handleEditClick} disabled={isUploading}>
                  {isUploading ? '업로드 중...' : '확인'}
                  </Button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.header}>
          <IoClose className = {styles.xButton} />
            <h2 className={styles.headerTitle}>계정 관리</h2>
            <button className={styles.deleteAccount}>회원탈퇴</button>
          </div>
          <div className={styles.profileImage}>
            <img src={user.data?.imageUrl} alt="Profile" />
          </div>
          <div className={styles.profileInfo}>
            <p className={styles.nickname}>{user.data?.nickname}</p>
            <p className={styles.email}>{user.data?.email}</p>
          </div>
          <Button buttonStyle={ButtonStyleEnum.NormalWhite} onClick={handleEditClick}>프로필 편집</Button>
        </>
      )}
    </div>
  );
};

export default Profile;