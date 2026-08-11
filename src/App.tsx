import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { MarketplaceProvider } from "./context/MarketplaceContext";
import { Header } from "./components/Header";
import { SidebarNavigation } from "./components/SidebarNavigation";
import { JobBoard } from "./components/JobBoard";
import { CategoriesGrid } from "./components/CategoriesGrid";
import { ArtisanDirectory } from "./components/ArtisanDirectory";
import { JobTrackerHUD } from "./components/JobTrackerHUD";
import { EscrowWallet } from "./components/EscrowWallet";
import { AccountabilityCenter } from "./components/AccountabilityCenter";
import { PostJobModal } from "./components/PostJobModal";
import { ArtisanOnboardingModal } from "./components/ArtisanOnboardingModal";
import { CustomerDashboard } from "./components/dashboard/CustomerDashboard";
import { ProviderDashboard } from "./components/dashboard/ProviderDashboard";
import { AdminDashboard } from "./components/dashboard/AdminDashboard";
import { LoginForm } from "./components/auth/LoginForm";
import { RegisterForm } from "./components/auth/RegisterForm";
import { VerifyForm } from "./components/auth/VerifyForm";
import { LandingPage } from "./components/home/LandingPage";
import { useAppStore } from "./store/app-store";
import { GlobalLoadingOverlay } from "./components/common/GlobalLoadingOverlay";

const MainAppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [isPostJobOpen, setIsPostJobOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const { user } = useAuth();
  const { currentView, setView } = useAppStore();

  // Synchronize activeTab with Zustand store currentView if set externally
  useEffect(() => {
    if (currentView === "home") {
      setActiveTab("home");
    } else if (currentView === "login" || currentView === "register" || currentView === "verify") {
      setActiveTab(currentView);
    } else if (currentView === "customer-dashboard" || currentView === "provider-dashboard" || currentView === "admin-dashboard") {
      setActiveTab("dashboard");
    } else if (currentView === "jobs") {
      setActiveTab("jobs");
    } else if (currentView === "providers") {
      setActiveTab("artisans");
    } else if (currentView === "job-post") {
      setIsPostJobOpen(true);
    } else if (currentView === "provider-register") {
      setIsOnboardingOpen(true);
    }
  }, [currentView]);

  const protectedTabs = ["dashboard", "track_hud", "wallet", "disputes"];

  const handleTabChange = (tab: string) => {
    if (!user && protectedTabs.includes(tab)) {
      setActiveTab("login");
      setView("login");
      return;
    }

    setActiveTab(tab);
    if (tab === "home") {
      setView("home");
    } else if (tab === "dashboard") {
      if (user?.role === "artisan") setView("provider-dashboard");
      else if (user?.role === "admin") setView("admin-dashboard");
      else setView("customer-dashboard");
    } else if (tab === "jobs") {
      setView("jobs");
    } else if (tab === "login" || tab === "register" || tab === "verify") {
      setView(tab as any);
    }
  };

  const renderDashboard = () => {
    if (user?.role === "artisan") return <ProviderDashboard />;
    if (user?.role === "admin") return <AdminDashboard />;
    return <CustomerDashboard />;
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      <GlobalLoadingOverlay />

      {/* Top Header */}
      <Header
        onOpenPostJob={() => setIsPostJobOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "home" ? (
          <LandingPage />
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Left Sidebar (hidden on full auth screens) */}
            {activeTab !== "login" && activeTab !== "register" && activeTab !== "verify" && (
              <SidebarNavigation
                activeTab={activeTab}
                setActiveTab={handleTabChange}
                onOpenPostJob={() => setIsPostJobOpen(true)}
              />
            )}

            {/* Main Content Body */}
            <div className="flex-1 w-full min-w-0">
              {activeTab === "dashboard" && renderDashboard()}

              {activeTab === "jobs" && (
                <JobBoard onOpenPostJob={() => setIsPostJobOpen(true)} />
              )}

              {activeTab === "categories" && (
                <CategoriesGrid
                  onSelectCategory={() => handleTabChange("jobs")}
                />
              )}

              {activeTab === "artisans" && (
                <ArtisanDirectory
                  onOpenPostJob={() => setIsPostJobOpen(true)}
                  onOpenOnboarding={() => setIsOnboardingOpen(true)}
                />
              )}

              {activeTab === "track_hud" && <JobTrackerHUD />}

              {activeTab === "wallet" && <EscrowWallet />}

              {activeTab === "disputes" && <AccountabilityCenter />}

              {activeTab === "login" && <LoginForm />}

              {activeTab === "register" && <RegisterForm />}

              {activeTab === "verify" && <VerifyForm />}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <PostJobModal
        isOpen={isPostJobOpen}
        onClose={() => setIsPostJobOpen(false)}
      />

      <ArtisanOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-semibold text-slate-700">
            © 2026 Rush Merchant — Hyper-Local Campus Artisan & Escrow Network
          </p>
          <div className="flex items-center gap-4 text-slate-400 font-medium flex-wrap justify-center sm:justify-end">
            <span>NIN & BVN Verified</span>
            <span>•</span>
            <span>Real-time GPS OTP Handshake</span>
            <span>•</span>
            <span>OPay & Paystack Protected</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MarketplaceProvider>
        <MainAppContent />
      </MarketplaceProvider>
    </AuthProvider>
  );
}
