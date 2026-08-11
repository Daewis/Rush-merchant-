import React, { createContext, useContext, useState } from "react";
import { toast } from "sonner";
import {
  ArtisanProfile,
  JobPost,
  JobQuote,
  EscrowTransaction,
  DisputeCase,
  Notification,
} from "../types";
import {
  initialArtisans,
  initialJobs,
  initialQuotes,
  initialTransactions,
  initialDisputes,
  initialNotifications,
} from "../data/seedData";
import { useAuth } from "./AuthContext";

interface MarketplaceContextType {
  artisans: ArtisanProfile[];
  jobs: JobPost[];
  quotes: JobQuote[];
  transactions: EscrowTransaction[];
  disputes: DisputeCase[];
  notifications: Notification[];
  unreadNotificationsCount: number;
  selectedHub: string;
  setSelectedHub: (hub: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  postJob: (job: Omit<JobPost, "id" | "escrowAmount" | "status" | "createdAt" | "handshakeOtp" | "otpVerified" | "quotesCount">) => Promise<JobPost>;
  submitQuote: (quote: Omit<JobQuote, "id" | "createdAt" | "status">) => void;
  acceptQuote: (quoteId: string, jobId: string) => void;
  verifyHandshakeOtp: (jobId: string, otp: string, gpsLocation?: { latitude: number; longitude: number }, photoUrl?: string) => { success: boolean; message: string };
  completeJobCheckOut: (jobId: string, photoUrl: string, rating: number, reviewText: string) => void;
  addTransaction: (tx: Omit<EscrowTransaction, "id" | "createdAt">) => void;
  fileDispute: (dispute: Omit<DisputeCase, "id" | "createdAt" | "status">) => void;
  resolveDispute: (disputeId: string, action: "refund" | "payout" | "dismiss", note: string, penaltyNote?: string) => void;
  registerArtisan: (artisan: Omit<ArtisanProfile, "id" | "rating" | "jobsCompleted">) => void;
  addNotification: (notif: Omit<Notification, "id" | "is_read" | "created_at">) => void;
  markNotificationAsRead: (id: string) => void;
  markNotificationAsUnread: (id: string) => void;
  toggleNotificationRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { updateWallet, user } = useAuth();

  const [artisans, setArtisans] = useState<ArtisanProfile[]>(initialArtisans);
  const [jobs, setJobs] = useState<JobPost[]>(initialJobs);
  const [quotes, setQuotes] = useState<JobQuote[]>(initialQuotes);
  const [transactions, setTransactions] = useState<EscrowTransaction[]>(initialTransactions);
  const [disputes, setDisputes] = useState<DisputeCase[]>(initialDisputes);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications as Notification[]);

  const [selectedHub, setSelectedHub] = useState<string>("All Campus Hubs");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const unreadNotificationsCount = notifications.filter((n) => !n.is_read).length;

