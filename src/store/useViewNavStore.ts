import { create } from "zustand";

interface ViewNavStore {
  isView: boolean;
  toggleIsView: () => void;
}

export const useViewNavStore = create<ViewNavStore>((set) => ({
  isView: false,
  toggleIsView: () => set((state) => ({ isView: !state.isView })),
}));
