import { Router } from 'express';

const router = Router();

declare global {
  var alertService: any;
}

router.get('/', async (req, res) => {
  try {
    const filter = {
      type: req.query.type as string,
      severity: req.query.severity as string,
      status: req.query.status as string,
      zone: req.query.zone as string
    };
    const alerts = await global.alertService.getAlerts(filter);
    res.json({ success: true, data: alerts, timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch alerts', timestamp: new Date() });
  }
});

router.get('/active', async (req, res) => {
  try {
    const alerts = await global.alertService.getActiveAlerts();
    res.json({ success: true, data: alerts, timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch active alerts', timestamp: new Date() });
  }
});

export default router;
