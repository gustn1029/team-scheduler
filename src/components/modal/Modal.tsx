import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
// import styles from './modal.module.scss';

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
}

const Modal = ({ children, onClose }: ModalProps) => {
  const dialog = useRef<HTMLDialogElement | null>(null);
  useEffect(() => {
    const modal = dialog.current;
    modal?.showModal();

    return () => {
      modal?.close();
    };
  }, []);

  const modalEl = document.getElementById("modal") || document.createElement("div");

  if (!document.getElementById("modal")) {
    modalEl.id = "modal";
    document.body.appendChild(modalEl);
  }

  return createPortal(
    <dialog ref={dialog} onClose={onClose}>
      {children}
    </dialog>,
    modalEl
  );
};

export default Modal;
