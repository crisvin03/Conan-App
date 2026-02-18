"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AppSettings, PredictionResult, User } from "./types";

interface AppContextType {
  settings: AppSettings;
  updateSettings: (s: Partial<AppSettings>) => void;
  user: User | null;
  login: (name: string, email: string) => void;
  logout: () => void;
  saveResult: (result: PredictionResult) => void;
  deleteAllData: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  showPrivacyModal: boolean;
  setShowPrivacyModal: (v: boolean) => void;
  showDisclaimerModal: boolean;
  setShowDisclaimerModal: (v: boolean) => void;
  isOnline: boolean;
}

const defaultSettings: AppSettings = {
  fontSize: "normal",
  contrastMode: false,
  privacyConsented: false,
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("conan_settings");
    if (stored) setSettings(JSON.parse(stored));
    const storedUser = localStorage.getItem("conan_user");
    if (storedUser) setUser(JSON.parse(storedUser));

    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!settings.privacyConsented) {
      setShowPrivacyModal(true);
    }
  }, [settings.privacyConsented]);

  useEffect(() => {
    const root = document.documentElement;
    const sizes = { small: "14px", normal: "16px", large: "18px" };
    root.style.fontSize = sizes[settings.fontSize];
    if (settings.contrastMode) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }
  }, [settings.fontSize, settings.contrastMode]);

  const updateSettings = (s: Partial<AppSettings>) => {
    const updated = { ...settings, ...s };
    setSettings(updated);
    localStorage.setItem("conan_settings", JSON.stringify(updated));
  };

  const login = (name: string, email: string) => {
    const newUser: User = { id: Date.now().toString(), name, email, results: [] };
    setUser(newUser);
    localStorage.setItem("conan_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("conan_user");
  };

  const saveResult = (result: PredictionResult) => {
    if (!user) return;
    const updated = { ...user, results: [result, ...user.results].slice(0, 20) };
    setUser(updated);
    localStorage.setItem("conan_user", JSON.stringify(updated));
  };

  const deleteAllData = () => {
    setUser(null);
    setSettings(defaultSettings);
    localStorage.removeItem("conan_user");
    localStorage.removeItem("conan_settings");
  };

  return (
    <AppContext.Provider
      value={{
        settings,
        updateSettings,
        user,
        login,
        logout,
        saveResult,
        deleteAllData,
        sidebarOpen,
        setSidebarOpen,
        showPrivacyModal,
        setShowPrivacyModal,
        showDisclaimerModal,
        setShowDisclaimerModal,
        isOnline,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
