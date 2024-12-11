import { useMutation } from "@tanstack/react-query";
import { CommentData } from "../../types";
import CommentItem from "./CommentItem";
import styles from "./comments.module.scss";
import { deleteCommentsFetch } from "../../utils/http/event/http";
import toast from "react-hot-toast";
import { queryClient } from "../../utils/http";
import { useParams } from "react-router-dom";

interface CommentListProps {
  commentsData: CommentData[];
}

const CommentList = ({ commentsData }: CommentListProps) => {
  const { id } = useParams<{ id: string }>();
  const deleteMutation = useMutation({
    mutationFn: deleteCommentsFetch,
    onSuccess: () => {
      toast.success("댓글을 삭제했습니다.")
      queryClient.invalidateQueries({queryKey: ["event", id]})
    },
    onError: (error) => {
      toast.error(`댓글 삭제에 실패했습니다.\n${error}`)
    }
  })
  const handleDelete = async (commentsid:number) => {
    const newComments = commentsData.filter(comment => comment.id !== commentsid );

    if(id) {
      await deleteMutation.mutateAsync({data: newComments, id})
    }
  }
  return (
    <ol className={styles.commentsList}>
      {commentsData.map((el) => (
        <CommentItem
          key={`${el.id}__${el.uid}__comment`}
          id={el.id}
          comment={el.comment}
          profileImg={el.profileImg}
          date={el.date}
          nickname={el.nickname}
          handleDelete={handleDelete}
        />
      ))}
    </ol>
  );
};

export default CommentList;
