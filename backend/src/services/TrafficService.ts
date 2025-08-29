import { Server } from 'socket.io';
import { TrafficReading, TrafficSensor, TrafficZone, TrafficStats, TrafficFilter } from '../types';
import { logger } from '../utils/logger';
import { DataConnectorManager, GenevaTrafficData } from './DataConnectors';

export class TrafficService {
  private io: Server;
  private updateInterval: NodeJS.Timeout | null = null;
  private sensors: Map<string, TrafficSensor> = new Map();
  private zones: Map<string, TrafficZone> = new Map();
  private readings: TrafficReading[] = [];
  private dataConnector: DataConnectorManager;
  private useRealData: boolean;

  constructor(io: Server) {
    this.io = io;
    this.dataConnector = new DataConnectorManager();
    this.useRealData = process.env['USE_REAL_DATA'] === 'true';
    this.initializeData();
  }

  private initializeData(): void {
    // Initialiser les capteurs de trafic pour Genève
    const genevaSensors: TrafficSensor[] = [
      {
        id: 'sensor-001',
        sensorId: 'TRAFFIC_001',
        location: {
          latitude: 46.2044,
          longitude: 6.1432,
          address: 'Pont du Mont-Blanc',
          zone: 'Centre-ville'
        },
        type: 'loop',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'sensor-002',
        sensorId: 'TRAFFIC_002',
        location: {
          latitude: 46.2081,
          longitude: 6.1429,
          address: 'Autoroute A1 - Sortie Genève',
          zone: 'Périphérie'
        },
        type: 'radar',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'sensor-003',
        sensorId: 'TRAFFIC_003',
        location: {
          latitude: 46.2019,
          longitude: 6.1489,
          address: 'Rue du Rhône',
          zone: 'Centre-ville'
        },
        type: 'camera',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'sensor-004',
        sensorId: 'TRAFFIC_004',
        location: {
          latitude: 46.2100,
          longitude: 6.1400,
          address: 'Boulevard Carl-Vogt',
          zone: 'Université'
        },
        type: 'loop',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'sensor-005',
        sensorId: 'TRAFFIC_005',
        location: {
          latitude: 46.1950,
          longitude: 6.1500,
          address: 'Route de Chêne',
          zone: 'Chêne-Bourg'
        },
        type: 'radar',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Initialiser les zones de trafic
    const genevaZones: TrafficZone[] = [
      {
        id: 'zone-001',
        name: 'Centre-ville',
        description: 'Zone centrale de Genève',
        coordinates: [
          { lat: 46.2044, lng: 6.1432 },
          { lat: 46.2081, lng: 6.1429 },
          { lat: 46.2019, lng: 6.1489 }
        ],
        sensors: ['TRAFFIC_001', 'TRAFFIC_003'],
        congestionThreshold: 80,
        currentStatus: 'fluid'
      },
      {
        id: 'zone-002',
        name: 'Périphérie',
        description: 'Zone périphérique de Genève',
        coordinates: [
          { lat: 46.2081, lng: 6.1429 },
          { lat: 46.2100, lng: 6.1400 },
          { lat: 46.1950, lng: 6.1500 }
        ],
        sensors: ['TRAFFIC_002', 'TRAFFIC_004', 'TRAFFIC_005'],
        congestionThreshold: 70,
        currentStatus: 'fluid'
      }
    ];

    // Ajouter les capteurs et zones aux Maps
    genevaSensors.forEach(sensor => this.sensors.set(sensor.sensorId, sensor));
    genevaZones.forEach(zone => this.zones.set(zone.id, zone));
  }

  public startRealTimeUpdates(): void {
    this.updateInterval = setInterval(() => {
      this.updateTrafficData();
    }, this.useRealData ? 30000 : 5000); // Real data: 30s, Mock data: 5s

    logger.info(`TrafficService: Real-time updates started (${this.useRealData ? 'Real Data' : 'Mock Data'})`);
  }

  public stopRealTimeUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      logger.info('TrafficService: Real-time updates stopped');
    }
  }

