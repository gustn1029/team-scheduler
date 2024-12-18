import { create } from "zustand";

interface ViewNavStore {
  isView: boolean;
  setIsView: (isView:boolean) => void;
}

export const useViewNavStore = create<ViewNavStore>((set) => ({
  isView: false,
  setIsView: (isView) => set({ isView: isView }),
}));
