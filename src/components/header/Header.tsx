import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RiCloseFill } from 'react-icons/ri';
import { IoMdCheckmark } from 'react-icons/io';
import { MdModeEdit, MdDelete } from "react-icons/md";
import styles from './header.module.scss';

interface HeaderProps {
  title: string;
  onConfirm?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDefault?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onConfirm, onEdit, onDelete, onDefault }) => {
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
          <MdModeEdit size="22" />
        </button>
      )}
      {onDelete && (
        <button onClick={onDelete} className={styles.deleteButton}>
          <MdDelete size="22" />
        </button>
      )}
      {onConfirm && (
        <button onClick={onConfirm} className={styles.confirmButton}>
          <IoMdCheckmark size="22" />
        </button>
      )}
      {/* 이 부분은 오른쪽에 아이콘이 없을때 기본값으로 사용하는 빈값입니다. */}
      {onDefault && (
        <button onClick={onDefault}></button>
      )}
    </div>
  );
};

export default Header;
