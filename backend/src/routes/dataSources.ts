import { Router } from 'express';
import { DataSourceTester } from '../utils/dataSourceTester';
import { DataConnectorManager } from '../services/DataConnectors';

const router = Router();
const dataConnector = new DataConnectorManager();
const dataTester = new DataSourceTester();

// Route pour obtenir le statut de toutes les sources de données
router.get('/status', async (req, res) => {
  try {
    const report = await dataTester.generateTestReport();
    const status = JSON.parse(report);
    
    res.json({
      success: true,
      data: status,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get data sources status',
      timestamp: new Date()
    });
  }
});

// Route pour tester une source spécifique
router.get('/test/:source', async (req, res) => {
  try {
    const { source } = req.params;
    
    if (!['tpg', 'parking', 'traffic', 'weather'].includes(source)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid source. Must be one of: tpg, parking, traffic, weather',
        timestamp: new Date()
      });
    }

    let data = null;
    let error = null;

    try {
      switch (source) {
        case 'tpg':
          data = await dataConnector.fetchTPGData();
          break;
        case 'parking':
          data = await dataConnector.fetchParkingData();
          break;
        case 'traffic':
          data = await dataConnector.fetchTrafficData();
          break;
        case 'weather':
          data = await dataConnector.fetchWeatherData();
          break;
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error';
    }

    res.json({
      success: true,
      data: {
        source,
        status: error ? 'error' : (data ? 'success' : 'no_data'),
        data: data,
        error: error,
        timestamp: new Date()
      },
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to test data source',
      timestamp: new Date()
    });
  }
});

// Route pour obtenir les données en temps réel
router.get('/realtime', async (req, res) => {
  try {
    const allData = await dataConnector.fetchAllData();
    
    res.json({
      success: true,
      data: {
        tpg: allData.tpg,
        parking: allData.parking,
        traffic: allData.traffic,
        weather: allData.weather,
        errors: allData.errors,
        timestamp: new Date()
      },
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch real-time data',
      timestamp: new Date()
    });
  }
});

// Route pour obtenir la configuration des sources de données
router.get('/config', async (req, res) => {
  try {
    const config = {
      useRealData: process.env['USE_REAL_DATA'] === 'true',
      sources: {
        tpg: {
          enabled: !!process.env['TPG_API_KEY'],
          baseUrl: 'https://api.tpg.ch/v1',
          endpoints: ['/vehicles', '/stops', '/schedules']
        },
        parking: {
          enabled: !!process.env['GENEVA_API_KEY'],
          baseUrl: 'https://data.ge.ch/api',
          dataset: 'parkings-publics'
        },
        traffic: {
          enabled: !!process.env['TRAFFIC_API_KEY'],
          baseUrl: 'https://api.traffic.geneva.ch',
          endpoint: '/sensors/current'
        },
        weather: {
          enabled: !!process.env['WEATHER_API_KEY'],
          baseUrl: 'https://api.openweathermap.org/data/2.5',
          endpoint: '/weather',
          location: { lat: 46.2044, lon: 6.1432 }
        }
      },
      updateIntervals: {
        traffic: process.env['USE_REAL_DATA'] === 'true' ? 30000 : 5000,
        parking: process.env['USE_REAL_DATA'] === 'true' ? 60000 : 10000,
        transport: process.env['USE_REAL_DATA'] === 'true' ? 15000 : 8000,
        weather: 300000
      }
    };

    res.json({
      success: true,
      data: config,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get data sources configuration',
      timestamp: new Date()
    });
  }
});

export default router;
