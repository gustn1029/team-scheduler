import { useForm } from "react-hook-form";
import LabelTextarea from "../inputs/textarea/LabelTextarea";

import styles from "./comments.module.scss";
import Button from "../button/Button";
import { ButtonStyleEnum } from "../../types/enum/ButtonEnum";
import { CommentData } from "../../types";
import { useMutation } from "@tanstack/react-query";
import { eventCommentsFetch } from "../../utils/http/event/http";
import toast from "react-hot-toast";
import { queryClient } from "../../utils/http";
import { useState } from "react";
import { useParams } from "react-router-dom";

interface CommentsFormData {
  comment: string;
}

interface CommentsFormProps {
  nickname: string;
  eventId: string;
  uid: string;
  profileImg: string;
}

const CommentsForm = ({
  nickname,
  eventId,
  uid,
  profileImg,
}: CommentsFormProps) => {
  const [isPost, setIsPost] = useState<boolean>(false);
  const { id } = useParams<{ id: string }>();
  const {
    register,
    watch,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<CommentsFormData>();

  const commentsMutation = useMutation({
    mutationFn: eventCommentsFetch,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["event", id],
      });
      toast.success(data?.message ?? "댓글을 등록했습니다.");
      reset({ comment: "" });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = async (data: CommentsFormData) => {
    if (eventId && uid) {
      const newComment: CommentData = {
        comment: data.comment,
        date: new Date(),
        uid: uid,
        nickname: nickname,
        profileImg: profileImg,
      };

      await commentsMutation.mutateAsync({
        eventId: eventId,
        comments: newComment,
      });
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.commentsForm}>
      <LabelTextarea
        label="댓글"
        isLabelTextHidden
        register={register("comment", {
          onChange: (e) => {
            if (e.target.value.trim() !== "") {
              setIsPost(true);
            } else {
              setIsPost(false);
            }
            e.target.style.height = "40px";
            if (e.target.scrollHeight > 20) {
              if (e.target.scrollHeight <= 100) {
                e.target.style.height = `${e.target.scrollHeight}px`;
              } else {
                e.target.style.height = `100px`;
              }
            }
          },
        })}
        placeholder="댓글을 입력해 주세요."
        watch={watch}
        error={errors}
        errorView={errors.comment}
      />
      <Button
        type="submit"
        disabled={!isPost}
        buttonStyle={!isPost ? ButtonStyleEnum.Primary : ButtonStyleEnum.Normal}
        buttonClassName={styles.commentsButton}
      >
        등록
      </Button>
    </form>
  );
};

export default CommentsForm;
