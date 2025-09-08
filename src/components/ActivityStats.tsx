import React from 'react';
import {
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  TrendingUp,
  Users,
  Star,
  Zap,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { ActivityStats as ActivityStatsType } from '../types/activities';

interface ActivityStatsProps {
  stats: ActivityStatsType;
  className?: string;
  showCharts?: boolean;
}

const ActivityStats: React.FC<ActivityStatsProps> = ({
  stats,
  className = '',
  showCharts = false
}) => {
  const getProgressPercentage = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const getPriorityColor = (priority: 'high' | 'urgent') => {
    return priority === 'urgent' ? 'text-red-600' : 'text-orange-600';
  };

  const getStatusColor = (status: 'pending' | 'inProgress' | 'completed') => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'inProgress': return 'text-blue-600';
      case 'completed': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getDueDateColor = (type: 'overdue' | 'dueToday' | 'dueThisWeek') => {
    switch (type) {
      case 'overdue': return 'text-red-600';
      case 'dueToday': return 'text-orange-600';
      case 'dueThisWeek': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header das Estatísticas */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg mr-3">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          Estatísticas das Atividades
        </h3>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Concluídas</span>
          <div className="w-3 h-3 bg-blue-500 rounded-full ml-3"></div>
          <span>Em Progresso</span>
          <div className="w-3 h-3 bg-yellow-500 rounded-full ml-3"></div>
          <span>Pendentes</span>
        </div>
      </div>

      {/* Grid de Estatísticas Principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total de Atividades */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-blue-700">{stats.total}</span>
          </div>
          <h4 className="text-sm font-medium text-blue-800 mt-2">Total de Atividades</h4>
          <div className="mt-2 text-xs text-blue-600">
            {stats.cards} tarefas • {stats.subtasks} subtarefas
          </div>
        </div>

        {/* Progresso Geral */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-green-500 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-green-700">
              {getProgressPercentage(stats.completed, stats.total)}%
            </span>
          </div>
          <h4 className="text-sm font-medium text-green-800 mt-2">Progresso Geral</h4>
          <div className="mt-2 text-xs text-green-600">
            {stats.completed} de {stats.total} concluídas
          </div>
        </div>

        {/* Atividades em Progresso */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-orange-500 rounded-lg">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-orange-700">{stats.inProgress}</span>
          </div>
          <h4 className="text-sm font-medium text-orange-800 mt-2">Em Progresso</h4>
          <div className="mt-2 text-xs text-orange-600">
            {getProgressPercentage(stats.inProgress, stats.total)}% do total
          </div>
        </div>

        {/* Atividades Pendentes */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-yellow-500 rounded-lg">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-yellow-700">{stats.pending}</span>
          </div>
          <h4 className="text-sm font-medium text-yellow-800 mt-2">Pendentes</h4>
          <div className="mt-2 text-xs text-yellow-600">
            {getProgressPercentage(stats.pending, stats.total)}% do total
          </div>
        </div>
      </div>

      {/* Estatísticas Detalhadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status das Atividades */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mr-3">
              <PieChart className="w-4 h-4 text-white" />
            </div>
            Status das Atividades
          </h4>
          
          <div className="space-y-4">
            {/* Barra de Progresso Geral */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progresso Geral</span>
                <span className="font-medium text-gray-800">
                  {getProgressPercentage(stats.completed, stats.total)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${getProgressPercentage(stats.completed, stats.total)}%` }}
                ></div>
              </div>
            </div>

            {/* Distribuição por Status */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Concluídas</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-800">{stats.completed}</span>
                  <span className="text-xs text-gray-500">
                    ({getProgressPercentage(stats.completed, stats.total)}%)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Em Progresso</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-800">{stats.inProgress}</span>
                  <span className="text-xs text-gray-500">
                    ({getProgressPercentage(stats.inProgress, stats.total)}%)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Pendentes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-800">{stats.pending}</span>
                  <span className="text-xs text-gray-500">
                    ({getProgressPercentage(stats.pending, stats.total)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Prioridades e Prazos */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg mr-3">
              <Star className="w-4 h-4 text-white" />
            </div>
            Prioridades e Prazos
          </h4>
          
          <div className="space-y-4">
            {/* Atividades de Alta Prioridade */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Alta Prioridade</span>
                </div>
                <span className={`text-sm font-medium ${getPriorityColor('high')}`}>
                  {stats.highPriority}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                  <span className="text-sm text-gray-700">Urgente</span>
                </div>
                <span className={`text-sm font-medium ${getPriorityColor('urgent')}`}>
                  {stats.urgent}
                </span>
              </div>
            </div>

            {/* Prazos */}
            <div className="pt-3 border-t border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-gray-700">Atrasadas</span>
                </div>
                <span className="text-sm font-medium text-red-600">{stats.overdue}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-gray-700">Vencem Hoje</span>
                </div>
                <span className="text-sm font-medium text-orange-600">{stats.dueToday}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-700">Esta Semana</span>
                </div>
                <span className="text-sm font-medium text-blue-600">{stats.dueThisWeek}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resumo Executivo */}
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-6 rounded-xl border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg mr-3">
            <Activity className="w-4 h-4 text-white" />
          </div>
          Resumo Executivo
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {getProgressPercentage(stats.completed, stats.total)}%
            </div>
            <div className="text-sm text-gray-600">Taxa de Conclusão</div>
          </div>
          
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {stats.total > 0 ? Math.round(stats.total / 7) : 0}
            </div>
            <div className="text-sm text-gray-600">Média por Dia</div>
          </div>
          
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {stats.overdue > 0 ? '⚠️' : '✅'}
            </div>
            <div className="text-sm text-gray-600">
              {stats.overdue > 0 ? `${stats.overdue} Atrasadas` : 'Em Dia'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityStats;
