import React, { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
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

const MainAppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("jobs");
  const [isPostJobOpen, setIsPostJobOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        onOpenPostJob={() => setIsPostJobOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Sidebar */}
          <SidebarNavigation
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenPostJob={() => setIsPostJobOpen(true)}
          />

          {/* Main Content Body */}
          <div className="flex-1 w-full min-w-0">
            {activeTab === "jobs" && (
              <JobBoard onOpenPostJob={() => setIsPostJobOpen(true)} />
            )}

            {activeTab === "categories" && (
              <CategoriesGrid
                onSelectCategory={() => setActiveTab("jobs")}
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
          </div>
        </div>
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
          <div className="flex items-center gap-4 text-slate-400 font-medium">
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
