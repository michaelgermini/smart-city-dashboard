import { Router } from 'express';

const router = Router();

declare global {
  var parkingService: any;
}

router.get('/lots', async (req, res) => {
  try {
    const lots = await global.parkingService.getParkingLots();
    res.json({ success: true, data: lots, timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch parking lots', timestamp: new Date() });
  }
});

router.get('/stats/:period', async (req, res) => {
  try {
    const period = req.params.period as 'hour' | 'day' | 'week' | 'month';
    const stats = await global.parkingService.getParkingStats(period);
    res.json({ success: true, data: stats, timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch parking stats', timestamp: new Date() });
  }
});

export default router;
