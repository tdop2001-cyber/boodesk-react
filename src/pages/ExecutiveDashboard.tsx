import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Target,
  Activity,
  PieChart,
  LineChart,
  Eye,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import {
  BarChart as RechartsBarChart,
  LineChart as RechartsLineChart,
  AreaChart as RechartsAreaChart,
  PieChart as RechartsPieChart,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
  CartesianGrid as RechartsCartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  ResponsiveContainer as RechartsResponsiveContainer,
  Pie as RechartsPie,
  Cell as RechartsCell,
  Area as RechartsArea,
  Line as RechartsLine,
  Bar as RechartsBar
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { db } from '../services/database';
import { Card, User, Board } from '../types';

interface DashboardMetrics {
  totalCards: number;
  totalSubtasks: number;
  completedCards: number;
  completedSubtasks: number;
  inProgressCards: number;
  inProgressSubtasks: number;
  pendingCards: number;
  pendingSubtasks: number;
  overdueCards: number;
  overdueSubtasks: number;
  totalUsers: number;
  activeUsers: number;
  totalBoards: number;
  averageCompletionTime: number;
  productivityScore: number;
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface TimeSeriesData {
  date: string;
  completed: number;
  created: number;
  inProgress: number;
}

const ExecutiveDashboard: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalCards: 0,
    totalSubtasks: 0,
    completedCards: 0,
    completedSubtasks: 0,
    inProgressCards: 0,
    inProgressSubtasks: 0,
    pendingCards: 0,
    pendingSubtasks: 0,
    overdueCards: 0,
    overdueSubtasks: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalBoards: 0,
    averageCompletionTime: 0,
    productivityScore: 0
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [chartType, setChartType] = useState<'pie' | 'bar' | 'line' | 'area'>('pie');
  const [productivityChartType, setProductivityChartType] = useState<'line' | 'area' | 'bar'>('line');
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [allSubtasks, setAllSubtasks] = useState<any[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | 'all'>('all');

  // Função para filtrar dados por usuário
  const getFilteredData = () => {
    if (selectedUserId === 'all') {
      return {
        cards: allCards,
        subtasks: allSubtasks
      };
    }

    // Filtrar cards onde o usuário é membro ou criador
    const filteredCards = allCards.filter(card => 
      card.created_by === selectedUserId || 
      (card.members && card.members.includes(selectedUserId))
    );

    // Filtrar subtarefas onde o usuário é membro
    const filteredSubtasks = allSubtasks.filter(subtask => 
      subtask.created_by === selectedUserId ||
      (subtask.members && subtask.members.includes(selectedUserId))
    );

    return {
      cards: filteredCards,
      subtasks: filteredSubtasks
    };
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        console.error('Usuário não autenticado');
        return;
      }

      // Carregar dados básicos
      const [users, boardsData, cardsData, subtasksData] = await Promise.all([
        db.getUsers(),
        db.getBoards(user.id, user.role),
        db.getAllCardsForUser(user.id, user.role),
        db.getAllSubtasks(user.role, user.id)
      ]);

      // Definir estados
      setBoards(boardsData);
      setAllCards(cardsData);
      setAllSubtasks(subtasksData);
      setUsers(users);

      // Obter dados filtrados
      const { cards: filteredCards, subtasks: filteredSubtasks } = getFilteredData();
      
      // Calcular métricas
      const totalCards = filteredCards.length;
      const totalSubtasks = filteredSubtasks.length;
      const completedCards = filteredCards.filter((c: Card) => c.status === 'done').length;
      const completedSubtasks = filteredSubtasks.filter((s: any) => s.status === 'completed').length;
      const inProgressCards = filteredCards.filter((c: Card) => c.status === 'progress').length;
      const inProgressSubtasks = filteredSubtasks.filter((s: any) => s.status === 'in_progress').length;
      const pendingCards = filteredCards.filter((c: Card) => c.status === 'todo').length;
      const pendingSubtasks = filteredSubtasks.filter((s: any) => s.status === 'todo' || s.status === 'pending').length;
      
      // Calcular cards/subtasks em atraso
      const today = new Date();
      const overdueCards = filteredCards.filter((c: Card) => c.due_date && new Date(c.due_date) < today && c.status !== 'done').length;
      const overdueSubtasks = filteredSubtasks.filter((s: any) => s.due_date && new Date(s.due_date) < today && s.status !== 'completed').length;

      // Calcular métricas de produtividade
      const productivityScore = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;
      const averageCompletionTime = 0; // Implementar cálculo baseado em dados históricos

      const newMetrics: DashboardMetrics = {
        totalCards,
        totalSubtasks,
        completedCards,
        completedSubtasks,
        inProgressCards,
        inProgressSubtasks,
        pendingCards,
        pendingSubtasks,
        overdueCards,
        overdueSubtasks,
        totalUsers: users.length,
        activeUsers: users.length, // Assumindo que todos os usuários estão ativos
        totalBoards: boards.length,
        averageCompletionTime,
        productivityScore
      };

      setMetrics(newMetrics);

      // Preparar dados para gráficos
      const statusChartData: ChartData[] = [
        { name: 'Concluídos', value: completedCards + completedSubtasks, color: '#10B981' },
        { name: 'Em Progresso', value: inProgressCards + inProgressSubtasks, color: '#F59E0B' },
        { name: 'Pendentes', value: pendingCards + pendingSubtasks, color: '#3B82F6' },
        { name: 'Em Atraso', value: overdueCards + overdueSubtasks, color: '#EF4444' }
      ];

      setChartData(statusChartData);

      // Gerar dados de série temporal baseados nos dados reais do banco
      const generateTimeSeriesData = (): TimeSeriesData[] => {
        const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
        const data: TimeSeriesData[] = [];
        
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          // Contar cards criados nesta data
          const cardsCreatedToday = filteredCards.filter(card => {
            const cardDate = new Date(card.created_at).toISOString().split('T')[0];
            return cardDate === dateStr;
          }).length;
          
          // Contar cards concluídos nesta data
          const cardsCompletedToday = filteredCards.filter(card => {
            if (card.status !== 'done') return false;
            const updatedDate = new Date(card.updated_at).toISOString().split('T')[0];
            return updatedDate === dateStr;
          }).length;
          
          // Contar subtarefas criadas nesta data
          const subtasksCreatedToday = filteredSubtasks.filter(subtask => {
            const subtaskDate = new Date(subtask.created_at).toISOString().split('T')[0];
            return subtaskDate === dateStr;
          }).length;
          
          // Contar subtarefas concluídas nesta data
          const subtasksCompletedToday = filteredSubtasks.filter(subtask => {
            if (subtask.status !== 'completed') return false;
            const updatedDate = new Date(subtask.updated_at).toISOString().split('T')[0];
            return updatedDate === dateStr;
          }).length;
          
          data.push({
            date: dateStr,
            completed: cardsCompletedToday + subtasksCompletedToday,
            created: cardsCreatedToday + subtasksCreatedToday,
            inProgress: Math.max(0, Math.floor((inProgressCards + inProgressSubtasks) / days))
          });
        }
        
        return data;
      };
      
      const realTimeSeriesData = generateTimeSeriesData();

      setTimeSeriesData(realTimeSeriesData);

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      addToast({
        type: 'error',
        title: 'Erro',
        message: 'Não foi possível carregar os dados do dashboard'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [timeRange, selectedUserId]);

  const MetricCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
  }> = ({ title, value, icon, color, trend, trendValue }) => (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900">{value.toLocaleString()}</p>
          {trend && trendValue && (
            <div className={`flex items-center mt-2 text-sm ${
              trend === 'up' ? 'text-green-600' : 
              trend === 'down' ? 'text-red-600' : 
              'text-slate-600'
            }`}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : 
               trend === 'down' ? <TrendingDown className="w-4 h-4 mr-1" /> : 
               <Activity className="w-4 h-4 mr-1" />}
              {trendValue}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16704E] mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando dashboard executivo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#16704E] via-[#0F5A3A] to-[#0A4A2E] text-white shadow-xl">
        <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-[#16704E] to-[#0F5A3A] rounded-xl shadow-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Dashboard Executivo</h1>
                  <p className="text-[#16704E]/80">Visão geral da produtividade e métricas</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/70 pointer-events-none" />
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as any)}
                  className="pl-10 pr-4 py-3 bg-white/15 border border-white/30 rounded-lg text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20 transition-all duration-200 min-w-[160px] appearance-none cursor-pointer"
                >
                  <option value="7d" className="bg-slate-800 text-white">Últimos 7 dias</option>
                  <option value="30d" className="bg-slate-800 text-white">Últimos 30 dias</option>
                  <option value="90d" className="bg-slate-800 text-white">Últimos 90 dias</option>
                  <option value="1y" className="bg-slate-800 text-white">Último ano</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/70 pointer-events-none" />
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                  className="pl-10 pr-4 py-3 bg-white/15 border border-white/30 rounded-lg text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20 transition-all duration-200 min-w-[200px] appearance-none cursor-pointer"
                >
                  <option value="all" className="bg-slate-800 text-white">Todos os usuários</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id} className="bg-slate-800 text-white">
                      {user.nome_completo || user.username || user.email}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              <button
                onClick={loadDashboardData}
                className="flex items-center space-x-2 px-4 py-3 bg-white/15 hover:bg-white/25 border border-white/30 rounded-lg transition-all duration-200 text-white font-medium shadow-sm hover:shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Atualizar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6 py-6">
        {/* Informações do Filtro */}
        {selectedUserId !== 'all' && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800 font-medium">
                Visualizando dados de: {users.find(u => u.id === selectedUserId)?.nome_completo || users.find(u => u.id === selectedUserId)?.username || users.find(u => u.id === selectedUserId)?.email}
              </span>
            </div>
          </div>
        )}
        
        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total de Tarefas"
            value={metrics.totalCards}
            icon={<Target className="w-6 h-6 text-white" />}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            trend="up"
            trendValue="+12%"
          />
          
          <MetricCard
            title="Subtarefas"
            value={metrics.totalSubtasks}
            icon={<CheckCircle className="w-6 h-6 text-white" />}
            color="bg-gradient-to-br from-green-500 to-green-600"
            trend="up"
            trendValue="+8%"
          />
          
          <MetricCard
            title="Concluídos"
            value={metrics.completedCards + metrics.completedSubtasks}
            icon={<CheckCircle className="w-6 h-6 text-white" />}
            color="bg-gradient-to-br from-emerald-500 to-emerald-600"
            trend="up"
            trendValue="+15%"
          />
          
          <MetricCard
            title="Em Atraso"
            value={metrics.overdueCards + metrics.overdueSubtasks}
            icon={<AlertTriangle className="w-6 h-6 text-white" />}
            color="bg-gradient-to-br from-red-500 to-red-600"
            trend="down"
            trendValue="-5%"
          />
        </div>

        {/* Segunda Linha de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Em Progresso"
            value={metrics.inProgressCards + metrics.inProgressSubtasks}
            icon={<Clock className="w-6 h-6 text-white" />}
            color="bg-gradient-to-br from-orange-500 to-orange-600"
          />
          
          <MetricCard
            title="Pendentes"
            value={metrics.pendingCards + metrics.pendingSubtasks}
            icon={<Calendar className="w-6 h-6 text-white" />}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
          />
          
          <MetricCard
            title="Usuários Ativos"
            value={metrics.activeUsers}
            icon={<Users className="w-6 h-6 text-white" />}
            color="bg-gradient-to-br from-indigo-500 to-indigo-600"
          />
          
          <MetricCard
            title="Produtividade"
            value={metrics.productivityScore}
            icon={<TrendingUp className="w-6 h-6 text-white" />}
            color="bg-gradient-to-br from-teal-500 to-teal-600"
            trend="up"
            trendValue="+3%"
          />
        </div>

        {/* Gráficos Interativos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de Status */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Distribuição por Status</h3>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <select
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value as any)}
                    className="pl-8 pr-8 py-2 text-sm font-medium border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#16704E]/30 focus:border-[#16704E]/50 transition-all duration-200 shadow-sm hover:shadow-md appearance-none cursor-pointer"
                  >
                    <option value="pie" className="text-slate-700">Pizza</option>
                    <option value="bar" className="text-slate-700">Barras</option>
                    <option value="line" className="text-slate-700">Linha</option>
                    <option value="area" className="text-slate-700">Área</option>
                  </select>
                  <PieChart className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="h-80">
              <RechartsResponsiveContainer width="100%" height="100%">
                {chartType === 'pie' ? (
                  <RechartsPieChart>
                    <RechartsPie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <RechartsCell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </RechartsPie>
                    <RechartsTooltip />
                  </RechartsPieChart>
                ) : chartType === 'bar' ? (
                  <RechartsBarChart data={chartData}>
                    <RechartsCartesianGrid strokeDasharray="3 3" />
                    <RechartsXAxis dataKey="name" />
                    <RechartsYAxis />
                    <RechartsTooltip />
                    <RechartsBar dataKey="value" fill="#16704E" />
                  </RechartsBarChart>
                ) : chartType === 'line' ? (
                  <RechartsLineChart data={chartData}>
                    <RechartsCartesianGrid strokeDasharray="3 3" />
                    <RechartsXAxis dataKey="name" />
                    <RechartsYAxis />
                    <RechartsTooltip />
                    <RechartsLine type="monotone" dataKey="value" stroke="#16704E" strokeWidth={2} />
                  </RechartsLineChart>
                ) : (
                  <RechartsAreaChart data={chartData}>
                    <RechartsCartesianGrid strokeDasharray="3 3" />
                    <RechartsXAxis dataKey="name" />
                    <RechartsYAxis />
                    <RechartsTooltip />
                    <RechartsArea type="monotone" dataKey="value" stroke="#16704E" fill="#16704E" fillOpacity={0.3} />
                  </RechartsAreaChart>
                )}
              </RechartsResponsiveContainer>
            </div>
          </div>

          {/* Gráfico de Produtividade */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Produtividade Temporal</h3>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <select
                    value={productivityChartType}
                    onChange={(e) => setProductivityChartType(e.target.value as any)}
                    className="pl-8 pr-8 py-2 text-sm font-medium border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#16704E]/30 focus:border-[#16704E]/50 transition-all duration-200 shadow-sm hover:shadow-md appearance-none cursor-pointer"
                  >
                    <option value="line" className="text-slate-700">Linha</option>
                    <option value="area" className="text-slate-700">Área</option>
                    <option value="bar" className="text-slate-700">Barras</option>
                  </select>
                  <LineChart className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="h-80">
              <RechartsResponsiveContainer width="100%" height="100%">
                {productivityChartType === 'line' ? (
                  <RechartsLineChart data={timeSeriesData}>
                    <RechartsCartesianGrid strokeDasharray="3 3" />
                    <RechartsXAxis dataKey="date" />
                    <RechartsYAxis />
                    <RechartsTooltip />
                    <RechartsLegend />
                    <RechartsLine type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={2} name="Concluídos" />
                    <RechartsLine type="monotone" dataKey="created" stroke="#3B82F6" strokeWidth={2} name="Criados" />
                    <RechartsLine type="monotone" dataKey="inProgress" stroke="#F59E0B" strokeWidth={2} name="Em Progresso" />
                  </RechartsLineChart>
                ) : productivityChartType === 'area' ? (
                  <RechartsAreaChart data={timeSeriesData}>
                    <RechartsCartesianGrid strokeDasharray="3 3" />
                    <RechartsXAxis dataKey="date" />
                    <RechartsYAxis />
                    <RechartsTooltip />
                    <RechartsLegend />
                    <RechartsArea type="monotone" dataKey="completed" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Concluídos" />
                    <RechartsArea type="monotone" dataKey="created" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Criados" />
                    <RechartsArea type="monotone" dataKey="inProgress" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} name="Em Progresso" />
                  </RechartsAreaChart>
                ) : (
                  <RechartsBarChart data={timeSeriesData}>
                    <RechartsCartesianGrid strokeDasharray="3 3" />
                    <RechartsXAxis dataKey="date" />
                    <RechartsYAxis />
                    <RechartsTooltip />
                    <RechartsLegend />
                    <RechartsBar dataKey="completed" fill="#10B981" name="Concluídos" />
                    <RechartsBar dataKey="created" fill="#3B82F6" name="Criados" />
                    <RechartsBar dataKey="inProgress" fill="#F59E0B" name="Em Progresso" />
                  </RechartsBarChart>
                )}
              </RechartsResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Gráficos Adicionais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de Prioridades */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Distribuição por Prioridade</h3>
              <Target className="w-5 h-5 text-slate-600" />
            </div>
            
            <div className="h-80">
              <RechartsResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={(() => {
                  const { cards, subtasks } = getFilteredData();
                  return [
                    { name: 'Baixa', value: cards.filter((c: Card) => c.priority === 'low').length + subtasks.filter((s: any) => s.priority === 'low').length, color: '#10B981' },
                    { name: 'Normal', value: cards.filter((c: Card) => c.priority === 'medium').length + subtasks.filter((s: any) => s.priority === 'medium').length, color: '#3B82F6' },
                    { name: 'Alta', value: cards.filter((c: Card) => c.priority === 'high').length + subtasks.filter((s: any) => s.priority === 'high').length, color: '#F59E0B' },
                    { name: 'Urgente', value: cards.filter((c: Card) => c.priority === 'critical').length + subtasks.filter((s: any) => s.priority === 'critical').length, color: '#EF4444' }
                  ];
                })()}>
                  <RechartsCartesianGrid strokeDasharray="3 3" />
                  <RechartsXAxis dataKey="name" />
                  <RechartsYAxis />
                  <RechartsTooltip />
                  <RechartsBar dataKey="value" fill="#16704E" />
                </RechartsBarChart>
              </RechartsResponsiveContainer>
            </div>
          </div>

          {/* Gráfico de Performance por Board */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Performance por Board</h3>
              <BarChart3 className="w-5 h-5 text-slate-600" />
            </div>
            
            <div className="h-80">
              <RechartsResponsiveContainer width="100%" height="100%">
                <RechartsAreaChart data={(() => {
                  const { cards, subtasks } = getFilteredData();
                  return boards.map((board: Board) => {
                    const boardCards = cards.filter((card: Card) => 
                      String(card.board_id) === String(board.id)
                    );
                    const boardSubtasks = subtasks.filter((subtask: any) => 
                      boardCards.some((card: Card) => card.id === subtask.card_id)
                    );
                    
                    return {
                      board: board.name,
                      concluidos: boardCards.filter((c: Card) => c.status === 'done').length + 
                                boardSubtasks.filter((s: any) => s.status === 'completed').length,
                      pendentes: boardCards.filter((c: Card) => c.status === 'todo').length + 
                                boardSubtasks.filter((s: any) => s.status === 'todo' || s.status === 'pending').length,
                      emProgresso: boardCards.filter((c: Card) => c.status === 'progress').length + 
                                  boardSubtasks.filter((s: any) => s.status === 'in_progress').length
                    };
                  });
                })()}>
                  <RechartsCartesianGrid strokeDasharray="3 3" />
                  <RechartsXAxis dataKey="board" />
                  <RechartsYAxis />
                  <RechartsTooltip />
                  <RechartsLegend />
                  <RechartsArea type="monotone" dataKey="concluidos" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Concluídos" />
                  <RechartsArea type="monotone" dataKey="emProgresso" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} name="Em Progresso" />
                  <RechartsArea type="monotone" dataKey="pendentes" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Pendentes" />
                </RechartsAreaChart>
              </RechartsResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Resumo Executivo */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Resumo Executivo</h3>
            <Eye className="w-5 h-5 text-slate-600" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {Math.round(((metrics.completedCards + metrics.completedSubtasks) / (metrics.totalCards + metrics.totalSubtasks)) * 100)}%
              </div>
              <p className="text-sm text-slate-600">Taxa de Conclusão</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {metrics.totalBoards}
              </div>
              <p className="text-sm text-slate-600">Quadros Ativos</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {metrics.averageCompletionTime || 0}
              </div>
              <p className="text-sm text-slate-600">Dias Médios para Conclusão</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
