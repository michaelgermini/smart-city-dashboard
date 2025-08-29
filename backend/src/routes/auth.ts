import { Router } from 'express';

const router = Router();

router.post('/login', (req, res) => {
  // Simulation d'authentification
  res.json({
    success: true,
    data: {
      token: 'mock-jwt-token',
      user: {
        id: 'user-001',
        username: 'operator',
        role: 'operator'
      }
    },
    timestamp: new Date()
  });
});

router.get('/me', (req, res) => {
  res.json({
    success: true,
    data: {
      id: 'user-001',
      username: 'operator',
      role: 'operator'
    },
    timestamp: new Date()
  });
});

export default router;
