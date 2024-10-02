import React from 'react'
import { Link } from 'react-router-dom'
import styles from './createModal.module.scss'

interface CreateModalProps {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
}

const CreateModal = ({left,right,top,bottom}: CreateModalProps) => {
  return (
    <aside className={styles.createModal} style={{
        top: top && `${top}px`,
        right: right && `${right}px`,
        bottom: bottom && `${bottom}px`,
        left: left && `${left}px`,
    }}>
        <Link to="/create" className={`${styles.link} ${styles.createLink}`}>일정</Link>
        <Link to="/todo" className={`${styles.link} ${styles.todoLink}`}>Todo</Link>
    </aside>
  )
}

export default CreateModal