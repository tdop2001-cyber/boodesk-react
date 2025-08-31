import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../contexts/PermissionContext';
import {
  Home,
  Users,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Trello,
  MessageSquare,
  Coffee,
  Activity,
  FileText,
  UserPlus,
  Bell,
  HelpCircle,
  Zap,
  Database,
  Folder
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const { canAccessFeature } = usePermissions();
  const location = useLocation();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Menu Principal',
      icon: Home,
      path: '/dashboard',
      badge: undefined
    },
    {
      id: 'boards',
      label: 'Quadros Kanban',
      icon: Trello,
      path: '/boards',
      badge: undefined
    },
    {
      id: 'meetings',
      label: 'Reuniões',
      icon: Calendar,
      path: '/meetings',
      badge: undefined
    },
    {
      id: 'calendar',
      label: 'Calendário',
      icon: Calendar,
      path: '/calendar',
      badge: undefined
    },
    {
      id: 'pomodoro',
      label: 'Pomodoro',
      icon: Coffee,
      path: '/pomodoro',
      badge: undefined
    },
    {
      id: 'activities',
      label: 'Minhas Atividades',
      icon: Activity,
      path: '/activities',
      badge: undefined
    },
    {
      id: 'files',
      label: 'Arquivos',
      icon: Folder,
      path: '/files',
      badge: undefined
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: MessageSquare,
      path: '/chat',
      badge: undefined
    },
    {
      id: 'reports',
      label: 'Relatórios',
      icon: BarChart3,
      path: '/reports',
      badge: undefined
    },
    {
      id: 'users',
      label: 'Usuários',
      icon: Users,
      path: '/users',
      badge: undefined,
      adminOnly: true
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: Settings,
      path: '/settings',
      badge: undefined,
      adminOnly: true
    }
  ];

  const quickActions = [
    {
      id: 'quick-card',
      label: 'Novo Cartão',
      icon: FileText,
      action: () => console.log('Novo cartão')
    },
    {
      id: 'quick-meeting',
      label: 'Nova Reunião',
      icon: Calendar,
      action: () => console.log('Nova reunião')
    },
    {
      id: 'quick-pomodoro',
      label: 'Iniciar Pomodoro',
      icon: Coffee,
      action: () => console.log('Iniciar pomodoro')
    }
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const canAccess = (item: any) => {
    if (!item.adminOnly) return true;
    return canAccessFeature(item.feature || 'kanban-boards');
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={`bg-white dark:bg-gray-800 border-r border-brand-light-gray dark:border-gray-700 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-brand-light-gray dark:border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-brand-gray dark:text-gray-50">Boodesk</span>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-1 rounded-lg hover:bg-brand-light-gray dark:hover:bg-gray-700 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-brand-gray dark:text-gray-50" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-brand-gray dark:text-gray-50" />
            )}
          </button>
        </div>
      </div>

      {/* User Info */}
      {!isCollapsed && user && (
        <Link to="/profile" className="block">
          <div className="p-4 border-b border-brand-light-gray dark:border-gray-700 hover:bg-brand-light-gray/30 dark:hover:bg-gray-700/30 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-secondary rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-brand-gray dark:text-gray-50 truncate">
                  {user.username}
                </p>
                <p className="text-xs text-brand-gray/70 dark:text-gray-300 truncate">
                  {user.cargo}
                </p>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* User Info Collapsed */}
      {isCollapsed && user && (
        <Link to="/profile" className="block">
          <div className="p-4 border-b border-brand-light-gray dark:border-gray-700 hover:bg-brand-light-gray/30 dark:hover:bg-gray-700/30 transition-colors cursor-pointer">
            <div className="w-10 h-10 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto">
              <span className="text-white font-semibold text-sm">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </Link>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.filter(canAccess).map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`sidebar-item group ${
                isActive(item.path) ? 'active' : ''
              }`}
            >
              <Icon className={`w-5 h-5 ${
                isActive(item.path) ? 'text-white' : 'text-brand-gray dark:text-gray-50 group-hover:text-brand-red'
              }`} />
              {!isCollapsed && (
                <span className="ml-3 flex-1">{item.label}</span>
              )}
              {item.badge && !isCollapsed && (
                <span className="bg-brand-red text-white text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Quick Actions */}
      {!isCollapsed && (
        <div className="p-4 border-t border-brand-light-gray dark:border-gray-700">
          <h3 className="text-xs font-semibold text-brand-gray/70 dark:text-gray-300 uppercase tracking-wider mb-3">
            Ações Rápidas
          </h3>
          <div className="space-y-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={action.action}
                  className="sidebar-item w-full text-left"
                >
                  <Icon className="w-4 h-4 text-brand-gray dark:text-gray-50 group-hover:text-brand-red" />
                  <span className="ml-3 text-sm">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Database Setup Link */}
      {!isCollapsed && (
        <div className="p-4 border-t border-brand-light-gray dark:border-gray-700">
          <Link
            to="/database-setup"
            className={`sidebar-item group ${
              isActive('/database-setup') ? 'active' : ''
            }`}
          >
            <Database className={`w-5 h-5 ${
              isActive('/database-setup') ? 'text-white' : 'text-brand-gray dark:text-gray-50 group-hover:text-brand-red'
            }`} />
            <span className="ml-3 flex-1">Configurar Banco</span>
          </Link>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-brand-light-gray dark:border-gray-700">
        <div className="space-y-2">
          {/* Notifications */}
          <button className="sidebar-item w-full text-left">
            <Bell className="w-4 h-4 text-brand-gray dark:text-gray-50 group-hover:text-brand-red" />
            {!isCollapsed && <span className="ml-3 text-sm">Notificações</span>}
          </button>

          {/* Help */}
          <button className="sidebar-item w-full text-left">
            <HelpCircle className="w-4 h-4 text-brand-gray dark:text-gray-50 group-hover:text-brand-red" />
            {!isCollapsed && <span className="ml-3 text-sm">Ajuda</span>}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="sidebar-item w-full text-left text-brand-red hover:bg-brand-red hover:text-white"
          >
            <LogOut className="w-4 h-4" />
            {!isCollapsed && <span className="ml-3 text-sm">Sair</span>}
          </button>
        </div>

        {/* Version Info */}
        {!isCollapsed && (
          <div className="mt-4 pt-4 border-t border-brand-light-gray dark:border-gray-700">
            <p className="text-xs text-brand-gray/50 dark:text-gray-500 text-center">
              v1.0.0
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
