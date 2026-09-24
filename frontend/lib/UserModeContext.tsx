"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type UserMode = "visitor" | "student" | "researcher" | "archivist";

interface UserModeContextType {
  mode: UserMode;
  setMode: (mode: UserMode) => void;
  isVisitor: boolean;
  isStudent: boolean;
  isResearcher: boolean;
  isArchivist: boolean;
}

const UserModeContext = createContext<UserModeContextType>({
  mode: "visitor",
  setMode: () => {},
  isVisitor: true,
  isStudent: false,
  isResearcher: false,
  isArchivist: false,
});

export function UserModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<UserMode>("visitor");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("ambedkar_heritage_user_mode") as UserMode | null;
    if (saved && ["visitor", "student", "researcher", "archivist"].includes(saved)) {
      setModeState(saved);
    }
  }, []);

  const setMode = (newMode: UserMode) => {
    setModeState(newMode);
    if (typeof window !== "undefined") {
      localStorage.setItem("ambedkar_heritage_user_mode", newMode);
    }
  };

  const value = {
    mode,
    setMode,
    isVisitor: mode === "visitor",
    isStudent: mode === "student",
    isResearcher: mode === "researcher",
    isArchivist: mode === "archivist",
  };

  return (
    <UserModeContext.Provider value={value}>
      {children}
    </UserModeContext.Provider>
  );
}

export function useUserMode() {
  const context = useContext(UserModeContext);
  if (!context) {
    throw new Error("useUserMode must be used within a UserModeProvider");
  }
  return context;
}
