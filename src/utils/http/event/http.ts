import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  EventComments,
  EventCommentsFetchProps,
  EventLikeFetchProps,
} from "../../../types";
import { appFireStore } from "../../../firebase/config";
import { FirebaseError } from "firebase/app";

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
