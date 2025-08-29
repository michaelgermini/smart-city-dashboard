import { Server } from 'socket.io';
import { ParkingLot, ParkingSensor, ParkingStats, ParkingFilter } from '../types';
import { logger } from '../utils/logger';
import { DataConnectorManager, GenevaParkingData } from './DataConnectors';

export class ParkingService {
  private io: Server;
  private updateInterval: NodeJS.Timeout | null = null;
  private parkingLots: Map<string, ParkingLot> = new Map();
  private sensors: Map<string, ParkingSensor> = new Map();
  private dataConnector: DataConnectorManager;
  private useRealData: boolean;

  constructor(io: Server) {
    this.io = io;
    this.dataConnector = new DataConnectorManager();
    this.useRealData = process.env['USE_REAL_DATA'] === 'true';
    this.initializeData();
  }

  private initializeData(): void {
    // Initialiser les parkings P+R et publics de Genève
    const genevaParkings: ParkingLot[] = [
      {
        id: 'parking-001',
        lotId: 'P+R_CORNOVIN',
        name: 'P+R Cornavin',
        type: 'P+R',
        location: {
          latitude: 46.2100,
          longitude: 6.1429,
          address: 'Place de Cornavin, 1201 Genève',
          zone: 'Centre-ville'
        },
        capacity: {
          total: 500,
          available: 150,
          reserved: 50
        },
        pricing: {
          hourly: 2.50,
          daily: 15.00,
          monthly: 120.00
        },
        status: 'open',
        lastUpdate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'parking-002',
        lotId: 'P+R_BERCHET',
        name: 'P+R Berchet',
        type: 'P+R',
        location: {
          latitude: 46.1950,
          longitude: 6.1500,
          address: 'Route de Chêne 120, 1224 Chêne-Bourg',
          zone: 'Chêne-Bourg'
        },
        capacity: {
          total: 300,
          available: 80,
          reserved: 30
        },
        pricing: {
          hourly: 2.00,
          daily: 12.00,
          monthly: 100.00
        },
        status: 'open',
        lastUpdate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'parking-003',
        lotId: 'PARKING_UNI',
        name: 'Parking Université',
        type: 'public',
        location: {
          latitude: 46.2019,
          longitude: 6.1489,
          address: 'Boulevard Carl-Vogt 65, 1205 Genève',
          zone: 'Université'
        },
        capacity: {
          total: 200,
          available: 45,
          reserved: 20
        },
        pricing: {
          hourly: 3.00,
          daily: 18.00,
          monthly: 150.00
        },
        status: 'open',
        lastUpdate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'parking-004',
        lotId: 'PARKING_RHONE',
        name: 'Parking Rue du Rhône',
        type: 'public',
        location: {
          latitude: 46.2044,
          longitude: 6.1432,
          address: 'Rue du Rhône 42, 1204 Genève',
          zone: 'Centre-ville'
        },
        capacity: {
          total: 150,
          available: 25,
          reserved: 15
        },
        pricing: {
          hourly: 4.00,
          daily: 25.00,
          monthly: 200.00
        },
        status: 'open',
        lastUpdate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'parking-005',
        lotId: 'PARKING_AIRPORT',
        name: 'Parking Aéroport',
        type: 'public',
        location: {
          latitude: 46.2381,
          longitude: 6.1089,
          address: 'Route de l\'Aéroport 21, 1215 Genève',
          zone: 'Aéroport'
        },
        capacity: {
          total: 800,
          available: 200,
          reserved: 100
        },
        pricing: {
          hourly: 3.50,
          daily: 20.00,
          monthly: 180.00
        },
        status: 'open',
        lastUpdate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Initialiser les capteurs de stationnement
    const parkingSensors: ParkingSensor[] = [];
    let sensorId = 1;

    genevaParkings.forEach(parking => {
      for (let spot = 1; spot <= parking.capacity.total; spot++) {
        const isOccupied = Math.random() > 0.7; // 30% de chance d'être occupé
        const isReserved = spot <= parking.capacity.reserved;
        
        let status: 'occupied' | 'available' | 'reserved' | 'maintenance' = 'available';
        if (isReserved) {
          status = 'reserved';
        } else if (isOccupied) {
          status = 'occupied';
        }

        parkingSensors.push({
          id: `sensor-${sensorId}`,
          sensorId: `PARKING_SENSOR_${sensorId.toString().padStart(3, '0')}`,
          lotId: parking.lotId,
          spotNumber: spot,
          status,
          lastReading: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        });
        sensorId++;
      }
    });

    // Ajouter les parkings et capteurs aux Maps
    genevaParkings.forEach(parking => this.parkingLots.set(parking.lotId, parking));
    parkingSensors.forEach(sensor => this.sensors.set(sensor.sensorId, sensor));

    // Mettre à jour les capacités initiales
    this.updateParkingCapacities();
  }

  public startRealTimeUpdates(): void {
    this.updateInterval = setInterval(() => {
      this.updateParkingData();
    }, this.useRealData ? 60000 : 10000); // Real data: 60s, Mock data: 10s

    logger.info(`ParkingService: Real-time updates started (${this.useRealData ? 'Real Data' : 'Mock Data'})`);
  }

  public stopRealTimeUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      logger.info('ParkingService: Real-time updates stopped');
    }
  }