  private async updateTrafficData(): Promise<void> {
    const now = new Date();
    let newReadings: TrafficReading[] = [];

    if (this.useRealData) {
      try {
        // Récupérer les vraies données de trafic
        const realTrafficData = await this.dataConnector.fetchTrafficData();
        
        if (realTrafficData) {
          newReadings = realTrafficData.map((data: GenevaTrafficData) => ({
            id: `reading-${Date.now()}-${data.sensorId}`,
            sensorId: data.sensorId,
            timestamp: data.timestamp,
            vehicleCount: data.vehicleCount,
            averageSpeed: data.averageSpeed,
            congestionLevel: this.calculateCongestionLevel(data.congestionLevel),
            flowRate: data.vehicleCount,
            occupancy: data.congestionLevel
          }));

          // Mettre à jour les capteurs avec les vraies données
          newReadings.forEach(reading => {
            const sensor = this.sensors.get(reading.sensorId);
            if (sensor) {
              sensor.lastReading = reading;
              sensor.updatedAt = now;
            }
          });
        } else {
          // Fallback vers les données simulées si les vraies données ne sont pas disponibles
          newReadings = this.generateMockReadings(now);
        }
      } catch (error) {
        logger.error('Erreur lors de la récupération des vraies données de trafic:', error);
        // Fallback vers les données simulées
        newReadings = this.generateMockReadings(now);
      }
    } else {
      // Utiliser les données simulées
      newReadings = this.generateMockReadings(now);
    }

    // Ajouter les nouvelles lectures
    this.readings.push(...newReadings);

    // Garder seulement les 1000 dernières lectures
    if (this.readings.length > 1000) {
      this.readings = this.readings.slice(-1000);
    }

    // Mettre à jour le statut des zones
    this.updateZoneStatus();

    // Envoyer les mises à jour via WebSocket
    this.broadcastTrafficUpdate(newReadings);
  }

  private generateMockReadings(timestamp: Date): TrafficReading[] {
    const newReadings: TrafficReading[] = [];

    // Générer de nouvelles lectures pour chaque capteur
    this.sensors.forEach(sensor => {
      if (sensor.status === 'active') {
        const reading = this.generateTrafficReading(sensor, timestamp);
        newReadings.push(reading);
        
        // Mettre à jour la dernière lecture du capteur
        sensor.lastReading = reading;
        sensor.updatedAt = timestamp;
      }
    });

    return newReadings;
  }

  private generateTrafficReading(sensor: TrafficSensor, timestamp: Date): TrafficReading {
    const baseFlowRate = 30; // véhicules par minute de base
    const timeOfDay = timestamp.getHours();
    
    // Facteurs de variation selon l'heure
    let flowMultiplier = 1;
    if (timeOfDay >= 7 && timeOfDay <= 9) {
      flowMultiplier = 2.5; // Heures de pointe matin
    } else if (timeOfDay >= 17 && timeOfDay <= 19) {
      flowMultiplier = 2.2; // Heures de pointe soir
    } else if (timeOfDay >= 22 || timeOfDay <= 6) {
      flowMultiplier = 0.3; // Heures creuses
    }

    // Ajouter de la variation aléatoire
    const randomFactor = 0.8 + Math.random() * 0.4; // ±20%
    const flowRate = Math.round(baseFlowRate * flowMultiplier * randomFactor);
    
    // Calculer la vitesse moyenne (inversement proportionnelle au flux)
    const averageSpeed = Math.max(20, 80 - (flowRate * 0.8));
    
    // Calculer le niveau de congestion
    let congestionLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (flowRate > 80) congestionLevel = 'critical';
    else if (flowRate > 60) congestionLevel = 'high';
    else if (flowRate > 40) congestionLevel = 'medium';

    // Calculer l'occupation (pourcentage de la capacité)
    const occupancy = Math.min(100, (flowRate / 100) * 100);

    return {
      id: `reading-${Date.now()}-${sensor.sensorId}`,
      sensorId: sensor.sensorId,
      timestamp,
      vehicleCount: flowRate,
      averageSpeed,
      congestionLevel,
      flowRate,
      occupancy
    };
  }

  private calculateCongestionLevel(level: number): 'low' | 'medium' | 'high' | 'critical' {
    if (level > 80) return 'critical';
    if (level > 60) return 'high';
    if (level > 40) return 'medium';
    return 'low';
  }

