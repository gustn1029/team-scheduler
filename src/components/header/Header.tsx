import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RiCloseFill } from 'react-icons/ri';
import { IoMdCheckmark } from 'react-icons/io';
import styles from './header.module.scss';

interface HeaderProps {
  title: string;
  onConfirm?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onConfirm, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className={styles.headerComponent}>
      <button onClick={handleCancel} className={styles.closeButton}>
        <RiCloseFill size="22" />
      </button>
      <h2 className={styles.title}>{title}</h2>
      {onEdit && (
        <button onClick={onEdit} className={styles.editButton}>
          수정
        </button>
      )}
      {onDelete && (
        <button onClick={onDelete} className={styles.deleteButton}>
          삭제
        </button>
      )}
      {onConfirm && (
        <button onClick={onConfirm} className={styles.confirmButton}>
        <IoMdCheckmark size="22" />
        </button>
      )}
    </div>
  );
};

export default Header;
