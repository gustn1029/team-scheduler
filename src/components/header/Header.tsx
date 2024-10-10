import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RiCloseFill } from 'react-icons/ri';
import { IoMdCheckmark } from 'react-icons/io';
import styles from './header.module.scss';

interface HeaderProps {
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onCancel, onConfirm }) => {
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className={styles.header}>
      <button onClick={handleCancel} className={styles.closeButton}>
        <RiCloseFill size="22" />
      </button>
      <h2 className={styles.title}>{title}</h2>
      <button onClick={onConfirm} className={styles.confirmButton}>
        <IoMdCheckmark size="22" />
      </button>
    </div>
  );
};

export default Header;
