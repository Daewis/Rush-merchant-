import React from "react";
import {
  ShieldCheck,
  Wallet,
  Building,
  PlusCircle,
  Search,
  LogIn,
  UserPlus,
  Home as HomeIcon,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useMarketplace } from "../context/MarketplaceContext";
import { useAppStore } from "../store/app-store";

interface HeaderProps {
  onOpenPostJob: () => void;
  onOpenOnboarding: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const campusHubs = [
  "All Campus Hubs",
  "Unilag Akoka Campus",
  "UI Agbowo Area",
  "OAU Ile-Ife Campus",
  "UNN Nsukka Campus",
  "ABU Zaria Campus",
  "Covenant Ota Hub",
];

export const Header: React.FC<HeaderProps> = ({
  onOpenPostJob,
  onOpenOnboarding,
  activeTab,
  setActiveTab,
}) => {
  const { user, loginAs } = useAuth();
  const { selectedHub, setSelectedHub, searchQuery, setSearchQuery } = useMarketplace();
  const { setView } = useAppStore();

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    if (tab === "home") setView("home");
    else if (tab === "login") setView("login");
    else if (tab === "register") setView("register");
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      {/* Top Banner Notice */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded text-[10px] tracking-wide border border-emerald-500/30">
            NIN & BVN ENFORCED
          </span>
          <span className="hidden sm:inline text-slate-400">
            Campus Escrow Protection & GPS Handshake OTP Active
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-[11px]">Role Switcher:</span>
          <button
            onClick={() => loginAs("customer")}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
              user?.role === "customer"
                ? "bg-orange-500 text-white font-semibold"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            Student/Customer
          </button>
          <button
            onClick={() => loginAs("artisan")}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
              user?.role === "artisan"
                ? "bg-orange-500 text-white font-semibold"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            Artisan
          </button>
          <button
            onClick={() => loginAs("admin")}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
              user?.role === "admin"
                ? "bg-purple-600 text-white font-semibold"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            Admin Mod
          </button>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <div
          onClick={() => handleNavigate("home")}
          className="flex items-center gap-2 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md group-hover:scale-105 transition transform">
            R
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-black text-xl tracking-tight text-slate-900">
                RUSH
              </span>
              <span className="text-xs bg-orange-100 text-orange-700 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                Merchant
              </span>
            </div>
            <p className="text-[10px] font-medium text-slate-500 tracking-tight">
              Hyper-Local Vetted Artisans
            </p>
          </div>
        </div>

        {/* Hub Dropdown & Search Bar */}
        <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
          <div className="relative shrink-0">
            <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedHub}
              onChange={(e) => setSelectedHub(e.target.value)}
              className="pl-9 pr-8 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 rounded-lg border border-slate-200 text-slate-700 focus:outline-none cursor-pointer appearance-none transition"
            >
              {campusHubs.map((hub) => (
                <option key={hub} value={hub}>
                  {hub}
                </option>
              ))}
            </select>
          </div>

          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search artisans, plumbing, electrical..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-100 rounded-lg border border-slate-200 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none transition"
            />
          </div>
        </div>

        {/* Right CTA Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Landing / Home Button */}
          <button
            onClick={() => handleNavigate("home")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-xs transition cursor-pointer ${
              activeTab === "home"
                ? "bg-orange-100 text-orange-700 border border-orange-200"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <HomeIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Landing Page</span>
          </button>

          {/* Login Button */}
          <button
            onClick={() => handleNavigate("login")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border font-semibold text-xs transition cursor-pointer ${
              activeTab === "login"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            <LogIn className="w-4 h-4 text-orange-600" />
            <span>Login</span>
          </button>

          {/* Sign Up / Register Button */}
          <button
            onClick={() => handleNavigate("register")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-xs transition cursor-pointer shadow-xs ${
              activeTab === "register"
                ? "bg-amber-600 text-white"
                : "bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Up</span>
          </button>

          {/* Post Job Button */}
          <button
            onClick={onOpenPostJob}
            className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-orange-400" />
            <span>Post Job</span>
          </button>

          {/* Wallet Balance Widget */}
          <button
            onClick={() => handleNavigate("wallet")}
            className={`hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg border transition ${
              activeTab === "wallet"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100/70"
            }`}
          >
            <Wallet className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="text-left">
              <p className="text-[9px] uppercase font-bold tracking-wider opacity-75">
                Wallet
              </p>
              <p className="text-xs font-black">
                ₦{user?.walletBalance ? user.walletBalance.toLocaleString() : "45,000"}
              </p>
            </div>
          </button>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div 
              onClick={() => handleNavigate("dashboard")}
              className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-300 cursor-pointer hover:ring-2 hover:ring-orange-500 transition"
              title="Go to Dashboard"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-xs">
                  {user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : "US"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

