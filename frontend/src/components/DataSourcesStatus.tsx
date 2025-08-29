import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface DataSourceStatus {
  status: 'success' | 'error' | 'no_data' | 'unknown';
  error?: string | null;
}

interface DataSourcesConfig {
  useRealData: boolean;
  sources: {
    tpg: { enabled: boolean; baseUrl: string; endpoints: string[] };
    parking: { enabled: boolean; baseUrl: string; dataset: string };
    traffic: { enabled: boolean; baseUrl: string; endpoint: string };
    weather: { enabled: boolean; baseUrl: string; endpoint: string; location: { lat: number; lon: number } };
  };
  updateIntervals: {
    traffic: number;
    parking: number;
    transport: number;
    weather: number;
  };
}

interface DataSourcesStatus {
  timestamp: string;
  environment: string;
  useRealData: boolean;
  sources: {
    tpg: DataSourceStatus;
    parking: DataSourceStatus;
    traffic: DataSourceStatus;
    weather: DataSourceStatus;
  };
}

const DataSourcesStatus: React.FC = () => {
  const [status, setStatus] = useState<DataSourcesStatus | null>(null);
  const [config, setConfig] = useState<DataSourcesConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const [statusResponse, configResponse] = await Promise.all([
        fetch('/api/datasources/status'),
        fetch('/api/datasources/config')
      ]);

      if (statusResponse.ok && configResponse.ok) {
        const statusData = await statusResponse.json();
        const configData = await configResponse.json();
        
        setStatus(statusData.data);
        setConfig(configData.data);
        setError(null);
      } else {
        setError('Erreur lors de la récupération du statut');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Rafraîchir toutes les 30 secondes
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'no_data':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success':
        return 'Connecté';
      case 'error':
        return 'Erreur';
      case 'no_data':
        return 'Aucune donnée';
      default:
        return 'Inconnu';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'no_data':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center">
          <ArrowPathIcon className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2">Chargement du statut des sources de données...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center text-red-600">
          <XCircleIcon className="w-6 h-6 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Sources de Données IoT
          </h3>
          <button
            onClick={fetchStatus}
            className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
          >
            <ArrowPathIcon className="w-4 h-4 mr-1" />
            Actualiser
          </button>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          Mode: {config?.useRealData ? 'Données Réelles' : 'Données Simulées'}
          {status && (
            <span className="ml-4">
              Dernière mise à jour: {new Date(status.timestamp).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* TPG */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">🚌 Transports Publics (TPG)</h4>
              {status && getStatusIcon(status.sources.tpg.status)}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Statut:</span>
                <span className={getStatusColor(status?.sources.tpg.status || 'unknown')}>
                  {status ? getStatusText(status.sources.tpg.status) : 'Inconnu'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>API:</span>
                <span className={config?.sources.tpg.enabled ? 'text-green-600' : 'text-red-600'}>
                  {config?.sources.tpg.enabled ? 'Configurée' : 'Non configurée'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Mise à jour:</span>
                <span>{config?.updateIntervals.transport ? `${config.updateIntervals.transport / 1000}s` : '-'}</span>
              </div>
              {status?.sources.tpg.error && (
                <div className="text-red-600 text-xs mt-2">
                  Erreur: {status.sources.tpg.error}
                </div>
              )}
            </div>
          </div>

          {/* Stationnement */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">🚗 Stationnement</h4>
              {status && getStatusIcon(status.sources.parking.status)}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Statut:</span>
                <span className={getStatusColor(status?.sources.parking.status || 'unknown')}>
                  {status ? getStatusText(status.sources.parking.status) : 'Inconnu'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>API:</span>
                <span className={config?.sources.parking.enabled ? 'text-green-600' : 'text-red-600'}>
                  {config?.sources.parking.enabled ? 'Configurée' : 'Non configurée'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Mise à jour:</span>
                <span>{config?.updateIntervals.parking ? `${config.updateIntervals.parking / 1000}s` : '-'}</span>
              </div>
              {status?.sources.parking.error && (
                <div className="text-red-600 text-xs mt-2">
                  Erreur: {status.sources.parking.error}
                </div>
              )}
            </div>
          </div>

          {/* Trafic */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">🚦 Capteurs de Trafic</h4>
              {status && getStatusIcon(status.sources.traffic.status)}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Statut:</span>
                <span className={getStatusColor(status?.sources.traffic.status || 'unknown')}>
                  {status ? getStatusText(status.sources.traffic.status) : 'Inconnu'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>API:</span>
                <span className={config?.sources.traffic.enabled ? 'text-green-600' : 'text-red-600'}>
                  {config?.sources.traffic.enabled ? 'Configurée' : 'Non configurée'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Mise à jour:</span>
                <span>{config?.updateIntervals.traffic ? `${config.updateIntervals.traffic / 1000}s` : '-'}</span>
              </div>
              {status?.sources.traffic.error && (
                <div className="text-red-600 text-xs mt-2">
                  Erreur: {status.sources.traffic.error}
                </div>
              )}
            </div>
          </div>

          {/* Météo */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">🌤️ Données Météo</h4>
              {status && getStatusIcon(status.sources.weather.status)}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Statut:</span>
                <span className={getStatusColor(status?.sources.weather.status || 'unknown')}>
                  {status ? getStatusText(status.sources.weather.status) : 'Inconnu'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>API:</span>
                <span className={config?.sources.weather.enabled ? 'text-green-600' : 'text-red-600'}>
                  {config?.sources.weather.enabled ? 'Configurée' : 'Non configurée'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Mise à jour:</span>
                <span>{config?.updateIntervals.weather ? `${config.updateIntervals.weather / 1000}s` : '-'}</span>
              </div>
              {status?.sources.weather.error && (
                <div className="text-red-600 text-xs mt-2">
                  Erreur: {status.sources.weather.error}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Informations supplémentaires */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h5 className="font-medium text-blue-900 mb-2">ℹ️ Informations</h5>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• Les données simulées sont utilisées par défaut pour le développement</p>
            <p>• Activez les données réelles en configurant USE_REAL_DATA=true dans votre .env</p>
            <p>• Les erreurs de connexion déclenchent automatiquement le fallback vers les données simulées</p>
            <p>• Consultez la documentation pour configurer les clés API</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSourcesStatus;
