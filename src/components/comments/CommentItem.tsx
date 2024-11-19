import { CommentData } from '../../types'

const CommentItem = ({id, date, comment, nickname}:CommentData) => {
  return (
    <li id={`${id}`}>
        <strong>{nickname}</strong>
        <p>{comment}</p>
        
    </li>
  )
}

export default CommentItem