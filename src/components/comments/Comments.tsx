

import styles from "./comments.module.scss"
import CommentsForm from "./CommentsForm"

export interface CommentsProps {
  nickname: string;
  eventId: string;
  uid: string;
  profileImg: string;
}
const Comments = ({nickname, eventId, uid, profileImg}: CommentsProps) => {
  return (
    <section className={styles.commentsContainer}>
      <h3 className='sOnly'>댓글</h3>
      <CommentsForm profileImg={profileImg} nickname={nickname} eventId={eventId} uid={uid} />
    </section>
  )
}

export default Comments