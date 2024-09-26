import { useQuery } from "@tanstack/react-query";
import { appAuth } from "../../firebase/config";
import { userDataFetch } from "../../utils/http";
import React, { useState } from "react";
import "./Profile.scss";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  // const user = useQuery({
  //   queryKey: ["user"],
  //   queryFn: () => userDataFetch(appAuth!.currentUser!.uid),
  // });

  // if(user.isLoading) {
  //   return <div>Loading...</div>
  // }
  // if(user.isError) {
  //   return <div>error...</div>
  // }

  const user = {
    data:{imageUrl:"https://images-ext-1.discordapp.net/external/uXFrIt1cuaVkVlmXVKhsSaGIlf5qekFS5QXO5tJBPPk/%3Frnd%3D20230712163021/https/image.newsis.com/2023/07/12/NISI20230712_0001313626_web.jpg?format=webp", nickname:"닉네임", email:"abc@abc.com", uid:"123456789", name:"David" }
   }

    
    const handleEditClick = () => {
      setIsEditing(true);
    };
  
    const handleCloseModal = () => {
      setIsEditing(false);
    };
  
  console.log(user.data);
  return (
      <div className="profileContainer">
        <h1>계정 관리</h1>
        <button className="deleteAccount">회원 탈퇴</button>
        <div className="profileImage">
          <img src={user.data?.imageUrl} alt="Profile" />
        </div>
        <div className="profileInfo">
          <p className="nickname">{user.data?.nickname}</p>
          <p className="email">{user.data?.email}</p>
        </div>
        <button className="editButton" onClick={handleEditClick}>
          프로필 편집
        </button>
  
        {isEditing && (
          <div className="modal">
            <div className="modalContent">
              <span className="close" onClick={handleCloseModal}>
                &times;
              </span>
              <h3>프로필 편집</h3>
              <div className="profileImage">
                <img src={user.data?.imageUrl} alt="Profile" />
              </div>
              <form>
                <label>별명</label>
                <input type="text" defaultValue={user.data?.nickname} />
                <label>이메일</label>
                <input type="email" defaultValue={user.data?.email} />
                <div className="modalButtons">
                  <button type="button" onClick={handleCloseModal}>
                    취소
                  </button>
                  <button type="submit">확인</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
};

export default Profile;
