import React, { createContext, useContext, useState } from "react";
import {
  ArtisanProfile,
  JobPost,
  JobQuote,
  EscrowTransaction,
  DisputeCase,
} from "../types";
import {
  initialArtisans,
  initialJobs,
  initialQuotes,
  initialTransactions,
  initialDisputes,
} from "../data/seedData";
import { useAuth } from "./AuthContext";

interface MarketplaceContextType {
  artisans: ArtisanProfile[];
  jobs: JobPost[];
  quotes: JobQuote[];
  transactions: EscrowTransaction[];
  disputes: DisputeCase[];
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
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { updateWallet, user } = useAuth();

  const [artisans, setArtisans] = useState<ArtisanProfile[]>(initialArtisans);
  const [jobs, setJobs] = useState<JobPost[]>(initialJobs);
  const [quotes, setQuotes] = useState<JobQuote[]>(initialQuotes);
  const [transactions, setTransactions] = useState<EscrowTransaction[]>(initialTransactions);
  const [disputes, setDisputes] = useState<DisputeCase[]>(initialDisputes);

  const [selectedHub, setSelectedHub] = useState<string>("All Campus Hubs");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

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
    } else if (txData.type === "withdrawal") {
      updateWallet(-txData.amount, 0);
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
  };

  return (
    <MarketplaceContext.Provider
      value={{
        artisans,
        jobs,
        quotes,
        transactions,
        disputes,
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
