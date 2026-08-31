import { create } from "zustand";
import type { Absence } from "../types";

type absenceStore = {
  absences: Absence[];
  showModal: boolean;
  employeeIdSelected: number | null;
  employeeNameSelected: string | null;
  absenceData: Absence;

  setShowModal: (show: boolean) => void;
  setEmployeeIdSelected: (id: number) => void;
  setEmployeeNameSelected: (name: string) => void;
  setAbsenceData: <K extends keyof Absence>(key: K, value: Absence[K]) => void;
  addAbsence: (data: Absence) => void;
  removeAbsence: (temporalId: string) => void;
  fillAbsences: (absencesData: Absence[]) => void;
};

const initialData: Absence = {
  temporalId: "",
  assignmentsAbsencesId: null,
  employeesId: null,
  absenceType: "",
  comments: "",
};

export const useAbsenceStore = create<absenceStore>((set) => ({
  absences: [],
  showModal: false,
  employeeIdSelected: null,
  employeeNameSelected: "",
  absenceData: initialData,

  setShowModal: (show) => set({ showModal: show }),
  setEmployeeIdSelected: (id) => set({ employeeIdSelected: id }),
  setEmployeeNameSelected: (name) => set({ employeeNameSelected: name }),
  setAbsenceData: (key, value) =>
    set((state) => ({
      absenceData: {
        ...state.absenceData,
        [key]: value,
      },
    })),
  addAbsence: (data) =>
    set((state) => ({
      absences: [...state.absences, data],
      absenceData: initialData,
    })),
  removeAbsence: (temporalId) =>
    set((state) => ({
      absences: state.absences.filter(
        (absence) => absence.temporalId !== temporalId,
      ),
    })),
  fillAbsences: (absencesData) => {
    const transformed = absencesData.map((item) => ({
      ...item,
      temporalId: crypto.randomUUID(),
    }));

    set({ absences: transformed });
  },
}));
