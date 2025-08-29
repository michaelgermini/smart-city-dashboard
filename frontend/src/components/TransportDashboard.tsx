import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { io, Socket } from 'socket.io-client';

interface TransportLine {
  lineId: string;
  name: string;
  type: string;
  status: string;
}

interface TransportVehicle {
  vehicleId: string;
  lineId: string;
  type: string;
  occupancy: number;
  speed: number;
  delay: number;
}

const TransportDashboard: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [lines, setLines] = useState<TransportLine[]>([]);
  const [vehicles, setVehicles] = useState<TransportVehicle[]>([]);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.emit('join-transport');

    newSocket.on('transport_update', (data) => {
      setLines(data.data.lines);
      setVehicles(data.data.vehicles);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const getTransportChartOption = () => {
    const lineNames = lines.map(line => line.name);
    const operationalLines = lines.filter(line => line.status === 'operational').length;
    const delayedLines = lines.filter(line => line.status === 'delayed').length;

    return {
      title: {
        text: 'État des lignes de transport',
        left: 'center'
      },
      tooltip: {
        trigger: 'item'
      },
      series: [
        {
          type: 'pie',
          radius: '50%',
          data: [
            { value: operationalLines, name: 'Opérationnelles', itemStyle: { color: '#10B981' } },
            { value: delayedLines, name: 'En retard', itemStyle: { color: '#F59E0B' } }
          ]
        }
      ]
    };
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Dashboard Transports - Genève
        </h1>
        <p className="text-gray-600">
          Surveillance des lignes TPG et des véhicules en temps réel
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <ReactECharts 
            option={getTransportChartOption()} 
            style={{ height: '400px' }}
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Véhicules en service</h3>
          <div className="text-3xl font-bold text-blue-600">{vehicles.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Lignes actives</div>
          <div className="text-2xl font-bold text-blue-600">{lines.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Véhicules en service</div>
          <div className="text-2xl font-bold text-green-600">{vehicles.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Lignes en retard</div>
          <div className="text-2xl font-bold text-orange-600">
            {lines.filter(line => line.status === 'delayed').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Occupation moyenne</div>
          <div className="text-2xl font-bold text-purple-600">
            {vehicles.length > 0 
              ? Math.round(vehicles.reduce((sum, vehicle) => sum + vehicle.occupancy, 0) / vehicles.length)
              : 0
            }%
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransportDashboard;
