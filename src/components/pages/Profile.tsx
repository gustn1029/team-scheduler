import { useQuery } from "@tanstack/react-query";
import { appAuth } from "../../firebase/config";
import { userDataFetch } from "../../utils/http";
import React, { useState } from "react";
import styles from "./Profile.module.scss";
import { IoClose } from "react-icons/io5";


const Profile = () => {
  
  const [isEditing, setIsEditing] = useState(false);

  const user = {
    data: {
      imageUrl:
        "https://images-ext-1.discordapp.net/external/uXFrIt1cuaVkVlmXVKhsSaGIlf5qekFS5QXO5tJBPPk/%3Frnd%3D20230712163021/https/image.newsis.com/2023/07/12/NISI20230712_0001313626_web.jpg?format=webp",
      nickname: "닉네임",
      email: "abc@abc.com",
      uid: "123456789",
      name: "David",
    },
  };

  const handleEditClick = () => {
    setIsEditing(true);
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
            <span className={styles.close} onClick={handleCloseModal}>
              &times;
            </span>
            <h3 className={styles.editTitle}>프로필 편집</h3>
            <div className={styles.profileImage}>
              <img src={user.data?.imageUrl} alt="프로필 사진" />
            </div>
            <form>
              <label>별명</label>
              <input type="text" defaultValue={user.data?.nickname} />
              <label>이메일</label>
              <input type="email" defaultValue={user.data?.email} />
              <div className={styles.modalButtons}>
                <button type="button" onClick={handleCloseModal}>
                  취소
                </button>
                <button type="submit">확인</button>
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
        </>
      )}
      <button className={styles.editButton} onClick={handleEditClick}>
        프로필 편집
      </button>
    </div>
  );
};

export default Profile;