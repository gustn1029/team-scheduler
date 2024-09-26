import { create } from "zustand";

interface DateStore {
  date: Date;
  setDate: (date: Date) => void;
  prevMonth: () => void;
  nextMonth: () => void;
}

export const useDateStore = create<DateStore>((set) => ({
  date: new Date(),
  setDate: (date) => set({ date }),
  prevMonth: () =>
    set((state) => {
      const newDate = new Date(state.date);
      newDate.setMonth(newDate.getMonth() - 1);
      return { date: newDate };
    }),
  nextMonth: () =>
    set((state) => {
      const newDate = new Date(state.date);
      newDate.setMonth(newDate.getMonth() + 1);
      return { date: newDate };
    }),
}));