  private async updateParkingData(): Promise<void> {
    const now = new Date();

    if (this.useRealData) {
      try {
        // Récupérer les vraies données de stationnement
        const realParkingData = await this.dataConnector.fetchParkingData();
        
        if (realParkingData) {
          // Mettre à jour les parkings avec les vraies données
          realParkingData.forEach((data: GenevaParkingData) => {
            const parking = Array.from(this.parkingLots.values()).find(
              lot => lot.lotId === data.parkingId || lot.name === data.name
            );
            
            if (parking) {
              parking.capacity.available = data.availableSpaces;
              parking.capacity.total = data.totalSpaces;
              parking.lastUpdate = data.lastUpdate;
              parking.updatedAt = now;
            }
          });
        } else {
          // Fallback vers les données simulées
          this.updateMockParkingData(now);
        }
      } catch (error) {
        logger.error('Erreur lors de la récupération des vraies données de stationnement:', error);
        // Fallback vers les données simulées
        this.updateMockParkingData(now);
      }
    } else {
      // Utiliser les données simulées
      this.updateMockParkingData(now);
    }

    // Envoyer les mises à jour via WebSocket
    this.broadcastParkingUpdate();
  }

  private updateMockParkingData(now: Date): void {
    // Simuler des changements d'occupation
    this.sensors.forEach(sensor => {
      if (sensor.status !== 'reserved' && sensor.status !== 'maintenance') {
        // Probabilité de changement d'état
        const changeProbability = 0.05; // 5% de chance de changement
        if (Math.random() < changeProbability) {
          sensor.status = sensor.status === 'occupied' ? 'available' : 'occupied';
          sensor.lastReading = now;
          sensor.updatedAt = now;
        }
      }
    });

    // Mettre à jour les capacités des parkings
    this.updateParkingCapacities();
  }

  private updateParkingCapacities(): void {
    this.parkingLots.forEach(parking => {
      const lotSensors = Array.from(this.sensors.values()).filter(
        sensor => sensor.lotId === parking.lotId
      );

      const occupiedCount = lotSensors.filter(sensor => sensor.status === 'occupied').length;
      const reservedCount = lotSensors.filter(sensor => sensor.status === 'reserved').length;
      const availableCount = lotSensors.filter(sensor => sensor.status === 'available').length;

      parking.capacity.available = availableCount;
      parking.capacity.reserved = reservedCount;
      parking.lastUpdate = new Date();
      parking.updatedAt = new Date();
    });
  }

  private broadcastParkingUpdate(): void {
    const update = {
      type: 'parking_update',
      data: {
        parkingLots: Array.from(this.parkingLots.values()),
        timestamp: new Date()
      }
    };

    this.io.to('parking').emit('parking_update', update);
  }

  // Méthodes publiques pour l'API
  public async getParkingLots(filter?: ParkingFilter): Promise<ParkingLot[]> {
    let filteredLots = Array.from(this.parkingLots.values());

    if (filter) {
      if (filter.lotType) {
        filteredLots = filteredLots.filter(lot => lot.type === filter.lotType);
      }

      if (filter.zone) {
        filteredLots = filteredLots.filter(lot => lot.location.zone === filter.zone);
      }

      if (filter.availability) {
        filteredLots = filteredLots.filter(lot => {
          const occupancyRate = (lot.capacity.total - lot.capacity.available) / lot.capacity.total;
          switch (filter.availability) {
            case 'available':
              return occupancyRate < 0.8;
            case 'occupied':
              return occupancyRate > 0.8;
            default:
              return true;
          }
        });
      }
    }

    return filteredLots.sort((a, b) => a.name.localeCompare(b.name));
  }

