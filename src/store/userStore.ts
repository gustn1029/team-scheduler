import { create } from 'zustand';
import { UserData } from '../types';

export type UserInfo = Pick<UserData, "uid" | "token">;

interface UserStore {
  userData: UserInfo | null;
  setUserData: (data: UserInfo | null) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  userData: null,
  setUserData: (data) => set({ userData: data }),
}));