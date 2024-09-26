import { create } from "zustand";

type ModalStore = {
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
  };

export const useModalStore = create<ModalStore>((set) => ({
    isOpen: false,
    openModal: () => set({ isOpen: true }),
    closeModal: () => set({ isOpen: false }),
  }));
