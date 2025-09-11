import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/database';
import {
  BarChart3,
  Calendar,
  Users,
  Tag,
  Archive,
  TrendingUp,
  Clock,
  CheckCircle,
  X,
  AlertCircle
} from 'lucide-react';

interface ArchiveStatsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StatsData {
  totalArchived: number;
  archivedThisMonth: number;
  archivedThisWeek: number;
  byBoard: { [key: string]: number };
  byMember: { [key: string]: number };
  byPriority: { [key: string]: number };
  byMonth: { [key: string]: number };
  averageArchiveTime: number;
  mostActiveBoard: string;
  mostActiveMember: string;
}

const ArchiveStats: React.FC<ArchiveStatsProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year' | 'all'>('month');

  useEffect(() => {
    if (isOpen) {
      loadStats();
    }
  }, [isOpen, timeRange]);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Buscar todos os cards arquivados
      const archivedCards = await db.getArchivedCards();
      
      // Calcular estatísticas
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const filteredCards = archivedCards.filter(card => {
        const archivedDate = new Date(card.archived_at);
        switch (timeRange) {
          case 'week':
            return archivedDate >= thisWeek;
          case 'month':
            return archivedDate >= thisMonth;
          case 'year':
            return archivedDate >= new Date(now.getFullYear(), 0, 1);
          default:
            return true;
        }
      });

      const statsData: StatsData = {
        totalArchived: filteredCards.length,
        archivedThisMonth: archivedCards.filter(card => 
          new Date(card.archived_at) >= thisMonth
        ).length,
        archivedThisWeek: archivedCards.filter(card => 
          new Date(card.archived_at) >= thisWeek
        ).length,
        byBoard: {},
        byMember: {},
        byPriority: {},
        byMonth: {},
        averageArchiveTime: 0,
        mostActiveBoard: '',
        mostActiveMember: ''
      };

      // Agrupar por board
      filteredCards.forEach(card => {
        const board = card.board_name || 'Sem Board';
        statsData.byBoard[board] = (statsData.byBoard[board] || 0) + 1;
      });

      // Agrupar por membro
      filteredCards.forEach(card => {
        const member = card.archived_by_name || card.archived_by_username || 'Sistema';
        statsData.byMember[member] = (statsData.byMember[member] || 0) + 1;
      });

      // Agrupar por prioridade
      filteredCards.forEach(card => {
        const priority = card.priority || 'medium';
        statsData.byPriority[priority] = (statsData.byPriority[priority] || 0) + 1;
      });

      // Agrupar por mês
      filteredCards.forEach(card => {
        const date = new Date(card.archived_at);
        const monthKey = date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'short' });
        statsData.byMonth[monthKey] = (statsData.byMonth[monthKey] || 0) + 1;
      });

      // Calcular tempo médio de arquivamento
      const cardsWithTimes = filteredCards.filter(card => 
        card.completed_at && card.archived_at
      );
      
      if (cardsWithTimes.length > 0) {
        const totalTime = cardsWithTimes.reduce((sum, card) => {
          const completed = new Date(card.completed_at).getTime();
          const archived = new Date(card.archived_at).getTime();
          return sum + (archived - completed);
        }, 0);
        
        statsData.averageArchiveTime = totalTime / cardsWithTimes.length / (1000 * 60 * 60 * 24); // em dias
      }

      // Encontrar board e membro mais ativos
      statsData.mostActiveBoard = Object.entries(statsData.byBoard)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';
      
      statsData.mostActiveMember = Object.entries(statsData.byMember)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return 'Normal';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Estatísticas do Arquivo</h2>
                <p className="text-indigo-100 text-sm">
                  Análise detalhada dos cards arquivados
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="week">Última semana</option>
                <option value="month">Último mês</option>
                <option value="year">Último ano</option>
                <option value="all">Todo o período</option>
              </select>
              <button
                onClick={onClose}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-gray-600">Carregando estatísticas...</span>
            </div>
          ) : stats ? (
            <div className="space-y-6">
              {/* Cards de Resumo */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-xl text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Arquivados</p>
                      <p className="text-2xl font-bold">{stats.totalArchived}</p>
                    </div>
                    <Archive className="w-8 h-8 text-blue-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-xl text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Este Mês</p>
                      <p className="text-2xl font-bold">{stats.archivedThisMonth}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-green-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-xl text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Esta Semana</p>
                      <p className="text-2xl font-bold">{stats.archivedThisWeek}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-xl text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Tempo Médio</p>
                      <p className="text-2xl font-bold">{stats.averageArchiveTime.toFixed(1)}d</p>
                    </div>
                    <Clock className="w-8 h-8 text-orange-200" />
                  </div>
                </div>
              </div>

              {/* Gráficos e Distribuições */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Por Quadro */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Tag className="w-5 h-5 text-blue-600 mr-2" />
                    Por Quadro
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(stats.byBoard)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 5)
                      .map(([board, count]) => (
                        <div key={board} className="flex items-center justify-between">
                          <span className="text-gray-700 truncate">{board}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${(count / Math.max(...Object.values(stats.byBoard))) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900 w-8 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Por Membro */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Users className="w-5 h-5 text-green-600 mr-2" />
                    Por Membro
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(stats.byMember)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 5)
                      .map(([member, count]) => (
                        <div key={member} className="flex items-center justify-between">
                          <span className="text-gray-700 truncate">{member}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${(count / Math.max(...Object.values(stats.byMember))) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900 w-8 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Por Prioridade */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                    Por Prioridade
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(stats.byPriority)
                      .sort(([,a], [,b]) => b - a)
                      .map(([priority, count]) => (
                        <div key={priority} className="flex items-center justify-between">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(priority)}`}>
                            {getPriorityLabel(priority)}
                          </span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-yellow-600 h-2 rounded-full" 
                                style={{ width: `${(count / Math.max(...Object.values(stats.byPriority))) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900 w-8 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Por Mês */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 text-purple-600 mr-2" />
                    Por Mês
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(stats.byMonth)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .slice(-6)
                      .map(([month, count]) => (
                        <div key={month} className="flex items-center justify-between">
                          <span className="text-gray-700">{month}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-purple-600 h-2 rounded-full" 
                                style={{ width: `${(count / Math.max(...Object.values(stats.byMonth))) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900 w-8 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Insights */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 text-indigo-600 mr-2" />
                  Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Quadro Mais Ativo</h4>
                    <p className="text-gray-600">{stats.mostActiveBoard}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Membro Mais Ativo</h4>
                    <p className="text-gray-600">{stats.mostActiveMember}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma estatística disponível
              </h3>
              <p className="text-gray-600">
                Não há dados suficientes para gerar estatísticas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArchiveStats;
