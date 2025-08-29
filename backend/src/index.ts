import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';

import { connectDatabase } from './config/database';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';

// Routes
import authRoutes from './routes/auth';
import trafficRoutes from './routes/traffic';
import parkingRoutes from './routes/parking';
import transportRoutes from './routes/transport';
import alertsRoutes from './routes/alerts';
import dataSourcesRoutes from './routes/dataSources';

// Services
import { TrafficService } from './services/TrafficService';
import { ParkingService } from './services/ParkingService';
import { TransportService } from './services/TransportService';
import { AlertService } from './services/AlertService';

// Global services registry
declare global {
  var globalServices: {
    trafficService: TrafficService;
    parkingService: ParkingService;
    transportService: TransportService;
    alertService: AlertService;
  };
}

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(compression());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(rateLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/traffic', trafficRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/datasources', dataSourcesRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  // Join traffic room
  socket.on('join-traffic', () => {
    socket.join('traffic');
    logger.info(`Client ${socket.id} joined traffic room`);
  });

  // Join parking room
  socket.on('join-parking', () => {
    socket.join('parking');
    logger.info(`Client ${socket.id} joined parking room`);
  });

  // Join transport room
  socket.on('join-transport', () => {
    socket.join('transport');
    logger.info(`Client ${socket.id} joined transport room`);
  });

  // Join alerts room
  socket.on('join-alerts', () => {
    socket.join('alerts');
    logger.info(`Client ${socket.id} joined alerts room`);
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Initialize services
const trafficService = new TrafficService(io);
const parkingService = new ParkingService(io);
const transportService = new TransportService(io);
const alertService = new AlertService(io);

// Make services globally available
global.globalServices = {
  trafficService,
  parkingService,
  transportService,
  alertService
};

// Start real-time data updates
trafficService.startRealTimeUpdates();
parkingService.startRealTimeUpdates();
transportService.startRealTimeUpdates();
alertService.startRealTimeUpdates();

// Error handling
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    await connectDatabase();
    logger.info('Database connected successfully');

    server.listen(PORT, () => {
      logger.info(`🚀 Smart City Backend running on port ${PORT}`);
      logger.info(`📊 Dashboard available at ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      logger.info(`🔌 WebSocket server ready for real-time updates`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});
