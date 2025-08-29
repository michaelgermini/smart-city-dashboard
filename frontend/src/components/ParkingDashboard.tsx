import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { io, Socket } from 'socket.io-client';

interface ParkingLot {
  lotId: string;
  name: string;
  type: string;
  capacity: {
    total: number;
    available: number;
    reserved: number;
  };
  status: string;
}

const ParkingDashboard: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.emit('join-parking');

    newSocket.on('parking_update', (data) => {
      setParkingLots(data.data.parkingLots);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const getParkingChartOption = () => {
    const lotNames = parkingLots.map(lot => lot.name);
    const availableSpots = parkingLots.map(lot => lot.capacity.available);
    const occupiedSpots = parkingLots.map(lot => lot.capacity.total - lot.capacity.available);

    return {
      title: {
        text: 'Disponibilité des parkings',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['Places disponibles', 'Places occupées'],
        top: 30
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: lotNames,
        axisLabel: {
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: 'Nombre de places'
      },
      series: [
        {
          name: 'Places disponibles',
          type: 'bar',
          data: availableSpots,
          itemStyle: {
            color: '#10B981'
          }
        },
        {
          name: 'Places occupées',
          type: 'bar',
          data: occupiedSpots,
          itemStyle: {
            color: '#EF4444'
          }
        }
      ]
    };
  };

  const getOccupancyGaugeOption = () => {
    const totalCapacity = parkingLots.reduce((sum, lot) => sum + lot.capacity.total, 0);
    const totalOccupied = parkingLots.reduce((sum, lot) => sum + (lot.capacity.total - lot.capacity.available), 0);
    const occupancyRate = totalCapacity > 0 ? (totalOccupied / totalCapacity) * 100 : 0;

    return {
      title: {
        text: 'Taux d\'occupation global',
        left: 'center'
      },
      series: [
        {
          type: 'gauge',
          progress: {
            show: true,
            width: 18
          },
          axisLine: {
            lineStyle: {
              width: 18
            }
          },
          axisTick: {
            show: false
          },
          splitLine: {
            length: 15,
            lineStyle: {
              width: 2,
              color: '#999'
            }
          },
          axisLabel: {
            distance: 25,
            color: '#999',
            fontSize: 12
          },
          anchor: {
            show: true,
            showAbove: true,
            size: 25,
            itemStyle: {
              borderWidth: 10
            }
          },
          title: {
            show: false
          },
          detail: {
            valueAnimation: true,
            fontSize: 30,
            offsetCenter: [0, '70%'],
            formatter: '{value}%'
          },
          data: [
            {
              value: Math.round(occupancyRate),
              name: 'Occupation'
            }
          ]
        }
      ]
    };
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Dashboard Stationnement - Genève
        </h1>
        <p className="text-gray-600">
          Surveillance des parkings P+R et publics en temps réel
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <ReactECharts 
            option={getParkingChartOption()} 
            style={{ height: '400px' }}
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <ReactECharts 
            option={getOccupancyGaugeOption()} 
            style={{ height: '400px' }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Parkings surveillés</div>
          <div className="text-2xl font-bold text-blue-600">{parkingLots.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Places totales</div>
          <div className="text-2xl font-bold text-green-600">
            {parkingLots.reduce((sum, lot) => sum + lot.capacity.total, 0)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Places disponibles</div>
          <div className="text-2xl font-bold text-orange-600">
            {parkingLots.reduce((sum, lot) => sum + lot.capacity.available, 0)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Taux d'occupation</div>
          <div className="text-2xl font-bold text-purple-600">
            {parkingLots.length > 0 
              ? Math.round((parkingLots.reduce((sum, lot) => sum + (lot.capacity.total - lot.capacity.available), 0) / 
                           parkingLots.reduce((sum, lot) => sum + lot.capacity.total, 0)) * 100)
              : 0
            }%
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingDashboard;
