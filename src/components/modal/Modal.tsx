import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from  './modal.module.scss';

interface ModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export default function Modal({ children, isOpen, onClose }: ModalProps) {
  const dialog = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const modal = dialog.current;
    if (modal) {
      if (isOpen) {
        modal.showModal();
      } else {
        modal.close();
      }
    }
  }, [isOpen]);

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialog.current) {
      onClose();
    }
  };

  return createPortal(
    <dialog 
      className={styles.modal} 
      ref={dialog} 
      onClick={handleBackgroundClick}
    >
      <div onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </dialog>,
    document.getElementById('modal') as HTMLElement
  );
}