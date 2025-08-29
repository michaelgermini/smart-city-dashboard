import { DataConnectorManager } from '../services/DataConnectors';
import { logger } from './logger';

export class DataSourceTester {
  private dataConnector: DataConnectorManager;

  constructor() {
    this.dataConnector = new DataConnectorManager();
  }

  async testAllDataSources(): Promise<void> {
    console.log('🔍 Test de connectivité aux sources de données IoT de Genève\n');

    await this.testTPGData();
    await this.testParkingData();
    await this.testTrafficData();
    await this.testWeatherData();
  }

  private async testTPGData(): Promise<void> {
    console.log('🚌 Test des données TPG...');
    try {
      const tpgData = await this.dataConnector.fetchTPGData();
      if (tpgData) {
        console.log(`✅ TPG: ${tpgData.vehicles?.length || 0} véhicules, ${tpgData.stops?.length || 0} arrêts`);
      } else {
        console.log('⚠️  TPG: Aucune donnée récupérée (utilisation des données simulées)');
      }
    } catch (error) {
      console.log(`❌ TPG: Erreur - ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
    console.log('');
  }

  private async testParkingData(): Promise<void> {
    console.log('🚗 Test des données de stationnement...');
    try {
      const parkingData = await this.dataConnector.fetchParkingData();
      if (parkingData && parkingData.length > 0) {
        console.log(`✅ Stationnement: ${parkingData.length} parkings récupérés`);
        const totalSpaces = parkingData.reduce((sum, parking) => sum + parking.totalSpaces, 0);
        const availableSpaces = parkingData.reduce((sum, parking) => sum + parking.availableSpaces, 0);
        console.log(`   📊 Total: ${totalSpaces} places, Disponibles: ${availableSpaces} places`);
      } else {
        console.log('⚠️  Stationnement: Aucune donnée récupérée (utilisation des données simulées)');
      }
    } catch (error) {
      console.log(`❌ Stationnement: Erreur - ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
    console.log('');
  }

  private async testTrafficData(): Promise<void> {
    console.log('🚦 Test des données de trafic...');
    try {
      const trafficData = await this.dataConnector.fetchTrafficData();
      if (trafficData && trafficData.length > 0) {
        console.log(`✅ Trafic: ${trafficData.length} capteurs récupérés`);
        const avgCongestion = trafficData.reduce((sum, sensor) => sum + sensor.congestionLevel, 0) / trafficData.length;
        console.log(`   📊 Congestion moyenne: ${avgCongestion.toFixed(1)}%`);
      } else {
        console.log('⚠️  Trafic: Aucune donnée récupérée (utilisation des données simulées)');
      }
    } catch (error) {
      console.log(`❌ Trafic: Erreur - ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
    console.log('');
  }

  private async testWeatherData(): Promise<void> {
    console.log('🌤️  Test des données météo...');
    try {
      const weatherData = await this.dataConnector.fetchWeatherData();
      if (weatherData) {
        console.log(`✅ Météo: ${weatherData.temperature}°C, ${weatherData.conditions}`);
        console.log(`   📊 Humidité: ${weatherData.humidity}%, Vent: ${weatherData.windSpeed} km/h`);
      } else {
        console.log('⚠️  Météo: Aucune donnée récupérée');
      }
    } catch (error) {
      console.log(`❌ Météo: Erreur - ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
    console.log('');
  }

  async testSpecificSource(source: 'tpg' | 'parking' | 'traffic' | 'weather'): Promise<void> {
    console.log(`🔍 Test de la source: ${source.toUpperCase()}\n`);

    switch (source) {
      case 'tpg':
        await this.testTPGData();
        break;
      case 'parking':
        await this.testParkingData();
        break;
      case 'traffic':
        await this.testTrafficData();
        break;
      case 'weather':
        await this.testWeatherData();
        break;
      default:
        console.log('❌ Source inconnue');
    }
  }

  async generateTestReport(): Promise<string> {
    const report = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      useRealData: process.env.USE_REAL_DATA === 'true',
      sources: {
        tpg: { status: 'unknown', error: null },
        parking: { status: 'unknown', error: null },
        traffic: { status: 'unknown', error: null },
        weather: { status: 'unknown', error: null }
      }
    };

    // Test TPG
    try {
      const tpgData = await this.dataConnector.fetchTPGData();
      report.sources.tpg.status = tpgData ? 'success' : 'no_data';
    } catch (error) {
      report.sources.tpg.status = 'error';
      report.sources.tpg.error = error instanceof Error ? error.message : 'Erreur inconnue';
    }

    // Test Parking
    try {
      const parkingData = await this.dataConnector.fetchParkingData();
      report.sources.parking.status = parkingData && parkingData.length > 0 ? 'success' : 'no_data';
    } catch (error) {
      report.sources.parking.status = 'error';
      report.sources.parking.error = error instanceof Error ? error.message : 'Erreur inconnue';
    }

    // Test Traffic
    try {
      const trafficData = await this.dataConnector.fetchTrafficData();
      report.sources.traffic.status = trafficData && trafficData.length > 0 ? 'success' : 'no_data';
    } catch (error) {
      report.sources.traffic.status = 'error';
      report.sources.traffic.error = error instanceof Error ? error.message : 'Erreur inconnue';
    }

    // Test Weather
    try {
      const weatherData = await this.dataConnector.fetchWeatherData();
      report.sources.weather.status = weatherData ? 'success' : 'no_data';
    } catch (error) {
      report.sources.weather.status = 'error';
      report.sources.weather.error = error instanceof Error ? error.message : 'Erreur inconnue';
    }

    return JSON.stringify(report, null, 2);
  }
}

// Script de test autonome
if (require.main === module) {
  const tester = new DataSourceTester();
  
  const source = process.argv[2];
  if (source) {
    tester.testSpecificSource(source as any);
  } else {
    tester.testAllDataSources();
  }
}
