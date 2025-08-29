import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  TruckIcon, 
  BuildingOfficeIcon, 
  BusIcon, 
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Vue d\'ensemble', href: '/', icon: HomeIcon },
  { name: 'Trafic', href: '/traffic', icon: TruckIcon },
  { name: 'Stationnement', href: '/parking', icon: BuildingOfficeIcon },
  { name: 'Transports', href: '/transport', icon: BusIcon },
  { name: 'Alertes', href: '/alerts', icon: ExclamationTriangleIcon },
];

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col w-64 bg-white shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-center h-16 px-4 bg-blue-600">
        <h1 className="text-xl font-bold text-white">
          Smart City Genève
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          © 2024 Ville de Genève
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
