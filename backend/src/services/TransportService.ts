import { Server } from 'socket.io';
import { 
  TransportLine, 
  TransportVehicle, 
  TransportStation, 
  TransportStats, 
  TransportFilter 
} from '../types';
import { logger } from '../utils/logger';
import { DataConnectorManager, TPGVehicle, TPGStop } from './DataConnectors';

export class TransportService {
  private io: Server;
  private updateInterval: NodeJS.Timeout | null = null;
  private lines: Map<string, TransportLine> = new Map();
  private vehicles: Map<string, TransportVehicle> = new Map();
  private stations: Map<string, TransportStation> = new Map();
  private dataConnector: DataConnectorManager;
  private useRealData: boolean;

  constructor(io: Server) {
    this.io = io;
    this.dataConnector = new DataConnectorManager();
    this.useRealData = process.env['USE_REAL_DATA'] === 'true';
    this.initializeData();
  }

  private initializeData(): void {
    // Initialiser les lignes TPG
    const genevaLines: TransportLine[] = [
      {
        id: 'line-001',
        lineId: 'TPG_1',
        name: 'Ligne 1',
        type: 'tram',
        operator: 'TPG',
        route: [
          { stationId: 'STATION_001', stationName: 'Gare Cornavin', latitude: 46.2100, longitude: 6.1429, order: 1 },
          { stationId: 'STATION_002', stationName: 'Bel-Air', latitude: 46.2044, longitude: 6.1432, order: 2 },
          { stationId: 'STATION_003', stationName: 'Rive', latitude: 46.2019, longitude: 6.1489, order: 3 }
        ],
        status: 'operational',
        frequency: 6,
        lastUpdate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Initialiser les véhicules
    const genevaVehicles: TransportVehicle[] = [
      {
        id: 'vehicle-001',
        vehicleId: 'TRAM_001',
        lineId: 'TPG_1',
        type: 'tram',
        currentLocation: { latitude: 46.2044, longitude: 6.1432, heading: 180 },
        status: 'in_service',
        occupancy: 65,
        speed: 25,
        nextStation: 'STATION_003',
        estimatedArrival: new Date(Date.now() + 2 * 60 * 1000),
        delay: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Ajouter les données aux Maps
    genevaLines.forEach(line => this.lines.set(line.lineId, line));
    genevaVehicles.forEach(vehicle => this.vehicles.set(vehicle.vehicleId, vehicle));
  }

  public startRealTimeUpdates(): void {
    this.updateInterval = setInterval(() => {
      this.updateTransportData();
    }, this.useRealData ? 15000 : 8000); // Real data: 15s, Mock data: 8s

    logger.info(`TransportService: Real-time updates started (${this.useRealData ? 'Real Data' : 'Mock Data'})`);
  }

  public stopRealTimeUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      logger.info('TransportService: Real-time updates stopped');
    }
  }

  private async updateTransportData(): Promise<void> {
    const now = new Date();

    if (this.useRealData) {
      try {
        // Récupérer les vraies données TPG
        const tpgData = await this.dataConnector.fetchTPGData();
        
        if (tpgData && tpgData.vehicles) {
          // Mettre à jour les véhicules avec les vraies données
          tpgData.vehicles.forEach((tpgVehicle: TPGVehicle) => {
            const vehicle = this.vehicles.get(tpgVehicle.vehicleId);
            if (vehicle) {
              vehicle.currentLocation = {
                latitude: tpgVehicle.latitude,
                longitude: tpgVehicle.longitude,
                heading: tpgVehicle.heading
              };
              vehicle.speed = tpgVehicle.speed;
              vehicle.occupancy = tpgVehicle.occupancy;
              vehicle.delay = tpgVehicle.delay;
              vehicle.nextStation = tpgVehicle.nextStop;
              vehicle.estimatedArrival = tpgVehicle.estimatedArrival;
              vehicle.updatedAt = now;
            }
          });
        } else {
          // Fallback vers les données simulées
          this.updateMockTransportData(now);
        }
      } catch (error) {
        logger.error('Erreur lors de la récupération des vraies données TPG:', error);
        // Fallback vers les données simulées
        this.updateMockTransportData(now);
      }
    } else {
      // Utiliser les données simulées
      this.updateMockTransportData(now);
    }

    this.broadcastTransportUpdate();
  }

  private updateMockTransportData(now: Date): void {
    this.vehicles.forEach(vehicle => {
      if (vehicle.status === 'in_service') {
        this.updateVehiclePosition(vehicle, now);
        this.updateVehicleOccupancy(vehicle);
        vehicle.updatedAt = now;
      }
    });
  }

  private updateVehiclePosition(vehicle: TransportVehicle, now: Date): void {
    const line = this.lines.get(vehicle.lineId);
    if (!line) return;

    vehicle.speed = 25 + Math.random() * 15;
    vehicle.estimatedArrival = new Date(now.getTime() + 2 * 60 * 1000);
  }

  private updateVehicleOccupancy(vehicle: TransportVehicle): void {
    const timeOfDay = new Date().getHours();
    let baseOccupancy = 30;

    if (timeOfDay >= 7 && timeOfDay <= 9) {
      baseOccupancy = 70;
    } else if (timeOfDay >= 17 && timeOfDay <= 19) {
      baseOccupancy = 65;
    }

    const variation = (Math.random() - 0.5) * 20;
    vehicle.occupancy = Math.max(0, Math.min(100, baseOccupancy + variation));
  }

  private broadcastTransportUpdate(): void {
    const update = {
      type: 'transport_update',
      data: {
        vehicles: Array.from(this.vehicles.values()),
        lines: Array.from(this.lines.values()),
        timestamp: new Date()
      }
    };

    this.io.to('transport').emit('transport_update', update);
  }

  public async getTransportLines(): Promise<TransportLine[]> {
    return Array.from(this.lines.values());
  }

  public async getTransportVehicles(): Promise<TransportVehicle[]> {
    return Array.from(this.vehicles.values());
  }

  public async getTransportStats(): Promise<TransportStats> {
    const vehicles = Array.from(this.vehicles.values());
    const totalPassengers = vehicles.reduce((sum, vehicle) => {
      const maxCapacity = vehicle.type === 'tram' ? 200 : 80;
      return sum + Math.round((vehicle.occupancy / 100) * maxCapacity);
    }, 0);

    return {
      period: 'hour',
      startTime: new Date(Date.now() - 60 * 60 * 1000),
      endTime: new Date(),
      totalPassengers,
      averageDelay: 2.5,
      onTimePercentage: 85,
      lineStats: []
    };
  }
}
