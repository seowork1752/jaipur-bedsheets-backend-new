import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import connectDatabase from './config/database';

// Load environment variables
dotenv.config();

// Import routes (we'll create these)
// import authRoutes from './routes/auth';
// import productRoutes from './routes/products';
// import orderRoutes from './routes/orders';
// import paymentRoutes from './routes/payments';
// import userRoutes from './routes/users';

const app: Express = express();
const PORT = process.env.PORT || 5000;

// ==================== Middleware ====================

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ==================== Routes ====================

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'API is running successfully',
    timestamp: new Date().toISOString(),
  });
});

// API Routes (will be created)
// app.use('/api/auth', authRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/payments', paymentRoutes);
// app.use('/api/users', userRoutes);

// ==================== Error Handling ====================

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { error: err }),
  });
});

// ==================== Database Connection ====================

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Start server
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🛍️  JAIPUR BEDSHEETS ECOMMERCE API                     ║
║   ✅ Server running on port ${PORT}                        ║
║   📍 Environment: ${process.env.NODE_ENV || 'development'}                       ║
║   🗄️  Database: MongoDB                                  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
