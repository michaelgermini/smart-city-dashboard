import { Router } from 'express';
import { TrafficService } from '../services/TrafficService';
import { Server } from 'socket.io';

const router = Router();

// Récupérer l'instance du service depuis le contexte global
declare global {
  var trafficService: TrafficService;
}

// Routes pour les données de trafic
router.get('/readings', async (req, res) => {
  try {
    const filter = {
      zone: req.query.zone as string,
      sensorType: req.query.sensorType as string,
      congestionLevel: req.query.congestionLevel as string,
      startTime: req.query.startTime ? new Date(req.query.startTime as string) : undefined,
      endTime: req.query.endTime ? new Date(req.query.endTime as string) : undefined
    };

    const readings = await global.trafficService.getTrafficReadings(filter);
    
    res.json({
      success: true,
      data: readings,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch traffic readings',
      timestamp: new Date()
    });
  }
});

router.get('/sensors', async (req, res) => {
  try {
    const sensors = await global.trafficService.getTrafficSensors();
    
    res.json({
      success: true,
      data: sensors,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch traffic sensors',
      timestamp: new Date()
    });
  }
});

router.get('/zones', async (req, res) => {
  try {
    const zones = await global.trafficService.getTrafficZones();
    
    res.json({
      success: true,
      data: zones,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch traffic zones',
      timestamp: new Date()
    });
  }
});

router.get('/stats/:period', async (req, res) => {
  try {
    const period = req.params.period as 'hour' | 'day' | 'week' | 'month';
    const stats = await global.trafficService.getTrafficStats(period);
    
    res.json({
      success: true,
      data: stats,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch traffic statistics',
      timestamp: new Date()
    });
  }
});

router.get('/sensors/:sensorId', async (req, res) => {
  try {
    const sensor = await global.trafficService.getSensorById(req.params.sensorId);
    
    if (!sensor) {
      return res.status(404).json({
        success: false,
        error: 'Sensor not found',
        timestamp: new Date()
      });
    }
    
    res.json({
      success: true,
      data: sensor,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sensor',
      timestamp: new Date()
    });
  }
});

router.get('/zones/:zoneId', async (req, res) => {
  try {
    const zone = await global.trafficService.getZoneById(req.params.zoneId);
    
    if (!zone) {
      return res.status(404).json({
        success: false,
        error: 'Zone not found',
        timestamp: new Date()
      });
    }
    
    res.json({
      success: true,
      data: zone,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch zone',
      timestamp: new Date()
    });
  }
});

export default router;
