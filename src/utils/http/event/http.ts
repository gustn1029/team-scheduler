import { collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import {
  DeleteCommentsProps,
  EventComments,
  EventCommentsFetchProps,
  EventLikeFetchProps,
  EventsData,
  UserData,
} from "../../../types";
import { appFireStore } from "../../../firebase/config";
import { FirebaseError } from "firebase/app";

export const fetchEventData = async (eventId: string): Promise<EventsData> => {
  const eventDoc = doc(appFireStore, "events", eventId);
  const docSnap = await getDoc(eventDoc);

  if (!docSnap.exists()) {
    throw new Error("해당 이벤트를 찾을 수 없습니다.");
  }

  return docSnap.data() as EventsData;
};

export const fetchUserData = async (userId: string): Promise<UserData | null> => {
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

// like
export const eventLikeFetch = async ({
  eventId,
  like,
}: EventLikeFetchProps) => {
  try {
    const eventDocRef = doc(appFireStore, "events", eventId);
    await updateDoc(eventDocRef, {
      like: like,
    });
  } catch (error) {
    if (error instanceof FirebaseError) {
      console.error(`code: ${error.code}\nmessage: ${error.message}`);
    } else {
      console.error(error);
    }
    throw new Error(`처리 중 오류가 발생했습니다.`);
  }
};

// comments
export const eventCommentsFetch = async ({
  eventId,
  comments,
}: EventCommentsFetchProps) => {
  try {
    const eventDocRef = doc(appFireStore, "events", eventId);
    const eventsRef = await getDoc(eventDocRef);

    if (!eventsRef.exists()) {
      return;
    }

    const commentsRef = eventsRef.data();
    const commentsData: EventComments = commentsRef.comments;

    const existingComments = commentsData?.comments ?? [];

    const lastCommentsId =
      existingComments.length > 0
        ? existingComments[existingComments.length - 1]?.id ?? 0
        : 0;

    const newComment = { ...comments, id: Number(lastCommentsId) + 1 };
    const updatedComments = [...existingComments, newComment];

    await updateDoc(eventDocRef, {
      comments: {
        ...commentsData,
        total: updatedComments.length,
        comments: updatedComments,
      },
    });

    return { message: "댓글을 등록했습니다." };
  } catch (error) {
    if (error instanceof FirebaseError) {
      console.error(`code: ${error.code}\nmessage: ${error.message}`);
    } else {
      console.error(error);
    }
    throw new Error(`처리 중 오류가 발생했습니다.`);
  }
};

export const deleteCommentsFetch = async ({ data, id }: DeleteCommentsProps) => {
  const docRef = doc(appFireStore, "events", id);

  await updateDoc(docRef, {
    comments: {
      comments: data,
      total: data.length
    }
  });

  return true;
};