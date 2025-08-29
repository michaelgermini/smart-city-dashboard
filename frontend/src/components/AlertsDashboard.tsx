import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface Alert {
  alertId: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  status: string;
  startTime: string;
}

const AlertsDashboard: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.emit('join-alerts');

    newSocket.on('alert_update', (data) => {
      setAlerts(data.data.alerts);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'traffic': return '🚗';
      case 'parking': return '🅿️';
      case 'transport': return '🚌';
      case 'weather': return '🌧️';
      default: return '⚠️';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Dashboard Alertes - Genève
        </h1>
        <p className="text-gray-600">
          Surveillance des alertes et incidents en temps réel
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Alertes totales</div>
          <div className="text-2xl font-bold text-blue-600">{alerts.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Alertes actives</div>
          <div className="text-2xl font-bold text-green-600">
            {alerts.filter(alert => alert.status === 'active').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Alertes critiques</div>
          <div className="text-2xl font-bold text-red-600">
            {alerts.filter(alert => alert.severity === 'critical').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Alertes résolues</div>
          <div className="text-2xl font-bold text-purple-600">
            {alerts.filter(alert => alert.status === 'resolved').length}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Alertes récentes</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {alerts.slice(0, 10).map((alert) => (
            <div key={alert.alertId} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getTypeIcon(alert.type)}</span>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{alert.title}</h4>
                    <p className="text-sm text-gray-500">{alert.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(alert.severity)}`}>
                    {alert.severity}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(alert.startTime).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlertsDashboard;
