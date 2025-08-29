import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { io, Socket } from 'socket.io-client';

interface TrafficReading {
  id: string;
  sensorId: string;
  timestamp: string;
  vehicleCount: number;
  averageSpeed: number;
  congestionLevel: string;
  flowRate: number;
  occupancy: number;
}

interface TrafficZone {
  id: string;
  name: string;
  currentStatus: string;
}

const TrafficDashboard: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [trafficData, setTrafficData] = useState<TrafficReading[]>([]);
  const [zones, setZones] = useState<TrafficZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<string>('all');

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.emit('join-traffic');

    newSocket.on('traffic_update', (data) => {
      setTrafficData(prev => [...prev, ...data.data.readings].slice(-100));
      setZones(data.data.zones);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  // Configuration du graphique de trafic en temps réel
  const getTrafficChartOption = () => {
    const times = trafficData.map(reading => new Date(reading.timestamp).toLocaleTimeString());
    const flowRates = trafficData.map(reading => reading.flowRate);
    const speeds = trafficData.map(reading => reading.averageSpeed);

    return {
      title: {
        text: 'Trafic en temps réel - Genève',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      legend: {
        data: ['Flux (véhicules/min)', 'Vitesse moyenne (km/h)'],
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
        data: times,
        axisLabel: {
          rotate: 45
        }
      },
      yAxis: [
        {
          type: 'value',
          name: 'Flux (véhicules/min)',
          position: 'left',
          axisLabel: {
            formatter: '{value}'
          }
        },
        {
          type: 'value',
          name: 'Vitesse (km/h)',
          position: 'right',
          axisLabel: {
            formatter: '{value}'
          }
        }
      ],
      series: [
        {
          name: 'Flux (véhicules/min)',
          type: 'line',
          data: flowRates,
          smooth: true,
          lineStyle: {
            color: '#3B82F6'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
                { offset: 1, color: 'rgba(59, 130, 246, 0.1)' }
              ]
            }
          },
          markLine: {
            data: [
              { yAxis: 80, name: 'Seuil de saturation' }
            ],
            lineStyle: {
              color: '#EF4444',
              type: 'dashed'
            }
          }
        },
        {
          name: 'Vitesse moyenne (km/h)',
          type: 'line',
          yAxisIndex: 1,
          data: speeds,
          smooth: true,
          lineStyle: {
            color: '#10B981'
          }
        }
      ]
    };
  };

  // Configuration du graphique de statut des zones
  const getZoneStatusOption = () => {
    const zoneNames = zones.map(zone => zone.name);
    const statusColors = zones.map(zone => {
      switch (zone.currentStatus) {
        case 'fluid': return '#10B981';
        case 'moderate': return '#F59E0B';
        case 'congested': return '#F97316';
        case 'critical': return '#EF4444';
        default: return '#6B7280';
      }
    });

    return {
      title: {
        text: 'Statut des zones de trafic',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      series: [
        {
          type: 'pie',
          radius: '50%',
          data: zones.map((zone, index) => ({
            value: 1,
            name: zone.name,
            itemStyle: {
              color: statusColors[index]
            }
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
  };

  // Configuration du graphique de congestion
  const getCongestionGaugeOption = () => {
    const totalReadings = trafficData.length;
    if (totalReadings === 0) return {};

    const criticalReadings = trafficData.filter(reading => reading.congestionLevel === 'critical').length;
    const highReadings = trafficData.filter(reading => reading.congestionLevel === 'high').length;
    const congestionPercentage = ((criticalReadings + highReadings) / totalReadings) * 100;

    return {
      title: {
        text: 'Niveau de congestion global',
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
              value: Math.round(congestionPercentage),
              name: 'Congestion'
            }
          ]
        }
      ]
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Dashboard Trafic - Genève
        </h1>
        <p className="text-gray-600">
          Surveillance en temps réel du trafic routier et des flux de mobilité
        </p>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique de trafic en temps réel */}
        <div className="bg-white rounded-lg shadow p-6">
          <ReactECharts 
            option={getTrafficChartOption()} 
            style={{ height: '400px' }}
          />
        </div>

        {/* Statut des zones */}
        <div className="bg-white rounded-lg shadow p-6">
          <ReactECharts 
            option={getZoneStatusOption()} 
            style={{ height: '400px' }}
          />
        </div>
      </div>

      {/* Gauge de congestion */}
      <div className="bg-white rounded-lg shadow p-6">
        <ReactECharts 
          option={getCongestionGaugeOption()} 
          style={{ height: '300px' }}
        />
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Capteurs actifs</div>
          <div className="text-2xl font-bold text-blue-600">5</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Zones surveillées</div>
          <div className="text-2xl font-bold text-green-600">2</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Flux moyen</div>
          <div className="text-2xl font-bold text-orange-600">
            {trafficData.length > 0 
              ? Math.round(trafficData.reduce((sum, reading) => sum + reading.flowRate, 0) / trafficData.length)
              : 0
            } v/min
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Vitesse moyenne</div>
          <div className="text-2xl font-bold text-purple-600">
            {trafficData.length > 0 
              ? Math.round(trafficData.reduce((sum, reading) => sum + reading.averageSpeed, 0) / trafficData.length)
              : 0
            } km/h
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficDashboard;
