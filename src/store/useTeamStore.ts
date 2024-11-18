import { create } from "zustand";

interface TeamStore {
  teamName: string | null;
  setTeamName: (teamName: string | null) => void;
}

export const useTeamStore = create<TeamStore>((set) => ({
  teamName: null,
  setTeamName: (name) => set({ teamName: name }),
}));
