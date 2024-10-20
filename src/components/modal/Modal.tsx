import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./modal.module.scss";
import { motion } from "framer-motion";

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

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialog.current) {
      onClose();
    }
  };

  return createPortal(
    <motion.dialog
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 },
      }}
      initial="hidden"
      animate="visible"
      exit="hidden"
      ref={dialog}
      className={styles.dialog}
      onClick={handleBackgroundClick}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </motion.dialog>,
    document.getElementById("modal") as HTMLElement
  );
}
