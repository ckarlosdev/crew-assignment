import { create } from "zustand";

type hourStore = {
  showHourModal: boolean;
  setShowHourModal: (show: boolean) => void;
};

export const useHourStore = create<hourStore>((set) => ({
  showHourModal: false,
  setShowHourModal: (show) => set({ showHourModal: show }),
}));
