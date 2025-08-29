import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';

const limiter = new RateLimiterMemory({
  points: 100, // Nombre de requêtes
  duration: 60, // Par minute
});

export function rateLimiter(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const key = req.ip || 'unknown';
  limiter.consume(key)
    .then(() => {
      next();
    })
    .catch(() => {
      res.status(429).json({
        success: false,
        error: 'Too many requests',
        timestamp: new Date().toISOString()
      });
    });
}
