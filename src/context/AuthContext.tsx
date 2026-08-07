import React, { createContext, useContext, useState } from "react";
import { UserProfile, UserRole } from "../types";

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  loginAs: (role: UserRole) => void;
  updateWallet: (amountDelta: number, escrowDelta?: number) => void;
  updateProfile: (updated: Partial<UserProfile>) => void;
}

const defaultUser: UserProfile = {
  uid: "user_customer_1",
  displayName: "Blessing Okon",
  email: "blessing.okon@student.unilag.edu.ng",
  phone: "08012345678",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  role: "customer",
  walletBalance: 45000,
  escrowHeld: 15000,
  nin: "12345678901",
  bvn: "22233344455",
  ninVerified: true,
  bvnVerified: true,
  campusHub: "Unilag Akoka Campus",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(defaultUser);

  const loginAs = (role: UserRole) => {
    if (role === "customer") {
      setUser({
        ...defaultUser,
        role: "customer",
        displayName: "Blessing Okon",
        email: "blessing.okon@student.unilag.edu.ng",
      });
    } else if (role === "artisan") {
      setUser({
        uid: "artisan_1",
        displayName: "Engr. Tunde Bakare",
        email: "tunde.bakare@rush.ng",
        phone: "08031112233",
        avatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80",
        role: "artisan",
        walletBalance: 128000,
        escrowHeld: 15000,
        ninVerified: true,
        bvnVerified: true,
        campusHub: "Unilag Akoka Campus",
      });
    } else {
      setUser({
        uid: "admin_1",
        displayName: "Rush Campus Administrator",
        email: "admin@rush.ng",
        role: "admin",
        walletBalance: 500000,
        escrowHeld: 0,
        campusHub: "All Campus Hubs",
      });
    }
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
        updateWallet,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
