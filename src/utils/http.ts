import { QueryClient } from "@tanstack/react-query";
import { appAuth, appFireStore } from "../firebase/config";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { UserData } from "../types";
// 통신 관련
export const queryClient = new QueryClient();

// 로그인 정보 가져오기
export const userDataFetch = async (userId: string): Promise<UserData | null> => {
  if (!userId) {
    throw new Error("userId is required");
  }

  const userCollection = collection(appFireStore, "users");
  const q = query(userCollection, where("uid", "==", userId));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  return querySnapshot.docs[0].data() as UserData;
};

// 구글 인증
export const googleAuthFetch = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(appAuth, provider);
  const user = result.user;

  const userCollection = collection(appFireStore, "users");

  // 해당 uid를 가진 문서가 있는지 확인
  const q = query(userCollection, where("uid", "==", user.uid));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    await addDoc(userCollection, {
      uid: user.uid,
      nickname: user.displayName,
      name: user.displayName,
      email: user.email,
      imageUrl: user.photoURL,
    });
  }

  return user;
};

// 로그아웃
export const logoutFetch = async () => {
  await signOut(appAuth);
};