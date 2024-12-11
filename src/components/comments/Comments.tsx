

import { CommentData } from "../../types";
import CommentList from "./CommentList";
import styles from "./comments.module.scss"
import CommentsForm from "./CommentsForm"



interface CommentsProps {
  nickname: string;
  eventId: string;
  uid: string;
  profileImg: string;
  commentsData: CommentData[]
}

const Comments = ({nickname, eventId, uid, profileImg, commentsData}: CommentsProps) => {
  return (
    <section className={styles.commentsContainer}>
      <h3 className='sOnly'>댓글</h3>
      <CommentList commentsData={commentsData} />
      <CommentsForm profileImg={profileImg} nickname={nickname} eventId={eventId} uid={uid} />
    </section>
  )
}

export default Comments