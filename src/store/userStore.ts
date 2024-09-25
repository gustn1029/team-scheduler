import { create } from 'zustand';
import { UserData } from '../types';

interface UserStore {
  userData: UserData | null;
  setUserData: (data: UserData | null) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  userData: null,
  setUserData: (data) => set({ userData: data }),
}));