import React, { createContext, useContext, useEffect, useState } from "react";
import { UserProfile, UserRole } from "../types";
import { useAppStore } from "../store/app-store";

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  loginAs: (role: UserRole) => void;
  logout: () => void;
  updateWallet: (amountDelta: number, escrowDelta?: number) => void;
  updateProfile: (updated: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const storeUser = useAppStore((state) => state.user);
  const setStoreUser = useAppStore((state) => state.setUser);
  
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (storeUser) {
      return {
        uid: storeUser.id || storeUser.uid || "user_1",
        displayName: storeUser.full_name || storeUser.displayName || storeUser.email?.split("@")[0] || "User",
        email: storeUser.email || "",
        phone: storeUser.phone || "",
        avatar: storeUser.avatar || "",
        role: (storeUser.role === "provider" ? "artisan" : storeUser.role) as UserRole || "customer",
        walletBalance: storeUser.walletBalance ?? 0,
        escrowHeld: storeUser.escrowHeld ?? 0,
        ninVerified: (storeUser as any).ninVerified ?? storeUser.is_verified ?? false,
        bvnVerified: (storeUser as any).bvnVerified ?? storeUser.is_verified ?? false,
        campusHub: storeUser.campusHub || "Unilag Akoka Campus",
      };
    }
    return null;
  });

  useEffect(() => {
    if (storeUser) {
      setUser({
        uid: storeUser.id || storeUser.uid || "user_1",
        displayName: storeUser.full_name || storeUser.displayName || storeUser.email?.split("@")[0] || "User",
        email: storeUser.email || "",
        phone: storeUser.phone || "",
        avatar: storeUser.avatar || "",
        role: (storeUser.role === "provider" ? "artisan" : storeUser.role) as UserRole || "customer",
        walletBalance: storeUser.walletBalance ?? 0,
        escrowHeld: storeUser.escrowHeld ?? 0,
        campusHub: storeUser.campusHub || "Unilag Akoka Campus",
      });
    } else {
      setUser(null);
    }
  }, [storeUser]);

  const loginAs = (role: UserRole) => {
    if (user) {
      const updatedUser: UserProfile = {
        ...user,
        role,
      };
      setUser(updatedUser);
      setStoreUser({
        ...storeUser,
        role: role === "artisan" ? "provider" : role,
      } as any);
    } else {
      useAppStore.getState().setView("login");
    }
  };

  const logout = () => {
    setUser(null);
    setStoreUser(null as any);
  };

  const updateWallet = (amountDelta: number, escrowDelta: number = 0) => {
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        walletBalance: Math.max(0, prev.walletBalance + amountDelta),
        escrowHeld: Math.max(0, prev.escrowHeld + escrowDelta),
      };
    });
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...updated } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || "customer",
        loginAs,
        logout,
        updateWallet,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within an AuthProvider");
  return ctx;
};

export const useAuth = useAuthContext;
