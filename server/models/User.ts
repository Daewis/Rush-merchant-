import mongoose, { Schema, Document } from 'mongoose';

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  PROVIDER = 'PROVIDER',
  ADMIN = 'ADMIN',
  SUPPORT = 'SUPPORT',
}

export interface IUser extends Document {
  email: string;
  phone: string;
  passwordHash: string;
  fullName: string;
  role: UserRole;
  isVerified: boolean;
  verificationCode?: string | null;
  verificationSentAt?: Date | null;
  nin?: string | null;
  bvn?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string;
  profilePicture?: string | null;
  isActive: boolean;
  isVerifiedProvider: boolean;
  verificationStatus: string; // 'pending' | 'verified' | 'rejected'
  resetToken?: string | null;
  resetTokenExpires?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date | null;
  deletedAt?: Date | null;
  deletedBy?: string | null;
  deletionReason?: string | null;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.CUSTOMER,
    },
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String, default: null },
    verificationSentAt: { type: Date, default: null },
    nin: { type: String, default: null },
    bvn: { type: String, default: null },
    address: { type: String, default: null },
    city: { type: String, default: 'Lagos' },
    state: { type: String, default: 'Lagos' },
    country: { type: String, default: 'Nigeria' },
    profilePicture: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    isVerifiedProvider: { type: Boolean, default: false },
    verificationStatus: { type: String, default: 'pending' },
    resetToken: { type: String, default: null },
    resetTokenExpires: { type: Date, default: null },
    lastLogin: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: String, default: null },
    deletionReason: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ phone: 1 }, { unique: true });

export const User = mongoose.model<IUser>('User', UserSchema);
