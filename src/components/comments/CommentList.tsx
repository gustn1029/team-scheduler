import React from "react";
import { CommentData } from "../../types";
import CommentItem from "./CommentItem";

interface CommentListProps {
  commentsData: CommentData[];
}

const CommentList = ({ commentsData }: CommentListProps) => {
  return (
    <ol>
      {commentsData.map((el) => (
        <CommentItem
          key={`${el.id}__${el.uid}__comment`}
          id={el.id}
          comment={el.comment}
          profileImg={el.profileImg}
          date={el.date}
          nickname={el.nickname}
        />
      ))}
    </ol>
  );
};

export default CommentList;
