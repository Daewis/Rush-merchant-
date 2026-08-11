import React from "react";
import {
  Home,
  Briefcase,
  Users,
  Wallet,
  ShieldAlert,
  Grid,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  HelpCircle,
  Lock,
  LogIn,
  UserPlus,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useMarketplace } from "../context/MarketplaceContext";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenPostJob: () => void;
}

export const SidebarNavigation: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenPostJob,
}) => {
  const { user } = useAuth();
  const { jobs, disputes } = useMarketplace();

  const activeJobsCount = jobs.filter(
    (j) => j.status === "assigned" || j.status === "in_progress"
  ).length;

  const openDisputesCount = disputes.filter(
    (d) => d.status === "open" || d.status === "under_review"
  ).length;

  const handleProtectedTabClick = (tabKey: string) => {
    if (!user) {
      setActiveTab("login");
    } else {
      setActiveTab(tabKey);
    }
  };

  const handlePostJobClick = () => {
    if (!user) {
      setActiveTab("login");
    } else {
      onOpenPostJob();
    }
  };

  return (
    <aside className="w-full lg:w-64 shrink-0">
      {/* Mobile Horizontal Scrollable Tab Bar (< lg) */}
      <div className="lg:hidden bg-white rounded-xl border border-slate-200 p-2 shadow-xs mb-4">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 px-1">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition cursor-pointer ${
              activeTab === "home"
                ? "bg-orange-600 text-white shadow-xs font-bold"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>

          <button
            onClick={() => handleProtectedTabClick("dashboard")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-orange-600 text-white shadow-xs font-bold"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Dashboard</span>
            {!user && <Lock className="w-3 h-3 text-slate-400 ml-0.5" />}
          </button>

          <button
            onClick={() => setActiveTab("jobs")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition cursor-pointer ${
              activeTab === "jobs"
                ? "bg-orange-600 text-white shadow-xs font-bold"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Jobs ({jobs.length})</span>
          </button>

          <button
            onClick={() => handleProtectedTabClick("track_hud")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition cursor-pointer ${
              activeTab === "track_hud"
                ? "bg-orange-600 text-white shadow-xs font-bold"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span>Tracker</span>
            {!user ? (
              <Lock className="w-3 h-3 text-slate-400 ml-0.5" />
            ) : (
              activeJobsCount > 0 && (
                <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                  {activeJobsCount}
                </span>
              )
            )}
          </button>

          <button
            onClick={() => setActiveTab("artisans")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition cursor-pointer ${
              activeTab === "artisans"
                ? "bg-orange-600 text-white shadow-xs font-bold"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Artisans</span>
          </button>

          <button
            onClick={() => setActiveTab("categories")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition cursor-pointer ${
              activeTab === "categories"
                ? "bg-orange-600 text-white shadow-xs font-bold"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Categories</span>
          </button>

          <button
            onClick={() => handleProtectedTabClick("wallet")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition cursor-pointer ${
              activeTab === "wallet"
                ? "bg-orange-600 text-white shadow-xs font-bold"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Wallet</span>
            {!user && <Lock className="w-3 h-3 text-slate-400 ml-0.5" />}
          </button>

          <button
            onClick={() => handleProtectedTabClick("disputes")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition cursor-pointer ${
              activeTab === "disputes"
                ? "bg-orange-600 text-white shadow-xs font-bold"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Disputes</span>
            {!user ? (
              <Lock className="w-3 h-3 text-slate-400 ml-0.5" />
            ) : (
              openDisputesCount > 0 && (
                <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                  {openDisputesCount}
                </span>
              )
            )}
          </button>
        </div>
      </div>

      {/* Full Vertical Sidebar Navigation (lg:block) */}
      <div className="hidden lg:block space-y-4">
        {/* Guest Mode Card if not logged in */}
        {!user && (
          <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-slate-900/5 border border-amber-200/90 rounded-xl p-3.5 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                Guest Mode
              </span>
              <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                Login Required
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              Sign in or create an account to manage your dashboard, escrow wallet, job tracker, and submit bids.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <button
                onClick={() => setActiveTab("login")}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold shadow-2xs transition active:scale-95 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>
              <button
                onClick={() => setActiveTab("register")}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-2xs transition active:scale-95 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-orange-600" />
                <span>Sign Up</span>
              </button>
            </div>
          </div>
        )}

        {/* Navigation Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs">
          <p className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Main Navigation
          </p>

          <nav className="space-y-1 mt-1">
            <button
              onClick={() => setActiveTab("home")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === "home"
                  ? "bg-orange-50 text-orange-700 font-bold border border-orange-200/60"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Home className="w-4 h-4 text-orange-600" />
                <span>Home</span>
              </div>
              <span className="text-[10px] bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded font-bold uppercase">
                Home
              </span>
            </button>

            <button
              onClick={() => handleProtectedTabClick("dashboard")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-orange-50 text-orange-700 font-bold border border-orange-200/60"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>
                  {user?.role === "artisan"
                    ? "Artisan Dashboard"
                    : user?.role === "admin"
                    ? "Admin Console"
                    : "Customer Dashboard"}
                </span>
              </div>
              {user ? (
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold uppercase">
                  {user.role}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">
                  <Lock className="w-3 h-3 text-slate-400" /> Sign In
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("jobs")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === "jobs"
                  ? "bg-orange-50 text-orange-700 font-bold border border-orange-200/60"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4 text-orange-500" />
                <span>Jobs & Bidding Board</span>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                {jobs.length}
              </span>
            </button>

            <button
              onClick={() => handleProtectedTabClick("track_hud")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === "track_hud"
                  ? "bg-orange-50 text-orange-700 font-bold border border-orange-200/60"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Live Job Tracker HUD</span>
              </div>
              {user ? (
                activeJobsCount > 0 && (
                  <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded-full font-extrabold animate-pulse">
                    {activeJobsCount} Active
                  </span>
                )
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">
                  <Lock className="w-3 h-3 text-slate-400" /> Sign In
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("artisans")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === "artisans"
                  ? "bg-orange-50 text-orange-700 font-bold border border-orange-200/60"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Vetted Artisans Directory</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("categories")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === "categories"
                  ? "bg-orange-50 text-orange-700 font-bold border border-orange-200/60"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Grid className="w-4 h-4 text-purple-600" />
                <span>Service Categories</span>
              </div>
            </button>

            <button
              onClick={() => handleProtectedTabClick("wallet")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === "wallet"
                  ? "bg-orange-50 text-orange-700 font-bold border border-orange-200/60"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span>Escrow Ledger Wallet</span>
              </div>
              {!user && (
                <span className="inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">
                  <Lock className="w-3 h-3 text-slate-400" /> Sign In
                </span>
              )}
            </button>

            <button
              onClick={() => handleProtectedTabClick("disputes")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === "disputes"
                  ? "bg-orange-50 text-orange-700 font-bold border border-orange-200/60"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                <span>Accountability & Disputes</span>
              </div>
              {user ? (
                openDisputesCount > 0 && (
                  <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">
                    {openDisputesCount}
                  </span>
                )
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">
                  <Lock className="w-3 h-3 text-slate-400" /> Sign In
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Escrow Guarantee Highlight Widget */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-4 space-y-3 shadow-md border border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center gap-2 text-orange-400">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-wider">
              Rush Guarantee
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-normal">
            100% Escrow Protection. Money is held securely until you confirm the 4-digit OTP at job location.
          </p>

          <div className="space-y-1.5 pt-1 text-[11px] text-slate-400 border-t border-slate-700/60">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>NIN / BVN Biometric Vetted</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Real-time GPS Check-in OTP</span>
            </div>
          </div>

          <button
            onClick={handlePostJobClick}
            className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-lg shadow-xs transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
          >
            {user ? "Post a Request Now" : "Sign In to Post Request"}
          </button>
        </div>

        {/* Support Contact Box */}
        <div className="bg-slate-100 rounded-xl p-3.5 text-xs text-slate-600 border border-slate-200 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-800 text-[11px]">
              Campus Safety & Emergency
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Contact 24/7 Campus Patrol & Rush Escrow Resolution Hotline.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
