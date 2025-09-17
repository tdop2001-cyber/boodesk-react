import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../services/database';
import {
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Settings,
  BarChart3,
  RefreshCw,
  Zap,
  Database,
  Calendar,
  Users,
  Archive,
  X
} from 'lucide-react';

interface AutoArchiveMonitorProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SystemStatus {
  health_status: string;
  active_settings: number;
  pending_cards: number;
  last_execution: {
    executed_at: string;
    cards_archived: number;
    duration_ms: number;
  } | null;
  recommendations: string;
  checked_at: string;
}

interface DashboardData {
  system_name: string;
  status: string;
  total_settings: number;
  configured_boards: number;
  cards_ready_for_archive: number;
  successful_executions_24h: number;
  cards_archived_24h: number;
  last_successful_execution: string;
  health_status: SystemStatus;
}

const AutoArchiveMonitor: React.FC<AutoArchiveMonitorProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadDashboardData();
      loadExecutionLogs();
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh && isOpen) {
      interval = setInterval(() => {
        loadDashboardData();
        loadExecutionLogs();
      }, 30000); // Atualizar a cada 30 segundos
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, isOpen]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Buscar dados do dashboard
      const { data: dashboard, error: dashboardError } = await supabase
        .from('archive_dashboard')
        .select('*')
        .single();

      if (dashboardError) throw dashboardError;

      setDashboardData(dashboard);

      // Buscar status de saúde
      const { data: health, error: healthError } = await supabase
        .rpc('check_archive_system_health');

      if (healthError) throw healthError;

      setSystemStatus(health);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      addToast({
        type: 'error',
        title: 'Erro ao carregar dados',
        message: 'Não foi possível carregar os dados do sistema.'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadExecutionLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('archive_execution_log')
        .select('*')
        .order('executed_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setExecutionLogs(data || []);
    } catch (error) {
      console.error('Erro ao carregar logs de execução:', error);
    }
  };

  const executeManualArchive = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .rpc('cron_auto_archive');

      if (error) throw error;

      addToast({
        type: 'success',
        title: 'Arquivamento executado',
        message: 'Arquivamento automático foi executado com sucesso!'
      });

      // Recarregar dados
      await loadDashboardData();
      await loadExecutionLogs();
    } catch (error) {
      console.error('Erro ao executar arquivamento:', error);
      addToast({
        type: 'error',
        title: 'Erro ao executar',
        message: 'Não foi possível executar o arquivamento automático.'
      });
    } finally {
      setLoading(false);
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200';
      case 'inactive': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'stale': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'overloaded': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5" />;
      case 'inactive': return <Pause className="w-5 h-5" />;
      case 'stale': return <AlertCircle className="w-5 h-5" />;
      case 'overloaded': return <AlertCircle className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Monitor de Arquivamento Automático</h2>
                <p className="text-emerald-100 text-sm">
                  Sistema de arquivamento contínuo e monitoramento em tempo real
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-2 rounded-lg transition-colors ${
                  autoRefresh 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/80 hover:text-white hover:bg-white/20'
                }`}
                title={autoRefresh ? 'Parar atualização automática' : 'Ativar atualização automática'}
              >
                <RefreshCw className={`w-5 h-5 ${autoRefresh ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-scroll max-h-[calc(95vh-120px)] modal-scroll">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              <span className="ml-3 text-gray-600">Carregando dados...</span>
            </div>
          ) : dashboardData ? (
            <div className="space-y-6">
              {/* Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 rounded-xl text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-100 text-sm">Status do Sistema</p>
                      <p className="text-lg font-bold">{dashboardData.status}</p>
                    </div>
                    <Database className="w-8 h-8 text-emerald-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-xl text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Configurações Ativas</p>
                      <p className="text-2xl font-bold">{dashboardData.total_settings}</p>
                    </div>
                    <Settings className="w-8 h-8 text-blue-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-xl text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Cards Prontos</p>
                      <p className="text-2xl font-bold">{dashboardData.cards_ready_for_archive}</p>
                    </div>
                    <Archive className="w-8 h-8 text-orange-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-xl text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Arquivados (24h)</p>
                      <p className="text-2xl font-bold">{dashboardData.cards_archived_24h}</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-purple-200" />
                  </div>
                </div>
              </div>

              {/* Health Status */}
              {systemStatus && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Activity className="w-5 h-5 text-emerald-600 mr-2" />
                      Status de Saúde do Sistema
                    </h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getHealthStatusColor(systemStatus.health_status)}`}>
                      {getHealthStatusIcon(systemStatus.health_status)}
                      <span className="ml-2 capitalize">{systemStatus.health_status}</span>
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Última Execução</p>
                      <p className="font-medium">
                        {systemStatus.last_execution 
                          ? formatDate(systemStatus.last_execution.executed_at)
                          : 'Nunca executado'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Cards Arquivados na Última Execução</p>
                      <p className="font-medium">
                        {systemStatus.last_execution?.cards_archived || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Tempo de Execução</p>
                      <p className="font-medium">
                        {systemStatus.last_execution 
                          ? formatDuration(systemStatus.last_execution.duration_ms)
                          : 'N/A'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Recomendação</p>
                      <p className="font-medium text-sm">{systemStatus.recommendations}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Play className="w-5 h-5 text-emerald-600 mr-2" />
                  Ações
                </h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={executeManualArchive}
                    disabled={loading}
                    className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Executar Arquivamento Manual</span>
                  </button>
                  <button
                    onClick={loadDashboardData}
                    disabled={loading}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Atualizar Dados</span>
                  </button>
                </div>
              </div>

              {/* Execution Logs */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-5 h-5 text-gray-600 mr-2" />
                  Logs de Execução Recentes
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2">Data/Hora</th>
                        <th className="text-left py-2">Status</th>
                        <th className="text-left py-2">Cards Arquivados</th>
                        <th className="text-left py-2">Duração</th>
                        <th className="text-left py-2">Configurações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {executionLogs.map((log) => (
                        <tr key={log.id} className="border-b border-gray-100">
                          <td className="py-2">{formatDate(log.executed_at)}</td>
                          <td className="py-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              log.status === 'success' 
                                ? 'bg-green-100 text-green-800'
                                : log.status === 'error'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="py-2">{log.cards_archived}</td>
                          <td className="py-2">{formatDuration(log.execution_duration_ms)}</td>
                          <td className="py-2">{log.settings_checked}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum dado disponível
              </h3>
              <p className="text-gray-600">
                Não foi possível carregar os dados do sistema de monitoramento.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutoArchiveMonitor;
