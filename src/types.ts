export type UserRole = "customer" | "artisan" | "provider" | "admin";

export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export type JobStatus = "open" | "assigned" | "in_progress" | "completed" | "disputed" | "cancelled";

export type GatewayType = "OPay" | "Paystack" | "Flutterwave" | "RushWallet";

export type TransactionType = "top_up" | "withdrawal" | "escrow_hold" | "escrow_release" | "refund";

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  walletBalance: number;
  escrowHeld: number;
  nin?: string;
  bvn?: string;
  ninVerified?: boolean;
  bvnVerified?: boolean;
  campusHub?: string;
}

export interface ArtisanProfile {
  id: string;
  displayName: string;
  email: string;
  phone: string;
  avatar: string;
  category: string;
  skills: string[];
  hourlyRate: number;
  rating: number;
  jobsCompleted: number;
  hub: string;
  ninVerified: boolean;
  bvnVerified: boolean;
  verificationStatus: VerificationStatus;
  bio: string;
  badge?: string;
  isAvailable: boolean;
  strikes?: number;
}

export interface JobQuote {
  id: string;
  jobId: string;
  artisanId: string;
  artisanName: string;
  artisanAvatar: string;
  artisanRating: number;
  artisanJobsCompleted: number;
  proposedPrice: number;
  estimatedTime: string;
  coverNote: string;
  createdAt: string;
  status: "pending" | "accepted" | "rejected";
}

export interface JobPost {
  id: string;
  title: string;
  category: string;
  description: string;
  budget: number;
  escrowAmount: number;
  location: string;
  hub: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerAvatar?: string;
  artisanId?: string;
  artisanName?: string;
  artisanPhone?: string;
  artisanAvatar?: string;
  status: JobStatus;
  createdAt: string;
  handshakeOtp: string;
  otpVerified: boolean;
  arrivalGps?: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
  arrivalPhoto?: string;
  completionPhoto?: string;
  rating?: number;
  reviewText?: string;
  quotesCount: number;
}

export interface EscrowTransaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  reference: string;
  gateway: GatewayType;
  status: "pending" | "completed" | "failed";
  jobId?: string;
  jobTitle?: string;
  createdAt: string;
  notes?: string;
}

export interface DisputeCase {
  id: string;
  jobId: string;
  jobTitle: string;
  filedBy: string;
  filedByName: string;
  filedByRole: UserRole;
  againstId: string;
  againstName: string;
  reason: string;
  description: string;
  status: "open" | "under_review" | "resolved_refund" | "resolved_payout" | "dismissed";
  createdAt: string;
  resolutionNote?: string;
  penaltyIssued?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  count: number;
  avgCost: string;
  popularServices: string[];
}

export * from './types/index';
