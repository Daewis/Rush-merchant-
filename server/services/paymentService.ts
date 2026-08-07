import { Payment, PaymentStatus } from '../models/Payment.js';
import { Job, JobStatus } from '../models/Job.js';
import { Provider } from '../models/Provider.js';
import { User } from '../models/User.js';
import { NotificationService } from './notificationService.js';

export class PaymentService {
  static async releasePayment(jobId: string) {
    const payment = await Payment.findOne({ jobId });
    if (!payment) {
      return { success: false, message: 'Payment record not found' };
    }

    if (payment.status !== PaymentStatus.HELD && payment.status !== PaymentStatus.PENDING) {
      return { success: false, message: `Payment is not in escrow. Current status: ${payment.status}` };
    }

    payment.status = PaymentStatus.RELEASED;
    payment.releasedAt = new Date();
    await payment.save();

    const job = await Job.findById(jobId);
    if (job) {
      job.status = JobStatus.COMPLETED;
      job.completedAt = new Date();
      await job.save();

      const provider = await Provider.findOne({ userId: job.providerId });
      if (provider) {
        provider.totalJobsCompleted += 1;
        provider.totalEarnings += payment.providerEarnings;
        await provider.save();
      }

      const providerUser = await User.findById(job.providerId);
      if (providerUser) {
        await NotificationService.sendPaymentReceivedSms(
          providerUser.phone,
          payment.providerEarnings,
          job.title
        );
      }
    }

    return { success: true, message: 'Payment released from Escrow successfully' };
  }
}
