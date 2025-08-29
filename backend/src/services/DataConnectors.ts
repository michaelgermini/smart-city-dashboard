import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';

// Interfaces pour les données externes
export interface TPGStop {
  stopId: string;
  stopName: string;
  latitude: number;
  longitude: number;
  lines: string[];
}

export interface TPGVehicle {
  vehicleId: string;
  lineId: string;
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
  occupancy: number;
  delay: number;
  nextStop: string;
  estimatedArrival: Date;
}

export interface GenevaParkingData {
  parkingId: string;
  name: string;
  totalSpaces: number;
  availableSpaces: number;
  occupancyRate: number;
  lastUpdate: Date;
}

export interface GenevaTrafficData {
  sensorId: string;
  location: string;
  vehicleCount: number;
  averageSpeed: number;
  congestionLevel: number;
  timestamp: Date;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  conditions: string;
  timestamp: Date;
}

// Classe de base pour les connecteurs de données
abstract class DataConnector {
  protected client: AxiosInstance;
  protected baseURL: string;
  protected apiKey?: string;

  constructor(baseURL: string, apiKey?: string) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {}
    });
  }

  abstract fetchData(): Promise<any>;
  abstract transformData(rawData: any): any;
}

// Connecteur pour l'API TPG (Transports Publics Genevois)
export class TPGConnector extends DataConnector {
  constructor() {
    super('https://api.tpg.ch/v1', process.env['TPG_API_KEY']);
  }

  async fetchData(): Promise<any> {
    try {
      // Récupérer les véhicules en temps réel
      const vehiclesResponse = await this.client.get('/vehicles');
      
      // Récupérer les informations sur les arrêts
      const stopsResponse = await this.client.get('/stops');
      
      // Récupérer les horaires en temps réel
      const schedulesResponse = await this.client.get('/schedules');

      return {
        vehicles: vehiclesResponse.data,
        stops: stopsResponse.data,
        schedules: schedulesResponse.data
      };
    } catch (error) {
      logger.error('Erreur lors de la récupération des données TPG:', error);
      throw error;
    }
  }

  transformData(rawData: any): { vehicles: TPGVehicle[], stops: TPGStop[] } {
    const vehicles: TPGVehicle[] = rawData.vehicles?.map((v: any) => ({
      vehicleId: v.vehicleId,
      lineId: v.lineId,
      latitude: v.latitude,
      longitude: v.longitude,
      heading: v.heading || 0,
      speed: v.speed || 0,
      occupancy: v.occupancy || 0,
      delay: v.delay || 0,
      nextStop: v.nextStop,
      estimatedArrival: new Date(v.estimatedArrival)
    })) || [];

    const stops: TPGStop[] = rawData.stops?.map((s: any) => ({
      stopId: s.stopId,
      stopName: s.stopName,
      latitude: s.latitude,
      longitude: s.longitude,
      lines: s.lines || []
    })) || [];

    return { vehicles, stops };
  }
}

// Connecteur pour les données de stationnement de Genève
export class GenevaParkingConnector extends DataConnector {
  constructor() {
    super('https://data.ge.ch/api', process.env['GENEVA_API_KEY']);
  }

  async fetchData(): Promise<any> {
    try {
      // Récupérer les données de stationnement depuis l'API open data de Genève
      const response = await this.client.get('/records/1.0/search/', {
        params: {
          dataset: 'parkings-publics',
          rows: 100,
          facet: ['nom', 'type']
        }
      });

      return response.data;
    } catch (error) {
      logger.error('Erreur lors de la récupération des données de stationnement:', error);
      throw error;
    }
  }

  transformData(rawData: any): GenevaParkingData[] {
    return rawData.records?.map((record: any) => ({
      parkingId: record.recordid,
      name: record.fields.nom,
      totalSpaces: record.fields.places_total || 0,
      availableSpaces: record.fields.places_disponibles || 0,
      occupancyRate: record.fields.taux_occupation || 0,
      lastUpdate: new Date(record.fields.last_update || Date.now())
    })) || [];
  }
}

// Connecteur pour les capteurs de trafic de Genève
export class GenevaTrafficConnector extends DataConnector {
  constructor() {
    super('https://api.traffic.geneva.ch', process.env['TRAFFIC_API_KEY']);
  }

  async fetchData(): Promise<any> {
    try {
      // Récupérer les données des capteurs de trafic
      const response = await this.client.get('/sensors/current');
      return response.data;
    } catch (error) {
      logger.error('Erreur lors de la récupération des données de trafic:', error);
      throw error;
    }
  }

