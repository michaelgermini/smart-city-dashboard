import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { io, Socket } from 'socket.io-client';
import DataSourcesStatus from './DataSourcesStatus';

const OverviewDashboard: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [trafficData, setTrafficData] = useState<any[]>([]);
  const [parkingData, setParkingData] = useState<any[]>([]);
  const [transportData, setTransportData] = useState<any[]>([]);
  const [alertsData, setAlertsData] = useState<any[]>([]);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.emit('join-traffic');
    newSocket.emit('join-parking');
    newSocket.emit('join-transport');
    newSocket.emit('join-alerts');

    newSocket.on('traffic_update', (data) => {
      setTrafficData(data.data.readings || []);
    });

    newSocket.on('parking_update', (data) => {
      setParkingData(data.data.parkingLots || []);
    });

    newSocket.on('transport_update', (data) => {
      setTransportData(data.data.vehicles || []);
    });

    newSocket.on('alert_update', (data) => {
      setAlertsData(data.data.alerts || []);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const getOverviewChartOption = () => {
    const categories = ['Trafic', 'Stationnement', 'Transports', 'Alertes'];
    const values = [
      trafficData.length > 0 ? Math.round(trafficData.reduce((sum, reading) => sum + reading.flowRate, 0) / trafficData.length) : 0,
      parkingData.length > 0 ? Math.round((parkingData.reduce((sum, lot) => sum + (lot.capacity.total - lot.capacity.available), 0) / parkingData.reduce((sum, lot) => sum + lot.capacity.total, 0)) * 100) : 0,
      transportData.length > 0 ? Math.round(transportData.reduce((sum, vehicle) => sum + vehicle.occupancy, 0) / transportData.length) : 0,
      alertsData.filter(alert => alert.status === 'active').length
    ];

    return {
      title: {
        text: 'Vue d\'ensemble - Smart City Genève',
        left: 'center',
        textStyle: {
          fontSize: 18,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: {
          rotate: 45
        }
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          type: 'bar',
          data: values,
          itemStyle: {
            color: function(params: any) {
              const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
              return colors[params.dataIndex];
            }
          }
        }
      ]
    };
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Smart City Genève - Vue d'ensemble
        </h1>
        <p className="text-gray-600">
          Plateforme de surveillance en temps réel de la mobilité urbaine
        </p>
      </div>

      {/* Statut des sources de données */}
      <DataSourcesStatus />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <ReactECharts 
            option={getOverviewChartOption()} 
            style={{ height: '400px' }}
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Statistiques en temps réel</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Capteurs de trafic actifs</span>
              <span className="font-semibold text-blue-600">5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Parkings surveillés</span>
              <span className="font-semibold text-green-600">{parkingData.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Véhicules en service</span>
              <span className="font-semibold text-orange-600">{transportData.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Alertes actives</span>
              <span className="font-semibold text-red-600">
                {alertsData.filter(alert => alert.status === 'active').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl mb-2">🚗</div>
          <div className="text-sm font-medium text-gray-500">Trafic</div>
          <div className="text-2xl font-bold text-blue-600">
            {trafficData.length > 0 
              ? Math.round(trafficData.reduce((sum, reading) => sum + reading.flowRate, 0) / trafficData.length)
              : 0
            } v/min
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl mb-2">🅿️</div>
          <div className="text-sm font-medium text-gray-500">Stationnement</div>
          <div className="text-2xl font-bold text-green-600">
            {parkingData.length > 0 
              ? Math.round((parkingData.reduce((sum, lot) => sum + (lot.capacity.total - lot.capacity.available), 0) / 
                           parkingData.reduce((sum, lot) => sum + lot.capacity.total, 0)) * 100)
              : 0
            }%
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl mb-2">🚌</div>
          <div className="text-sm font-medium text-gray-500">Transports</div>
          <div className="text-2xl font-bold text-orange-600">
            {transportData.length > 0 
              ? Math.round(transportData.reduce((sum, vehicle) => sum + vehicle.occupancy, 0) / transportData.length)
              : 0
            }%
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl mb-2">⚠️</div>
          <div className="text-sm font-medium text-gray-500">Alertes</div>
          <div className="text-2xl font-bold text-red-600">
            {alertsData.filter(alert => alert.status === 'active').length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewDashboard;
