import { create } from "zustand";
import { produce, Draft } from "immer";
import { User } from "@types";

export interface AuthState {
  user?: User;
  isValidating: boolean;
  set: (cb: (state: Draft<AuthState>) => void) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: undefined,
  isValidating: true,
  set: (cb: (state: Draft<AuthState>) => void) => {
    set(produce(cb));
  },
}));
