import { create } from "zustand";
import type Auth from "@/shared/auth/types";

interface AuthState {
  auth: Partial<Auth>;
  isLoggingOut: boolean;
  setAuth: (auth: Auth) => void;
  updateAuth: (updates: Partial<Auth>) => void;
  clearAuth: () => void;
  setLoggingOut: (isLoggingOut: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  auth: {},
  isLoggingOut: false,

  setAuth: (auth: Auth) => {
    set({ auth, isLoggingOut: false });
  },

  updateAuth: (updates: Partial<Auth>) => {
    const currentAuth = get().auth;
    set({ auth: { ...currentAuth, ...updates } });
  },

  clearAuth: () => {
    set({ auth: {}, isLoggingOut: false });
  },

  setLoggingOut: (isLoggingOut: boolean) => {
    set({ isLoggingOut });
  },
}));
