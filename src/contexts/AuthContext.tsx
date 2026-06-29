"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface User {
  id: string;
  name: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (name: string) => void;
  logout: () => void;
  favorites: string[]; // memory IDs
  toggleFavorite: (memoryId: string) => void;
  isFavorite: (memoryId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "rewound_user";
const FAVORITES_KEY = "rewound_favorites";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const storedFavs = localStorage.getItem(FAVORITES_KEY);
      return storedFavs ? JSON.parse(storedFavs) : [];
    } catch {
      return [];
    }
  });

  const login = useCallback((name: string) => {
    const newUser: User = {
      id: crypto.randomUUID(),
      name,
    };
    setUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const toggleFavorite = useCallback(
    (memoryId: string) => {
      setFavorites((prev) => {
        const next = prev.includes(memoryId)
          ? prev.filter((id) => id !== memoryId)
          : [...prev, memoryId];
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const isFavorite = useCallback(
    (memoryId: string) => favorites.includes(memoryId),
    [favorites]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        login,
        logout,
        favorites,
        toggleFavorite,
        isFavorite,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
