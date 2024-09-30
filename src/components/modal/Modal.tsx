import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useModalStore } from "../../store/useModalStore";

interface ModalProps {
  children: React.ReactNode;
}

const Modal = ({ children }: ModalProps) => {
  const { isOpen, closeModal } = useModalStore();
  const dialog = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const modal = dialog.current;
    if (isOpen) {
      modal?.showModal();
    } else {
      modal?.close();
    }

    return () => {
      modal?.close();
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const modalEl =
    document.getElementById("modal") || document.createElement("div");

  if (!document.getElementById("modal")) {
    modalEl.id = "modal";
    document.body.appendChild(modalEl);
  }

  return createPortal(
    <dialog ref={dialog} onClose={closeModal}>
      {children}
    </dialog>,
    modalEl
  );
};

export default Modal;