  transformData(rawData: any): GenevaTrafficData[] {
    return rawData.sensors?.map((sensor: any) => ({
      sensorId: sensor.sensorId,
      location: sensor.location,
      vehicleCount: sensor.vehicleCount || 0,
      averageSpeed: sensor.averageSpeed || 0,
      congestionLevel: sensor.congestionLevel || 0,
      timestamp: new Date(sensor.timestamp)
    })) || [];
  }
}

// Connecteur pour les données météo
export class WeatherConnector extends DataConnector {
  constructor() {
    super('https://api.openweathermap.org/data/2.5', process.env['WEATHER_API_KEY']);
  }

  async fetchData(): Promise<any> {
    try {
      // Coordonnées de Genève
      const genevaLat = 46.2044;
      const genevaLon = 6.1432;
      
      const response = await this.client.get('/weather', {
        params: {
          lat: genevaLat,
          lon: genevaLon,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      return response.data;
    } catch (error) {
      logger.error('Erreur lors de la récupération des données météo:', error);
      throw error;
    }
  }

  transformData(rawData: any): WeatherData {
    return {
      temperature: rawData.main?.temp || 0,
      humidity: rawData.main?.humidity || 0,
      precipitation: rawData.rain?.['1h'] || 0,
      windSpeed: rawData.wind?.speed || 0,
      conditions: rawData.weather?.[0]?.main || 'Unknown',
      timestamp: new Date()
    };
  }
}

// Gestionnaire principal des connecteurs
export class DataConnectorManager {
  private tpgConnector: TPGConnector;
  private parkingConnector: GenevaParkingConnector;
  private trafficConnector: GenevaTrafficConnector;
  private weatherConnector: WeatherConnector;

  constructor() {
    this.tpgConnector = new TPGConnector();
    this.parkingConnector = new GenevaParkingConnector();
    this.trafficConnector = new GenevaTrafficConnector();
    this.weatherConnector = new WeatherConnector();
  }

  async fetchAllData() {
    try {
      const [tpgData, parkingData, trafficData, weatherData] = await Promise.allSettled([
        this.tpgConnector.fetchData().then(data => this.tpgConnector.transformData(data)),
        this.parkingConnector.fetchData().then(data => this.parkingConnector.transformData(data)),
        this.trafficConnector.fetchData().then(data => this.trafficConnector.transformData(data)),
        this.weatherConnector.fetchData().then(data => this.weatherConnector.transformData(data))
      ]);

      return {
        tpg: tpgData.status === 'fulfilled' ? tpgData.value : null,
        parking: parkingData.status === 'fulfilled' ? parkingData.value : null,
        traffic: trafficData.status === 'fulfilled' ? trafficData.value : null,
        weather: weatherData.status === 'fulfilled' ? weatherData.value : null,
        errors: {
          tpg: tpgData.status === 'rejected' ? tpgData.reason : null,
          parking: parkingData.status === 'rejected' ? parkingData.reason : null,
          traffic: trafficData.status === 'rejected' ? trafficData.reason : null,
          weather: weatherData.status === 'rejected' ? weatherData.reason : null
        }
      };
    } catch (error) {
      logger.error('Erreur lors de la récupération de toutes les données:', error);
      throw error;
    }
  }

  // Méthodes individuelles pour chaque type de données
  async fetchTPGData() {
    try {
      const rawData = await this.tpgConnector.fetchData();
      return this.tpgConnector.transformData(rawData);
    } catch (error) {
      logger.error('Erreur lors de la récupération des données TPG:', error);
      return null;
    }
  }

  async fetchParkingData() {
    try {
      const rawData = await this.parkingConnector.fetchData();
      return this.parkingConnector.transformData(rawData);
    } catch (error) {
      logger.error('Erreur lors de la récupération des données de stationnement:', error);
      return null;
    }
  }

  async fetchTrafficData() {
    try {
      const rawData = await this.trafficConnector.fetchData();
      return this.trafficConnector.transformData(rawData);
    } catch (error) {
      logger.error('Erreur lors de la récupération des données de trafic:', error);
      return null;
    }
  }

  async fetchWeatherData() {
    try {
      const rawData = await this.weatherConnector.fetchData();
      return this.weatherConnector.transformData(rawData);
    } catch (error) {
      logger.error('Erreur lors de la récupération des données météo:', error);
      return null;
    }
  }
}
