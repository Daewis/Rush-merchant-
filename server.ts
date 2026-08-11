import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { connectDB } from './server/db.js';
import { seedInitialData } from './server/services/seedService.js';

import authRouter from './server/routes/auth.js';
import jobsRouter from './server/routes/jobs.js';
import providersRouter from './server/routes/providers.js';
import paymentsRouter from './server/routes/payments.js';
import violationsRouter from './server/routes/violations.js';
import notificationsRouter from './server/routes/notifications.js';
import ratingsRouter from './server/routes/ratings.js';
import usersRouter from './server/routes/users.js';
import adminRouter from './server/routes/admin.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 2. API Routes
  app.use('/api/auth', authRouter);
  app.use('/api/jobs', jobsRouter);
  app.use('/api/providers', providersRouter);
  app.use('/api/payments', paymentsRouter);
  app.use('/api/violations', violationsRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/ratings', ratingsRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/admin', adminRouter);

  // Healthcheck endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Rush Merchant TypeScript + MongoDB Server',
      timestamp: new Date().toISOString(),
    });
  });

  // 3. Vite Frontend Integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // 5. Start Server on Port 3000
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Rush Merchant Full-Stack Express Server running at http://0.0.0.0:${PORT}`);
  });

  // 6. Connect to DB & Seed asynchronously
  connectDB().then(() => {
    seedInitialData().catch(err => console.error('Seed error:', err));
  }).catch(err => {
    console.error('DB connection background error:', err);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});
