// Types de base
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Types pour le trafic
export interface TrafficSensor extends BaseEntity {
  sensorId: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    zone: string;
  };
  type: 'loop' | 'radar' | 'camera';
  status: 'active' | 'inactive' | 'maintenance';
  lastReading?: TrafficReading;
}

export interface TrafficReading {
  id: string;
  sensorId: string;
  timestamp: Date;
  vehicleCount: number;
  averageSpeed: number;
  congestionLevel: 'low' | 'medium' | 'high' | 'critical';
  flowRate: number; // véhicules par minute
  occupancy: number; // pourcentage d'occupation
}

export interface TrafficZone {
  id: string;
  name: string;
  description: string;
  coordinates: Array<{ lat: number; lng: number }>;
  sensors: string[];
  congestionThreshold: number;
  currentStatus: 'fluid' | 'moderate' | 'congested' | 'critical';
}

// Types pour le stationnement
export interface ParkingLot extends BaseEntity {
  lotId: string;
  name: string;
  type: 'P+R' | 'public' | 'private' | 'street';
  location: {
    latitude: number;
    longitude: number;
    address: string;
    zone: string;
  };
  capacity: {
    total: number;
    available: number;
    reserved: number;
  };
  pricing: {
    hourly: number;
    daily: number;
    monthly: number;
  };
  status: 'open' | 'closed' | 'maintenance';
  lastUpdate: Date;
}

export interface ParkingSensor extends BaseEntity {
  sensorId: string;
  lotId: string;
  spotNumber: number;
  status: 'occupied' | 'available' | 'reserved' | 'maintenance';
  lastReading: Date;
}

// Types pour les transports publics
export interface TransportLine extends BaseEntity {
  lineId: string;
  name: string;
  type: 'bus' | 'tram' | 'train' | 'boat';
  operator: 'TPG' | 'CFF' | 'other';
  route: Array<{
    stationId: string;
    stationName: string;
    latitude: number;
    longitude: number;
    order: number;
  }>;
  status: 'operational' | 'delayed' | 'cancelled' | 'maintenance';
  frequency: number; // minutes
  lastUpdate: Date;
}

export interface TransportVehicle extends BaseEntity {
  vehicleId: string;
  lineId: string;
  type: 'bus' | 'tram' | 'train' | 'boat';
  currentLocation: {
    latitude: number;
    longitude: number;
    heading: number;
  };
  status: 'in_service' | 'out_of_service' | 'maintenance';
  occupancy: number; // pourcentage
  speed: number;
  nextStation: string;
  estimatedArrival: Date;
  delay: number; // minutes
}

export interface TransportStation extends BaseEntity {
  stationId: string;
  name: string;
  type: 'bus' | 'tram' | 'train' | 'boat';
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  lines: string[];
  facilities: string[];
  status: 'open' | 'closed' | 'maintenance';
}

// Types pour les alertes
export interface Alert extends BaseEntity {
  alertId: string;
  type: 'traffic' | 'parking' | 'transport' | 'weather' | 'event';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    zone: string;
  };
  affectedAreas: string[];
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'resolved' | 'expired';
  source: string;
  metadata?: Record<string, any>;
}

// Types pour les événements
export interface Event extends BaseEntity {
  eventId: string;
  name: string;
  description: string;
  type: 'festival' | 'sport' | 'cultural' | 'commercial' | 'other';
  location: {
    latitude: number;
    longitude: number;
    address: string;
    zone: string;
  };
  startDate: Date;
  endDate: Date;
  expectedAttendance: number;
  impactLevel: 'low' | 'medium' | 'high';
  affectedTransport: string[];
  affectedParking: string[];
}

// Types pour la météo
export interface WeatherData {
  timestamp: Date;
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  windDirection: number;
  visibility: number;
  conditions: string;
  impactOnTraffic: 'none' | 'low' | 'medium' | 'high';
}

// Types pour les statistiques
export interface TrafficStats {
  period: 'hour' | 'day' | 'week' | 'month';
  startTime: Date;
  endTime: Date;
  totalVehicles: number;
  averageSpeed: number;
  congestionHours: number;
  peakHours: string[];
  zoneStats: Array<{
    zoneId: string;
    zoneName: string;
    vehicleCount: number;
    averageSpeed: number;
    congestionLevel: string;
  }>;
}

export interface ParkingStats {
  period: 'hour' | 'day' | 'week' | 'month';
  startTime: Date;
  endTime: Date;
  totalOccupancy: number;
  averageOccupancy: number;
  turnoverRate: number;
  revenue: number;
  lotStats: Array<{
    lotId: string;
    lotName: string;
    occupancy: number;
    revenue: number;
    turnoverRate: number;
  }>;
}

export interface TransportStats {
  period: 'hour' | 'day' | 'week' | 'month';
  startTime: Date;
  endTime: Date;
  totalPassengers: number;
  averageDelay: number;
  onTimePercentage: number;
  lineStats: Array<{
    lineId: string;
    lineName: string;
    passengers: number;
    delay: number;
    onTimePercentage: number;
  }>;
}

// Types pour l'authentification
export interface User extends BaseEntity {
  userId: string;
  username: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
  permissions: string[];
  lastLogin?: Date;
  isActive: boolean;
}

export interface AuthToken {
  token: string;
  expiresAt: Date;
  userId: string;
}

// Types pour les réponses API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Types pour les WebSocket
export interface SocketMessage {
  type: string;
  data: any;
  timestamp: Date;
}

export interface RealTimeUpdate {
  type: 'traffic' | 'parking' | 'transport' | 'alert';
  data: any;
  timestamp: Date;
}

// Types pour les filtres
export interface TrafficFilter {
  zone?: string;
  sensorType?: string;
  congestionLevel?: string;
  startTime?: Date;
  endTime?: Date;
}

export interface ParkingFilter {
  lotType?: string;
  zone?: string;
  availability?: 'available' | 'occupied' | 'all';
  startTime?: Date;
  endTime?: Date;
}

export interface TransportFilter {
  lineType?: string;
  operator?: string;
  status?: string;
  startTime?: Date;
  endTime?: Date;
}

// Types pour les configurations
export interface SystemConfig {
  trafficUpdateInterval: number; // seconds
  parkingUpdateInterval: number; // seconds
  transportUpdateInterval: number; // seconds
  alertCheckInterval: number; // seconds
  dataRetentionDays: number;
  maxConnections: number;
  enableRealTimeUpdates: boolean;
}

// Types pour les seuils d'alerte
export interface AlertThreshold {
  id: string;
  type: 'traffic' | 'parking' | 'transport';
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  value: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  description: string;
}
