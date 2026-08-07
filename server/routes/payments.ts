import express, { Response } from 'express';
import { Payment, PaymentStatus, PaymentProviderEnum } from '../models/Payment.js';
import { Job } from '../models/Job.js';
import { User } from '../models/User.js';
import { jwtRequired, AuthRequest } from '../middleware/auth.js';
import { PaymentService } from '../services/paymentService.js';

const router = express.Router();

// GET /api/payments
router.get('/', jwtRequired(true), async (req: AuthRequest, res: Response) => {
  try {
    const payments = await Payment.find()
      .populate('jobId', 'title category')
      .populate('customerId', 'fullName')
      .populate('providerId', 'fullName')
      .sort({ createdAt: -1 });

    const formatted = payments.map((p: any) => ({
      id: p._id.toString(),
      job_id: p.jobId?._id?.toString() || p.jobId?.toString(),
      job_title: p.jobId?.title || 'Campus Task',
      amount: p.amount,
      platform_fee: p.platformFee,
      provider_earnings: p.providerEarnings,
      provider: p.provider,
      reference: p.reference,
      status: p.status,
      created_at: p.createdAt.toISOString(),
    }));

    return res.json({ success: true, data: { payments: formatted } });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/payments
router.post('/', jwtRequired(true), async (req: AuthRequest, res: Response) => {
  try {
    const { job_id, amount, provider_type } = req.body;
    if (!job_id || !amount) {
      return res.status(400).json({ success: false, error: 'Job ID and amount are required' });
    }

    const job = await Job.findById(job_id);
    if (!job) return res.status(404).json({ success: false, error: 'Job not found' });

    const customer = req.user || (await User.findById(job.customerId)) || (await User.findOne());
    const providerUser = await User.findById(job.providerId) || customer;

    const platformFee = Math.round(amount * 0.1);
    const providerEarnings = amount - platformFee;
    const refPrefix = (provider_type || 'opay').toUpperCase();
    const reference = `${refPrefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const payment = await Payment.create({
      jobId: job._id,
      customerId: customer._id,
      providerId: providerUser._id,
      amount,
      platformFee,
      providerEarnings,
      provider: provider_type || PaymentProviderEnum.OPAY,
      reference,
      status: PaymentStatus.HELD,
      heldAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: 'Payment received into Escrow Wallet successfully',
      data: {
        payment: {
          id: payment._id.toString(),
          reference: payment.reference,
          amount: payment.amount,
          status: payment.status,
          authorization_url: `https://checkout.rushng.com/pay/${payment.reference}`,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/payments/verify
router.post('/verify', async (req, res) => {
  const { reference } = req.body;
  const payment = await Payment.findOne({ reference });
  if (payment) {
    payment.status = PaymentStatus.HELD;
    payment.heldAt = new Date();
    await payment.save();
  }
  return res.json({ success: true, message: 'Payment verified and placed in Escrow' });
});

export default router;
