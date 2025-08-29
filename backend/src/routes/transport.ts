import { Router } from 'express';

const router = Router();

declare global {
  var transportService: any;
}

router.get('/lines', async (req, res) => {
  try {
    const lines = await global.transportService.getTransportLines();
    res.json({ success: true, data: lines, timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch transport lines', timestamp: new Date() });
  }
});

router.get('/vehicles', async (req, res) => {
  try {
    const vehicles = await global.transportService.getTransportVehicles();
    res.json({ success: true, data: vehicles, timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch transport vehicles', timestamp: new Date() });
  }
});

router.get('/stats/:period', async (req, res) => {
  try {
    const period = req.params.period as 'hour' | 'day' | 'week' | 'month';
    const stats = await global.transportService.getTransportStats(period);
    res.json({ success: true, data: stats, timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch transport stats', timestamp: new Date() });
  }
});

export default router;
