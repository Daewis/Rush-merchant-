import express, { Response } from 'express';
import bcrypt from 'bcryptjs';
import { Job, JobStatus, JobCategory } from '../models/Job.js';
import { User } from '../models/User.js';
import { Payment, PaymentStatus } from '../models/Payment.js';
import { jwtRequired, AuthRequest } from '../middleware/auth.js';
import { NotificationService } from '../services/notificationService.js';
import { PaymentService } from '../services/paymentService.js';

const router = express.Router();

// GET /api/jobs
router.get('/', async (req, res) => {
  try {
    const { category, status, search } = req.query;
    const filter: any = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
      ];
    }

    const jobs = await Job.find(filter)
      .populate('customerId', 'fullName email phone rating')
      .populate('providerId', 'fullName email phone rating')
      .sort({ createdAt: -1 });

    const formattedJobs = jobs.map((job: any) => ({
      id: job._id.toString(),
      customer_id: job.customerId?._id?.toString() || job.customerId?.toString(),
      provider_id: job.providerId?._id?.toString() || job.providerId?.toString() || null,
      title: job.title,
      description: job.description,
      category: job.category,
      subcategory: job.subcategory,
      address: job.address,
      city: job.city,
      state: job.state,
      status: job.status,
      estimated_price: job.estimatedPrice,
      final_price: job.finalPrice,
      tracking_code: job.trackingCode,
      customer_name: job.customerId?.fullName || 'Campus Customer',
      provider_name: job.providerId?.fullName || null,
      created_at: job.createdAt.toISOString(),
      check_in_time: job.checkInTime ? job.checkInTime.toISOString() : null,
      check_out_time: job.checkOutTime ? job.checkOutTime.toISOString() : null,
    }));

    return res.json({
      success: true,
      data: {
        jobs: formattedJobs,
        total: formattedJobs.length,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/jobs/my
router.get('/my', jwtRequired(true), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId || (await User.findOne({ role: 'CUSTOMER' }))?._id;
    const jobs = await Job.find({
      $or: [{ customerId: userId }, { providerId: userId }],
    }).sort({ createdAt: -1 });

    const formatted = jobs.map((job: any) => ({
      id: job._id.toString(),
      title: job.title,
      description: job.description,
      category: job.category,
      status: job.status,
      estimated_price: job.estimatedPrice,
      address: job.address,
      created_at: job.createdAt.toISOString(),
    }));

    return res.json({ success: true, data: { jobs: formatted } });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/jobs
router.post('/', jwtRequired(true), async (req: AuthRequest, res: Response) => {
  try {
    const { category, title, description, address, estimated_price, subcategory, lat, lng } = req.body;

    if (!category || !title || !description || !address) {
      return res.status(400).json({ success: false, error: 'Category, title, description, and address are required' });
    }

    const customer = req.user || (await User.findOne({ role: 'CUSTOMER' })) || (await User.findOne());
    if (!customer) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    const job = await Job.create({
      customerId: customer._id,
      category,
      subcategory,
      title,
      description,
      address,
      location: { lat: lat || 6.5244, lng: lng || 3.3792 },
      estimatedPrice: estimated_price || 5000,
      status: JobStatus.POSTED,
    });

    return res.status(201).json({
      success: true,
      message: 'Job posted successfully to campus network',
      data: {
        job_id: job._id.toString(),
        job: {
          id: job._id.toString(),
          title: job.title,
          status: job.status,
          estimated_price: job.estimatedPrice,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/jobs/:id
router.get('/:id', async (req, res) => {
  try {
    const job: any = await Job.findById(req.params.id)
      .populate('customerId', 'fullName phone email')
      .populate('providerId', 'fullName phone email');

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    return res.json({
      success: true,
      data: {
        job: {
          id: job._id.toString(),
          title: job.title,
          description: job.description,
          category: job.category,
          subcategory: job.subcategory,
          address: job.address,
          status: job.status,
          estimated_price: job.estimatedPrice,
          final_price: job.finalPrice,
          created_at: job.createdAt.toISOString(),
          customer: job.customerId ? { id: job.customerId._id.toString(), full_name: job.customerId.fullName } : null,
          provider: job.providerId ? { id: job.providerId._id.toString(), full_name: job.providerId.fullName } : null,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/jobs/:id/apply
router.post('/:id/apply', jwtRequired(true), async (req: AuthRequest, res: Response) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, error: 'Job not found' });

    const providerUser = req.user || (await User.findOne({ role: 'PROVIDER' }));
    if (!providerUser) return res.status(400).json({ success: false, error: 'Provider account required' });

    job.providerId = providerUser._id;
    job.status = JobStatus.ASSIGNED;
    await job.save();

    return res.json({
      success: true,
      message: 'Applied to job successfully. Assigned to provider!',
      data: { job_id: job._id.toString(), status: job.status },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/jobs/:id/check-in
router.post('/:id/check-in', jwtRequired(true), async (req: AuthRequest, res: Response) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, error: 'Job not found' });

    const { photo, lat, lng } = req.body;
    job.status = JobStatus.IN_PROGRESS;
    job.checkInTime = new Date();
    job.checkInPhoto = photo || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500';
    if (lat && lng) job.checkInLocation = { lat, lng };

    await job.save();

    return res.json({
      success: true,
      message: 'GPS Check-In successful. Task status set to In Progress.',
      data: { job_id: job._id.toString(), status: job.status, check_in_time: job.checkInTime.toISOString() },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/jobs/:id/check-out
router.post('/:id/check-out', jwtRequired(true), async (req: AuthRequest, res: Response) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, error: 'Job not found' });

    const { photo } = req.body;
    job.status = JobStatus.COMPLETED;
    job.checkOutTime = new Date();
    job.completedAt = new Date();
    job.checkOutPhoto = photo || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500';

    await job.save();

    return res.json({
      success: true,
      message: 'GPS Check-Out completed. Awaiting escrow confirmation.',
      data: { job_id: job._id.toString(), status: job.status, check_out_time: job.checkOutTime.toISOString() },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/jobs/:id/confirm
router.post('/:id/confirm', jwtRequired(true), async (req: AuthRequest, res: Response) => {
  try {
    const result = await PaymentService.releasePayment(req.params.id);
    return res.json({
      success: true,
      message: result.message || 'Job confirmed and Escrow payment released to Artisan wallet.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
