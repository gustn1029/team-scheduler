import dayjs from "dayjs";
import { CommentData } from "../../types";
import { Timestamp } from "firebase/firestore";
import IconButton from "../button/iconButton/IconButton";
import { MdCancel } from "react-icons/md";
import styles from "./comments.module.scss";

interface CommentListItemProps extends CommentData {
  handleDelete: (commentsId: number) => void;
}

const CommentItem = ({
  id,
  date,
  comment,
  nickname,
  profileImg,
  handleDelete
}: CommentListItemProps) => {
  const dateObject = date instanceof Timestamp ? date.toDate() : date;

  return (
    <li id={`${id}`} className={styles.commentListItem}>
      <div>
        <img
          src={profileImg}
          alt={`${id}__${nickname}__${dayjs(dateObject).format(
            "YYYY.MM.DD HH:mm:ss"
          )}`}
        />
        <strong>{nickname}</strong>
        <span>:</span>
        <p>{comment}</p>
      </div>
      <IconButton
        icon={<MdCancel />}
        onClick={() => handleDelete(id ? id: 0)}
      />
    </li>
  );
};

export default CommentItem;