  public async getParkingSensors(lotId?: string): Promise<ParkingSensor[]> {
    let sensors = Array.from(this.sensors.values());

    if (lotId) {
      sensors = sensors.filter(sensor => sensor.lotId === lotId);
    }

    return sensors.sort((a, b) => a.spotNumber - b.spotNumber);
  }

  public async getParkingLotById(lotId: string): Promise<ParkingLot | null> {
    return this.parkingLots.get(lotId) || null;
  }

  public async getParkingStats(period: 'hour' | 'day' | 'week' | 'month'): Promise<ParkingStats> {
    const now = new Date();
    let startTime: Date;

    switch (period) {
      case 'hour':
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case 'day':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const parkingLots = Array.from(this.parkingLots.values());
    
    const totalOccupancy = parkingLots.reduce((sum, lot) => 
      sum + (lot.capacity.total - lot.capacity.available), 0
    );

    const totalCapacity = parkingLots.reduce((sum, lot) => sum + lot.capacity.total, 0);
    const averageOccupancy = totalCapacity > 0 ? (totalOccupancy / totalCapacity) * 100 : 0;

    // Calculer le taux de rotation (simulation)
    const turnoverRate = 0.15 + Math.random() * 0.1; // 15-25%

    // Calculer les revenus (simulation basée sur l'occupation)
    const revenue = parkingLots.reduce((sum, lot) => {
      const occupancyRate = (lot.capacity.total - lot.capacity.available) / lot.capacity.total;
      const dailyRevenue = occupancyRate * lot.capacity.total * lot.pricing.hourly * 8; // 8h par jour
      return sum + dailyRevenue;
    }, 0);

    // Statistiques par parking
    const lotStats = parkingLots.map(lot => {
      const occupancy = ((lot.capacity.total - lot.capacity.available) / lot.capacity.total) * 100;
      const lotRevenue = occupancy * lot.capacity.total * lot.pricing.hourly * 8 / 100;
      const lotTurnoverRate = 0.1 + Math.random() * 0.2; // 10-30%

      return {
        lotId: lot.lotId,
        lotName: lot.name,
        occupancy,
        revenue: lotRevenue,
        turnoverRate: lotTurnoverRate
      };
    });

    return {
      period,
      startTime,
      endTime: now,
      totalOccupancy,
      averageOccupancy,
      turnoverRate,
      revenue,
      lotStats
    };
  }

  public async getParkingAvailability(lotId?: string): Promise<{
    lotId: string;
    lotName: string;
    available: number;
    total: number;
    occupancyRate: number;
  }[]> {
    const lots = lotId 
      ? [this.parkingLots.get(lotId)].filter(Boolean) as ParkingLot[]
      : Array.from(this.parkingLots.values());

    return lots.map(lot => ({
      lotId: lot.lotId,
      lotName: lot.name,
      available: lot.capacity.available,
      total: lot.capacity.total,
      occupancyRate: ((lot.capacity.total - lot.capacity.available) / lot.capacity.total) * 100
    }));
  }

  public async getParkingHeatmap(): Promise<{
    lotId: string;
    lotName: string;
    latitude: number;
    longitude: number;
    occupancyRate: number;
    intensity: number;
  }[]> {
    return Array.from(this.parkingLots.values()).map(lot => {
      const occupancyRate = ((lot.capacity.total - lot.capacity.available) / lot.capacity.total) * 100;
      const intensity = occupancyRate / 100; // Normalisé entre 0 et 1

      return {
        lotId: lot.lotId,
        lotName: lot.name,
        latitude: lot.location.latitude,
        longitude: lot.location.longitude,
        occupancyRate,
        intensity
      };
    });
  }

  public async reserveSpot(lotId: string, spotNumber: number): Promise<boolean> {
    const sensor = Array.from(this.sensors.values()).find(
      s => s.lotId === lotId && s.spotNumber === spotNumber
    );

    if (sensor && sensor.status === 'available') {
      sensor.status = 'reserved';
      sensor.updatedAt = new Date();
      this.updateParkingCapacities();
      this.broadcastParkingUpdate();
      return true;
    }

    return false;
  }

  public async releaseSpot(lotId: string, spotNumber: number): Promise<boolean> {
    const sensor = Array.from(this.sensors.values()).find(
      s => s.lotId === lotId && s.spotNumber === spotNumber
    );

    if (sensor && sensor.status === 'reserved') {
      sensor.status = 'available';
      sensor.updatedAt = new Date();
      this.updateParkingCapacities();
      this.broadcastParkingUpdate();
      return true;
    }

    return false;
  }
}
