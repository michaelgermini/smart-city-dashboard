import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import TrafficDashboard from './TrafficDashboard';
import ParkingDashboard from './ParkingDashboard';
import TransportDashboard from './TransportDashboard';
import AlertsDashboard from './AlertsDashboard';
import OverviewDashboard from './OverviewDashboard';

const Dashboard: React.FC = () => {
  const location = useLocation();
  const [currentView, setCurrentView] = useState('overview');

  useEffect(() => {
    const path = location.pathname;
    if (path === '/traffic') setCurrentView('traffic');
    else if (path === '/parking') setCurrentView('parking');
    else if (path === '/transport') setCurrentView('transport');
    else if (path === '/alerts') setCurrentView('alerts');
    else setCurrentView('overview');
  }, [location]);

  const renderDashboard = () => {
    switch (currentView) {
      case 'traffic':
        return <TrafficDashboard />;
      case 'parking':
        return <ParkingDashboard />;
      case 'transport':
        return <TransportDashboard />;
      case 'alerts':
        return <AlertsDashboard />;
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <div className="h-full overflow-auto">
      <div className="p-6">
        {renderDashboard()}
      </div>
    </div>
  );
};

export default Dashboard;
