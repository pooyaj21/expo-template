import { create, StateCreator } from "zustand";
import { UserInterface } from "@/features/core/session/data-access/sessionTypes";

interface SessionState {
  /** Undefined = not yet hydrated from secure storage; null = signed out. */
  token: string | null | undefined;
  user?: UserInterface;
  setSession: (token: string, user?: UserInterface) => void;
  setUser: (user?: UserInterface) => void;
  clearSession: () => void;
}

const createSessionSlice: StateCreator<SessionState> = (set) => ({
  token: undefined,
  user: undefined,
  setSession: (token, user) => set({ token, user }),
  setUser: (user) => set({ user }),
  clearSession: () => set({ token: null, user: undefined }),
});

export const useSessionStore = create<SessionState>()((...a) => ({
  ...createSessionSlice(...a),
}));
