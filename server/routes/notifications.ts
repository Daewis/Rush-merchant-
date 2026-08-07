import express, { Response } from 'express';
import { Notification } from '../models/Notification.js';
import { jwtRequired, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// GET /api/notifications
router.get('/', jwtRequired(true), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const notifications = userId
      ? await Notification.find({ userId }).sort({ createdAt: -1 })
      : await Notification.find().limit(20).sort({ createdAt: -1 });

    const formatted = notifications.map((n: any) => ({
      id: n._id.toString(),
      title: n.title,
      message: n.message,
      type: n.type,
      read: n.read,
      created_at: n.createdAt.toISOString(),
    }));

    return res.json({ success: true, data: { notifications: formatted } });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', jwtRequired(true), async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { read: true });
  return res.json({ success: true, message: 'Notification marked as read' });
});

// PUT /api/notifications/read-all
router.put('/read-all', jwtRequired(true), async (req: AuthRequest, res: Response) => {
  if (req.userId) {
    await Notification.updateMany({ userId: req.userId }, { read: true });
  }
  return res.json({ success: true, message: 'All notifications marked as read' });
});

export default router;
