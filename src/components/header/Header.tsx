import React, { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { RiCloseFill } from "react-icons/ri";
import { IoMdCheckmark } from "react-icons/io";
import { MdModeEdit, MdDelete } from "react-icons/md";
import styles from "./header.module.scss";

interface HeaderProps {
  title: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDefault?: () => void;
  children?: ReactNode;
}

const Header: React.FC<HeaderProps> = ({
  title,
  onConfirm,
  onEdit,
  onDelete,
  onDefault,
  onCancel,
  children,
}) => {
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className={styles.headerComponent}>
      <button
        onClick={onCancel ? onCancel : handleCancel}
        className={styles.closeButton}
      >
        <RiCloseFill size="22" />
      </button>
      <h2 className={styles.title}>{title}</h2>
      {!onDefault && (
        <div className={styles.editAndDeleteAndConfirmButtonWrap}>
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

          {children
            ? children
            : onConfirm && (
                <button
                  type="submit"
                  onClick={onConfirm}
                  className={styles.confirmButton}
                >
                  <IoMdCheckmark size="22" />
                </button>
              )}
        </div>
      )}
    </div>
  );
};

export default Header;