  const addNotification = (notifData: Omit<Notification, "id" | "is_read" | "created_at">) => {
    const newNotif: Notification = {
      ...notifData,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    setNotifications((prev) => [newNotif, ...prev]);
    toast.info(newNotif.title, {
      description: newNotif.message,
    });
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const markNotificationAsUnread = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: false } : n))
    );
  };

  const toggleNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: !n.is_read } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    toast.success("All notifications marked as read");
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    toast.success("Notification box cleared");
  };

  const postJob = async (jobData: Omit<JobPost, "id" | "escrowAmount" | "status" | "createdAt" | "handshakeOtp" | "otpVerified" | "quotesCount">) => {
    const id = `job_${Date.now()}`;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const newJob: JobPost = {
      ...jobData,
      id,
      escrowAmount: jobData.budget,
      status: "open",
      createdAt: new Date().toISOString(),
      handshakeOtp: otp,
      otpVerified: false,
      quotesCount: 0,
    };

    setJobs((prev) => [newJob, ...prev]);

    // Lock Escrow from customer wallet
    updateWallet(-jobData.budget, jobData.budget);

    // Record Escrow Hold transaction
    addTransaction({
      userId: jobData.customerId,
      type: "escrow_hold",
      amount: jobData.budget,
      reference: `ESCROW_HOLD_${Date.now().toString().slice(-6)}`,
      gateway: "RushWallet",
      status: "completed",
      jobId: id,
      jobTitle: jobData.title,
      notes: `Escrow locked for job: ${jobData.title}`,
    });

    // Notify Customer
    addNotification({
      user_id: jobData.customerId,
      title: "Job Posted & Escrow Vault Locked",
      message: `₦${jobData.budget.toLocaleString()} is locked safely in Rush Escrow vault for "${jobData.title}". OTP: [${otp}]`,
      type: "escrow_hold",
    });

    return newJob;
  };

  const submitQuote = (quoteData: Omit<JobQuote, "id" | "createdAt" | "status">) => {
    const newQuote: JobQuote = {
      ...quoteData,
      id: `quote_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: "pending",
    };

    setQuotes((prev) => [newQuote, ...prev]);
    setJobs((prev) =>
      prev.map((j) => (j.id === quoteData.jobId ? { ...j, quotesCount: j.quotesCount + 1 } : j))
    );

    const targetJob = jobs.find((j) => j.id === quoteData.jobId);

    // Notify Customer about new quote
    addNotification({
      user_id: targetJob?.customerId,
      title: "New Bidding Quote Received",
      message: `${quoteData.artisanName} submitted a quote of ₦${quoteData.proposedPrice.toLocaleString()} for "${targetJob?.title || 'your request'}".`,
      type: "quote_received",
    });
  };

  const acceptQuote = (quoteId: string, jobId: string) => {
    const quote = quotes.find((q) => q.id === quoteId);
    if (!quote) return;

    setQuotes((prev) =>
      prev.map((q) => {
        if (q.jobId === jobId) {
          return q.id === quoteId ? { ...q, status: "accepted" } : { ...q, status: "rejected" };
        }
        return q;
      })
    );

    const artisan = artisans.find((a) => a.id === quote.artisanId);
    const targetJob = jobs.find((j) => j.id === jobId);

    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === jobId) {
          return {
            ...j,
            artisanId: quote.artisanId,
            artisanName: quote.artisanName,
            artisanAvatar: quote.artisanAvatar,
            artisanPhone: artisan?.phone || "08011223344",
            status: "assigned",
          };
        }
        return j;
      })
    );

    // Notify Customer & Artisan
    addNotification({
      user_id: targetJob?.customerId,
      title: "Artisan Assigned & OTP Active",
      message: `${quote.artisanName} assigned! Handshake OTP: [${targetJob?.handshakeOtp || '4829'}]. Share this with the artisan on arrival.`,
      type: "job_assigned",
    });
  };

  const verifyHandshakeOtp = (
    jobId: string,
    otp: string,
    gpsLocation?: { latitude: number; longitude: number; timestamp?: string },
    photoUrl?: string
  ) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return { success: false, message: "Job not found" };

    if (job.handshakeOtp !== otp.trim()) {
      return { success: false, message: "Invalid 4-digit OTP. Please ask customer for correct code." };
    }

    const gps = {
      latitude: gpsLocation?.latitude ?? (6.5181 + (Math.random() - 0.5) * 0.002),
      longitude: gpsLocation?.longitude ?? (3.3985 + (Math.random() - 0.5) * 0.002),
      timestamp: gpsLocation?.timestamp || new Date().toISOString(),
    };

    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? {
              ...j,
              otpVerified: true,
              status: "in_progress",
              arrivalGps: gps,
              arrivalPhoto: photoUrl || j.arrivalPhoto,
            }
          : j
      )
    );

    addNotification({
      user_id: job.customerId,
      title: "GPS Handshake Verified & Work Started",
      message: `Artisan check-in verified at campus coordinates! Work is officially IN PROGRESS for "${job.title}".`,
      type: "job_update",
    });

    return { success: true, message: "Handshake verified successfully! Job is now marked IN PROGRESS." };
  };

  const completeJobCheckOut = (
    jobId: string,
    photoUrl: string,
    rating: number,
    reviewText: string
  ) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? {
              ...j,
              status: "completed",
              completionPhoto: photoUrl,
              rating,
              reviewText,
            }
          : j
      )
    );

    // Release Escrow to Artisan
    addTransaction({
      userId: job.artisanId || "artisan_1",
      type: "escrow_release",
      amount: job.escrowAmount,
      reference: `ESCROW_RELEASE_${Date.now().toString().slice(-6)}`,
      gateway: "RushWallet",
      status: "completed",
      jobId,
      jobTitle: job.title,
      notes: `Escrow released to artisan upon completion.`,
    });

    // Update customer escrow balance
    if (user && user.uid === job.customerId) {
      updateWallet(0, -job.escrowAmount);
    }

    // Notify Customer & Artisan
    addNotification({
      user_id: job.customerId,
      title: "Job Completed & Escrow Released",
      message: `Job "${job.title}" marked completed! ₦${job.escrowAmount.toLocaleString()} escrow payout released. Thank you!`,
      type: "job_completed",
    });
  };

  const addTransaction = (txData: Omit<EscrowTransaction, "id" | "createdAt">) => {
    const newTx: EscrowTransaction = {
      ...txData,
      id: `tx_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);

    if (txData.type === "top_up") {
      updateWallet(txData.amount, 0);
      addNotification({
        user_id: txData.userId,
        title: "Escrow Wallet Top-Up Successful",
        message: `₦${txData.amount.toLocaleString()} loaded into your Rush Escrow ledger balance via ${txData.gateway}.`,
        type: "top_up",
      });
    } else if (txData.type === "withdrawal") {
      updateWallet(-txData.amount, 0);
      addNotification({
        user_id: txData.userId,
        title: "Wallet Withdrawal Processed",
        message: `₦${txData.amount.toLocaleString()} withdrawn to registered bank account.`,
        type: "top_up",
      });
    }
  };

  const fileDispute = (disputeData: Omit<DisputeCase, "id" | "createdAt" | "status">) => {
    const newDispute: DisputeCase = {
      ...disputeData,
      id: `disp_${Date.now()}`,
      status: "under_review",
      createdAt: new Date().toISOString(),
    };

    setDisputes((prev) => [newDispute, ...prev]);

    setJobs((prev) =>
      prev.map((j) => (j.id === disputeData.jobId ? { ...j, status: "disputed" } : j))
    );

    addNotification({
      user_id: disputeData.filedBy,
      title: "Dispute Opened - Escrow Under Review",
      message: `Dispute filed for "${disputeData.jobTitle}". Rush Accountability Board has frozen escrow pending resolution.`,
      type: "dispute",
    });
  };

  const resolveDispute = (
    disputeId: string,
    action: "refund" | "payout" | "dismiss",
    note: string,
    penaltyNote?: string
  ) => {
    const dispute = disputes.find((d) => d.id === disputeId);
    if (!dispute) return;

    const job = jobs.find((j) => j.id === dispute.jobId);

    setDisputes((prev) =>
      prev.map((d) => {
        if (d.id === disputeId) {
          return {
            ...d,
            status:
              action === "refund"
                ? "resolved_refund"
                : action === "payout"
                ? "resolved_payout"
                : "dismissed",
            resolutionNote: note,
            penaltyIssued: penaltyNote,
          };
        }
        return d;
      })
    );

    if (job) {
      if (action === "refund") {
        // Refund Escrow back to Customer
        updateWallet(job.escrowAmount, -job.escrowAmount);
        addTransaction({
          userId: job.customerId,
          type: "refund",
          amount: job.escrowAmount,
          reference: `REFUND_${Date.now().toString().slice(-6)}`,
          gateway: "RushWallet",
          status: "completed",
          jobId: job.id,
          jobTitle: job.title,
          notes: `Full Escrow refunded due to dispute resolution: ${note}`,
        });
        setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: "cancelled" } : j)));

        addNotification({
          user_id: job.customerId,
          title: "Dispute Resolved: Full Escrow Refunded",
          message: `Rush Admin approved full refund of ₦${job.escrowAmount.toLocaleString()} to your wallet. Note: ${note}`,
          type: "refund",
        });
      } else if (action === "payout") {
        // Release Escrow to Artisan
        addTransaction({
          userId: job.artisanId || "artisan_1",
          type: "escrow_release",
          amount: job.escrowAmount,
          reference: `DISPUTE_PAYOUT_${Date.now().toString().slice(-6)}`,
          gateway: "RushWallet",
          status: "completed",
          jobId: job.id,
          jobTitle: job.title,
          notes: `Dispute resolved in favor of artisan: ${note}`,
        });
        setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: "completed" } : j)));

        addNotification({
          user_id: dispute.filedBy,
          title: "Dispute Resolved: Escrow Payout Released",
          message: `Dispute case resolved in favor of artisan. Note: ${note}`,
          type: "dispute",
        });
      }
    }

    if (penaltyNote && dispute.againstId) {
      setArtisans((prev) =>
        prev.map((a) =>
          a.id === dispute.againstId ? { ...a, strikes: (a.strikes || 0) + 1 } : a
        )
      );
    }
  };

  const registerArtisan = (artisanData: Omit<ArtisanProfile, "id" | "rating" | "jobsCompleted">) => {
    const newArtisan: ArtisanProfile = {
      ...artisanData,
      id: `artisan_${Date.now()}`,
      rating: 5.0,
      jobsCompleted: 0,
    };

    setArtisans((prev) => [newArtisan, ...prev]);

    addNotification({
      title: "Artisan Profile Registration Complete",
      message: `Welcome ${artisanData.displayName}! Your NIN & BVN credential checks are verified for ${artisanData.hub}.`,
      type: "security",
    });
  };

  return (
    <MarketplaceContext.Provider
      value={{
        artisans,
        jobs,
        quotes,
        transactions,
        disputes,
        notifications,
        unreadNotificationsCount,
        selectedHub,
        setSelectedHub,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        postJob,
        submitQuote,
        acceptQuote,
        verifyHandshakeOtp,
        completeJobCheckOut,
        addTransaction,
        fileDispute,
        resolveDispute,
        registerArtisan,
        addNotification,
        markNotificationAsRead,
        markNotificationAsUnread,
        toggleNotificationRead,
        markAllNotificationsAsRead,
        deleteNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const ctx = useContext(MarketplaceContext);
  if (!ctx) throw new Error("useMarketplace must be used within a MarketplaceProvider");
  return ctx;
};

