import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, UserRole } from '../models/User.js';
import { Provider } from '../models/Provider.js';
import { Job, JobStatus, JobCategory } from '../models/Job.js';
import { Payment, PaymentStatus, PaymentProviderEnum } from '../models/Payment.js';
import { Violation, ViolationType, ViolationSeverity, ViolationStatus } from '../models/Violation.js';

export async function seedInitialData() {
  if (mongoose.connection.readyState !== 1) {
    return;
  }

  const userCount = await User.countDocuments();
  if (userCount > 0) {
    return;
  }

  console.log('🌱 Seeding initial Campus Marketplace data for Rush Merchant...');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Create Customer
  const customer = await User.create({
    email: 'customer@rushng.com',
    phone: '+2348012345678',
    passwordHash,
    fullName: 'Chidi Okonkwo (UNILAG Campus)',
    role: UserRole.CUSTOMER,
    isVerified: true,
    nin: '12345678901',
    bvn: '22233344455',
    address: 'Moremi Hall, UNILAG, Akoka, Yaba',
    city: 'Lagos',
    state: 'Lagos',
    isVerifiedProvider: false,
    verificationStatus: 'verified',
  });

  // 2. Create Artisan Providers
  const provider1User = await User.create({
    email: 'emeka.tech@rushng.com',
    phone: '+2348087654321',
    passwordHash,
    fullName: 'Emeka Nwosu (Tech & Electronics Repair)',
    role: UserRole.PROVIDER,
    isVerified: true,
    isVerifiedProvider: true,
    verificationStatus: 'verified',
    nin: '98765432109',
    bvn: '55443322110',
    address: 'Shomolu Tech Hub / UNILAG New Hall Gate',
    city: 'Lagos',
    state: 'Lagos',
    profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  });

  const provider1 = await Provider.create({
    userId: provider1User._id,
    skills: ['electrical', 'repair', 'installation'],
    yearsExperience: 5,
    hourlyRate: 3500,
    serviceRadiusKm: 15,
    rating: 4.9,
    totalJobsCompleted: 42,
    totalEarnings: 185000,
    complianceScore: 98,
    isAvailable: true,
    isOnDuty: true,
    verificationLevel: 'nin_bvn_verified',
    storeTheme: 'orange',
    storeCoverColor: '#f97316',
  });

  const provider2User = await User.create({
    email: 'fatima.laundry@rushng.com',
    phone: '+2348033334444',
    passwordHash,
    fullName: 'Fatima Bello (Laundry & Errands)',
    role: UserRole.PROVIDER,
    isVerified: true,
    isVerifiedProvider: true,
    verificationStatus: 'verified',
    nin: '45678912304',
    bvn: '77889900112',
    address: 'Fagunwa Hall Annex, UNILAG',
    city: 'Lagos',
    state: 'Lagos',
    profilePicture: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
  });

  const provider2 = await Provider.create({
    userId: provider2User._id,
    skills: ['laundry', 'errands', 'cleaning'],
    yearsExperience: 3,
    hourlyRate: 2000,
    serviceRadiusKm: 10,
    rating: 4.8,
    totalJobsCompleted: 28,
    totalEarnings: 84000,
    complianceScore: 100,
    isAvailable: true,
    isOnDuty: true,
    verificationLevel: 'nin_bvn_verified',
    storeTheme: 'emerald',
    storeCoverColor: '#10b981',
  });

  // 3. Create Admin
  await User.create({
    email: 'admin@rushng.com',
    phone: '+2348000000000',
    passwordHash,
    fullName: 'Rush Campus Admin',
    role: UserRole.ADMIN,
    isVerified: true,
    isVerifiedProvider: false,
  });

  // 4. Create Sample Jobs
  const job1 = await Job.create({
    customerId: customer._id,
    providerId: provider1User._id,
    category: JobCategory.ELECTRICAL,
    subcategory: 'AC & Laptop Charger Fix',
    title: 'Fix AC Unit & Sockets in Faculty of Engineering',
    description: 'AC unit trips circuit breaker whenever turned on in Room 204. Needs immediate diagnosis and wiring repair.',
    location: { lat: 6.518, lng: 3.398 },
    address: 'Room 204, Faculty of Engineering, UNILAG Campus',
    city: 'Lagos',
    state: 'Lagos',
    status: JobStatus.IN_PROGRESS,
    estimatedPrice: 8500,
    finalPrice: 8500,
    serviceFee: 850,
    checkInTime: new Date(Date.now() - 3600000),
    checkInPhoto: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500',
  });

  const job2 = await Job.create({
    customerId: customer._id,
    providerId: provider2User._id,
    category: JobCategory.LAUNDRY,
    title: 'Weekly Laundry Pickup & Express Ironing',
    description: 'Express laundering of 12 shirts and 4 pairs of trousers with crisp ironing before Friday presentation.',
    location: { lat: 6.516, lng: 3.395 },
    address: 'Moremi Hall, UNILAG Campus',
    city: 'Lagos',
    state: 'Lagos',
    status: JobStatus.COMPLETED,
    estimatedPrice: 4500,
    finalPrice: 4500,
    serviceFee: 450,
    checkInTime: new Date(Date.now() - 86400000),
    checkOutTime: new Date(Date.now() - 80000000),
    completedAt: new Date(Date.now() - 80000000),
  });

  await Job.create({
    customerId: customer._id,
    category: JobCategory.PLUMBING,
    title: 'Leaking Tap and Basin Drainage Unclogging',
    description: 'Bathroom tap is continuously dripping and sink drain is slow. Need a vetted plumber with proper tools.',
    location: { lat: 6.52, lng: 3.392 },
    address: 'Jaja Hall, UNILAG',
    city: 'Lagos',
    state: 'Lagos',
    status: JobStatus.POSTED,
    estimatedPrice: 6000,
  });

  // 5. Create Payments (Escrow)
  await Payment.create({
    jobId: job1._id,
    customerId: customer._id,
    providerId: provider1User._id,
    amount: 8500,
    platformFee: 850,
    providerEarnings: 7650,
    provider: PaymentProviderEnum.OPAY,
    reference: `OPAY-${Date.now()}-001`,
    status: PaymentStatus.HELD,
    heldAt: new Date(),
  });

  await Payment.create({
    jobId: job2._id,
    customerId: customer._id,
    providerId: provider2User._id,
    amount: 4500,
    platformFee: 450,
    providerEarnings: 4050,
    provider: PaymentProviderEnum.PAYSTACK,
    reference: `PAYSTACK-${Date.now()}-002`,
    status: PaymentStatus.RELEASED,
    heldAt: new Date(Date.now() - 86400000),
    releasedAt: new Date(Date.now() - 80000000),
  });

  // 6. Create Accountability Violation / Dispute
  await Violation.create({
    userId: provider1User._id,
    jobId: job1._id,
    reportedBy: customer._id,
    type: ViolationType.LATE_ARRIVAL,
    severity: ViolationSeverity.MINOR,
    title: 'Delayed Arrival for Scheduled Appointment',
    description: 'Provider arrived 45 minutes late past the agreed start window without prior notice.',
    status: ViolationStatus.RESOLVED,
    resolution: 'Provider apologized and provided 10% courtesy discount on labor.',
    pointsDeducted: 2,
  });

  console.log('✅ Campus Marketplace initial seed completed successfully!');
}
