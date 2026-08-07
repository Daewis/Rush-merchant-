import mongoose, { Schema, Document } from 'mongoose';

export interface IProvider extends Document {
  userId: mongoose.Types.ObjectId;
  slug?: string;
  skills: string[];
  yearsExperience: number;
  certifications: any[];
  hourlyRate?: number;
  serviceRadiusKm: number;
  location?: {
    lat: number;
    lng: number;
  };
  availability: Record<string, any>;
  verificationLevel: string;
  verificationDocuments: string[];
  portfolioUrls: string[];
  storeTheme: string;
  storeCoverColor: string;
  storeViews: number;
  isAvailable: boolean;
  isOnDuty: boolean;
  rating: number;
  totalJobsCompleted: number;
  totalJobsCancelled: number;
  totalEarnings: number;
  totalRevenue: number;
  complianceScore: number;
  plan: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProviderSchema = new Schema<IProvider>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    slug: { type: String, sparse: true },
    skills: { type: [String], default: [] },
    yearsExperience: { type: Number, default: 0 },
    certifications: { type: [Schema.Types.Mixed], default: [] },
    hourlyRate: { type: Number, default: 0 },
    serviceRadiusKm: { type: Number, default: 10 },
    location: {
      lat: { type: Number, default: 6.5244 },
      lng: { type: Number, default: 3.3792 },
    },
    availability: { type: Schema.Types.Mixed, default: {} },
    verificationLevel: { type: String, default: 'basic' },
    verificationDocuments: { type: [String], default: [] },
    portfolioUrls: { type: [String], default: [] },
    storeTheme: { type: String, default: 'orange' },
    storeCoverColor: { type: String, default: '#f97316' },
    storeViews: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
    isOnDuty: { type: Boolean, default: false },
    rating: { type: Number, default: 0.0 },
    totalJobsCompleted: { type: Number, default: 0 },
    totalJobsCancelled: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0.0 },
    totalRevenue: { type: Number, default: 0.0 },
    complianceScore: { type: Number, default: 100 },
    plan: { type: String, default: 'free' },
  },
  {
    timestamps: true,
  }
);

export const Provider = mongoose.model<IProvider>('Provider', ProviderSchema);
