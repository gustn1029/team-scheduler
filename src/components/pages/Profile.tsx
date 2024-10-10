import { useQuery } from "@tanstack/react-query";
import { appAuth } from "../../firebase/config";
import { userDataFetch } from "../../utils/http";
import React, { useState } from "react";
import styles from "./Profile.module.scss";
import { IoClose } from "react-icons/io5";
import LabelInput from "../inputs/input/LabelInput";
import { FieldError, useForm } from "react-hook-form";
import Button from "../button/Button";
import { ButtonStyleEnum } from "../../types/enum/ButtonEnum";

const Profile = () => {
  const {register, watch, formState:{errors, isSubmitted}, handleSubmit} = useForm();
  const [isEditing, setIsEditing] = useState(false);

  // const user = {
  //   data: {
  //     imageUrl:
  //       "https://images-ext-1.discordapp.net/external/uXFrIt1cuaVkVlmXVKhsSaGIlf5qekFS5QXO5tJBPPk/%3Frnd%3D20230712163021/https/image.newsis.com/2023/07/12/NISI20230712_0001313626_web.jpg?format=webp",
  //     nickname: "닉네임",
  //     email: "abc@abc.com",
  //     uid: "123456789",
  //     name: "David",
  //   },
  // };

  const user = useQuery({
    queryKey: ["user"],
    queryFn: () => userDataFetch(appAuth!.currentUser!.uid),
  });


  const handleEditClick = () => {
    setIsEditing(true);
  };

  const onSubmit = (data:any) => {
    console.log(data)

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
              <div className={styles.modalButtons}>
                <Button type="button" buttonStyle={ButtonStyleEnum.Cancel} onClick={handleCloseModal}>
                  취소
                </Button>
                <Button type="submit" buttonStyle={ButtonStyleEnum.Primary} onClick={handleEditClick}>
                  확인
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