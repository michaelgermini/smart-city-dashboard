import { Server } from 'socket.io';
import { Alert, AlertThreshold } from '../types';
import { logger } from '../utils/logger';

export class AlertService {
  private io: Server;
  private updateInterval: NodeJS.Timeout | null = null;
  private alerts: Map<string, Alert> = new Map();
  private thresholds: Map<string, AlertThreshold> = new Map();

  constructor(io: Server) {
    this.io = io;
    this.initializeData();
  }

  private initializeData(): void {
    // Initialiser les seuils d'alerte
    const defaultThresholds: AlertThreshold[] = [
      {
        id: 'threshold-001',
        type: 'traffic',
        metric: 'congestion_level',
        operator: 'gte',
        value: 80,
        severity: 'high',
        enabled: true,
        description: 'Congestion élevée détectée'
      },
      {
        id: 'threshold-002',
        type: 'parking',
        metric: 'occupancy_rate',
        operator: 'gte',
        value: 90,
        severity: 'medium',
        enabled: true,
        description: 'Parking presque plein'
      },
      {
        id: 'threshold-003',
        type: 'transport',
        metric: 'delay_minutes',
        operator: 'gte',
        value: 10,
        severity: 'high',
        enabled: true,
        description: 'Retard important sur les transports'
      }
    ];

    // Initialiser quelques alertes d'exemple
    const sampleAlerts: Alert[] = [
      {
        id: 'alert-001',
        alertId: 'ALERT_001',
        type: 'traffic',
        severity: 'high',
        title: 'Congestion sur le Pont du Mont-Blanc',
        description: 'Trafic dense détecté sur le Pont du Mont-Blanc. Temps de parcours estimé: 15 minutes.',
        location: {
          latitude: 46.2044,
          longitude: 6.1432,
          address: 'Pont du Mont-Blanc, Genève',
          zone: 'Centre-ville'
        },
        affectedAreas: ['Centre-ville', 'Pâquis'],
        startTime: new Date(Date.now() - 30 * 60 * 1000), // Il y a 30 minutes
        status: 'active',
        source: 'TrafficSensor_TRAFFIC_001',
        metadata: {
          congestionLevel: 'high',
          averageSpeed: 15,
          vehicleCount: 85
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'alert-002',
        alertId: 'ALERT_002',
        type: 'parking',
        severity: 'medium',
        title: 'Parking P+R Cornavin presque plein',
        description: 'Le parking P+R Cornavin atteint 95% de sa capacité.',
        location: {
          latitude: 46.2100,
          longitude: 6.1429,
          address: 'Place de Cornavin, 1201 Genève',
          zone: 'Centre-ville'
        },
        affectedAreas: ['Centre-ville'],
        startTime: new Date(Date.now() - 15 * 60 * 1000), // Il y a 15 minutes
        status: 'active',
        source: 'ParkingSensor_P+R_CORNOVIN',
        metadata: {
          occupancyRate: 95,
          availableSpots: 25
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Ajouter les seuils et alertes aux Maps
    defaultThresholds.forEach(threshold => this.thresholds.set(threshold.id, threshold));
    sampleAlerts.forEach(alert => this.alerts.set(alert.alertId, alert));
  }

  public startRealTimeUpdates(): void {
    this.updateInterval = setInterval(() => {
      this.checkThresholds();
      this.cleanupExpiredAlerts();
    }, 30000); // Vérification toutes les 30 secondes

    logger.info('AlertService: Real-time updates started');
  }

  public stopRealTimeUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      logger.info('AlertService: Real-time updates stopped');
    }
  }

  private checkThresholds(): void {
    // Cette méthode serait appelée avec des données réelles
    // Pour l'instant, on simule quelques vérifications
    const now = new Date();

    // Simuler une nouvelle alerte de trafic
    if (Math.random() < 0.1) { // 10% de chance
      this.createTrafficAlert(now);
    }

    // Simuler une nouvelle alerte de parking
    if (Math.random() < 0.05) { // 5% de chance
      this.createParkingAlert(now);
    }
  }

  private createTrafficAlert(timestamp: Date): void {
    const alertId = `ALERT_${Date.now()}`;
    const alert: Alert = {
      id: `alert-${Date.now()}`,
      alertId,
      type: 'traffic',
      severity: 'medium',
      title: 'Trafic dense détecté',
      description: 'Augmentation du trafic détectée sur un axe principal.',
      location: {
        latitude: 46.2081,
        longitude: 6.1429,
        address: 'Autoroute A1 - Sortie Genève',
        zone: 'Périphérie'
      },
      affectedAreas: ['Périphérie'],
      startTime: timestamp,
      status: 'active',
      source: 'TrafficSensor_TRAFFIC_002',
      metadata: {
        congestionLevel: 'medium',
        averageSpeed: 35,
        vehicleCount: 65
      },
      createdAt: timestamp,
      updatedAt: timestamp
    };

    this.alerts.set(alertId, alert);
    this.broadcastAlertUpdate();
    logger.info(`New traffic alert created: ${alertId}`);
  }

  private createParkingAlert(timestamp: Date): void {
    const alertId = `ALERT_${Date.now()}`;
    const alert: Alert = {
      id: `alert-${Date.now()}`,
      alertId,
      type: 'parking',
      severity: 'low',
      title: 'Parking en cours de remplissage',
      description: 'Un parking approche de sa capacité maximale.',
      location: {
        latitude: 46.1950,
        longitude: 6.1500,
        address: 'Route de Chêne 120, 1224 Chêne-Bourg',
        zone: 'Chêne-Bourg'
      },
      affectedAreas: ['Chêne-Bourg'],
      startTime: timestamp,
      status: 'active',
      source: 'ParkingSensor_P+R_BERCHET',
      metadata: {
        occupancyRate: 85,
        availableSpots: 45
      },
      createdAt: timestamp,
      updatedAt: timestamp
    };

    this.alerts.set(alertId, alert);
    this.broadcastAlertUpdate();
    logger.info(`New parking alert created: ${alertId}`);
  }

  private cleanupExpiredAlerts(): void {
    const now = new Date();
    const expiredAlerts: string[] = [];

    this.alerts.forEach(alert => {
      // Marquer comme expiré si l'alerte a plus de 2 heures
      if (now.getTime() - alert.startTime.getTime() > 2 * 60 * 60 * 1000) {
        alert.status = 'expired';
        alert.updatedAt = now;
        expiredAlerts.push(alert.alertId);
      }
    });

    if (expiredAlerts.length > 0) {
      this.broadcastAlertUpdate();
      logger.info(`Marked ${expiredAlerts.length} alerts as expired`);
    }
  }

  private broadcastAlertUpdate(): void {
    const update = {
      type: 'alert_update',
      data: {
        alerts: Array.from(this.alerts.values()),
        timestamp: new Date()
      }
    };

    this.io.to('alerts').emit('alert_update', update);
  }

  // Méthodes publiques pour l'API
  public async getAlerts(filter?: {
    type?: string;
    severity?: string;
    status?: string;
    zone?: string;
  }): Promise<Alert[]> {
    let filteredAlerts = Array.from(this.alerts.values());

    if (filter) {
      if (filter.type) {
        filteredAlerts = filteredAlerts.filter(alert => alert.type === filter.type);
      }

      if (filter.severity) {
        filteredAlerts = filteredAlerts.filter(alert => alert.severity === filter.severity);
      }

      if (filter.status) {
        filteredAlerts = filteredAlerts.filter(alert => alert.status === filter.status);
      }

      if (filter.zone) {
        filteredAlerts = filteredAlerts.filter(alert => alert.location.zone === filter.zone);
      }
    }

    return filteredAlerts.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  public async getActiveAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values())
      .filter(alert => alert.status === 'active')
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  public async getAlertById(alertId: string): Promise<Alert | null> {
    return this.alerts.get(alertId) || null;
  }

  public async getAlertThresholds(): Promise<AlertThreshold[]> {
    return Array.from(this.thresholds.values());
  }

  public async createAlert(alertData: Omit<Alert, 'id' | 'alertId' | 'createdAt' | 'updatedAt'>): Promise<Alert> {
    const alertId = `ALERT_${Date.now()}`;
    const now = new Date();

    const alert: Alert = {
      id: `alert-${Date.now()}`,
      alertId,
      ...alertData,
      createdAt: now,
      updatedAt: now
    };

    this.alerts.set(alertId, alert);
    this.broadcastAlertUpdate();

    logger.info(`Manual alert created: ${alertId}`);
    return alert;
  }

  public async updateAlertStatus(alertId: string, status: 'active' | 'resolved' | 'expired'): Promise<boolean> {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.status = status;
      alert.updatedAt = new Date();
      
      if (status === 'resolved') {
        alert.endTime = new Date();
      }

      this.broadcastAlertUpdate();
      logger.info(`Alert ${alertId} status updated to: ${status}`);
      return true;
    }
    return false;
  }

  public async deleteAlert(alertId: string): Promise<boolean> {
    const deleted = this.alerts.delete(alertId);
    if (deleted) {
      this.broadcastAlertUpdate();
      logger.info(`Alert ${alertId} deleted`);
    }
    return deleted;
  }

  public async getAlertStats(): Promise<{
    total: number;
    active: number;
    resolved: number;
    expired: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
  }> {
    const alerts = Array.from(this.alerts.values());
    
    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    alerts.forEach(alert => {
      byType[alert.type] = (byType[alert.type] || 0) + 1;
      bySeverity[alert.severity] = (bySeverity[alert.severity] || 0) + 1;
    });

    return {
      total: alerts.length,
      active: alerts.filter(a => a.status === 'active').length,
      resolved: alerts.filter(a => a.status === 'resolved').length,
      expired: alerts.filter(a => a.status === 'expired').length,
      byType,
      bySeverity
    };
  }

  public async updateThreshold(thresholdId: string, updates: Partial<AlertThreshold>): Promise<boolean> {
    const threshold = this.thresholds.get(thresholdId);
    if (threshold) {
      Object.assign(threshold, updates);
      logger.info(`Threshold ${thresholdId} updated`);
      return true;
    }
    return false;
  }
}