  private updateZoneStatus(): void {
    this.zones.forEach(zone => {
      const zoneSensors = zone.sensors.map(sensorId => 
        Array.from(this.sensors.values()).find(s => s.sensorId === sensorId)
      ).filter(Boolean);

      if (zoneSensors.length > 0) {
        const avgOccupancy = zoneSensors.reduce((sum, sensor) => 
          sum + (sensor?.lastReading?.occupancy || 0), 0
        ) / zoneSensors.length;

        // Mettre à jour le statut de la zone
        if (avgOccupancy > 90) zone.currentStatus = 'critical';
        else if (avgOccupancy > 70) zone.currentStatus = 'congested';
        else if (avgOccupancy > 50) zone.currentStatus = 'moderate';
        else zone.currentStatus = 'fluid';

                 // zone.updatedAt = new Date(); // Commenté car la propriété n'existe pas dans le type
      }
    });
  }

  private broadcastTrafficUpdate(readings: TrafficReading[]): void {
    const update = {
      type: 'traffic_update',
      data: {
        readings,
        zones: Array.from(this.zones.values()),
        timestamp: new Date()
      }
    };

    this.io.to('traffic').emit('traffic_update', update);
  }

  // Méthodes publiques pour l'API
  public async getTrafficReadings(filter?: TrafficFilter): Promise<TrafficReading[]> {
    let filteredReadings = [...this.readings];

    if (filter) {
      if (filter.zone) {
        const zone = Array.from(this.zones.values()).find(z => z.id === filter.zone);
        if (zone) {
          filteredReadings = filteredReadings.filter(reading => 
            zone.sensors.includes(reading.sensorId)
          );
        }
      }

      if (filter.sensorType) {
        filteredReadings = filteredReadings.filter(reading => {
          const sensor = this.sensors.get(reading.sensorId);
          return sensor?.type === filter.sensorType;
        });
      }

      if (filter.congestionLevel) {
        filteredReadings = filteredReadings.filter(reading => 
          reading.congestionLevel === filter.congestionLevel
        );
      }

      if (filter.startTime) {
        filteredReadings = filteredReadings.filter(reading => 
          reading.timestamp >= filter.startTime!
        );
      }

      if (filter.endTime) {
        filteredReadings = filteredReadings.filter(reading => 
          reading.timestamp <= filter.endTime!
        );
      }
    }

    return filteredReadings.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  public async getTrafficSensors(): Promise<TrafficSensor[]> {
    return Array.from(this.sensors.values());
  }

  public async getTrafficZones(): Promise<TrafficZone[]> {
    return Array.from(this.zones.values());
  }

  public async getTrafficStats(period: 'hour' | 'day' | 'week' | 'month'): Promise<TrafficStats> {
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

    const periodReadings = this.readings.filter(reading => 
      reading.timestamp >= startTime && reading.timestamp <= now
    );

    const totalVehicles = periodReadings.reduce((sum, reading) => sum + reading.vehicleCount, 0);
    const averageSpeed = periodReadings.length > 0 
      ? periodReadings.reduce((sum, reading) => sum + reading.averageSpeed, 0) / periodReadings.length 
      : 0;

    const congestionHours = periodReadings.filter(reading => 
      reading.congestionLevel === 'high' || reading.congestionLevel === 'critical'
    ).length;

    // Calculer les heures de pointe
    const hourlyStats = new Map<number, number>();
    periodReadings.forEach(reading => {
      const hour = reading.timestamp.getHours();
      hourlyStats.set(hour, (hourlyStats.get(hour) || 0) + reading.vehicleCount);
    });

    const peakHours = Array.from(hourlyStats.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => `${hour}:00`);

    // Statistiques par zone
    const zoneStats = Array.from(this.zones.values()).map(zone => {
      const zoneReadings = periodReadings.filter(reading => 
        zone.sensors.includes(reading.sensorId)
      );

      const vehicleCount = zoneReadings.reduce((sum, reading) => sum + reading.vehicleCount, 0);
      const avgSpeed = zoneReadings.length > 0 
        ? zoneReadings.reduce((sum, reading) => sum + reading.averageSpeed, 0) / zoneReadings.length 
        : 0;

      const congestionLevel = zone.currentStatus;

      return {
        zoneId: zone.id,
        zoneName: zone.name,
        vehicleCount,
        averageSpeed: avgSpeed,
        congestionLevel
      };
    });

    return {
      period,
      startTime,
      endTime: now,
      totalVehicles,
      averageSpeed,
      congestionHours,
      peakHours,
      zoneStats
    };
  }

  public async getSensorById(sensorId: string): Promise<TrafficSensor | null> {
    return this.sensors.get(sensorId) || null;
  }

  public async getZoneById(zoneId: string): Promise<TrafficZone | null> {
    return this.zones.get(zoneId) || null;
  }
}
