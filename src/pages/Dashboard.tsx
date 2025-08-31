import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { DashboardStats, Card, Meeting } from '../types';
import { db } from '../services/database';
import { useNavigate } from 'react-router-dom';
import {
  Trello,
  Calendar,
  Coffee,
  Users,
  TrendingUp,
  Activity as ActivityIcon,
  Plus,
  Eye,
  FileText,
  Zap
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { getPriorityColor, getPriorityTextColor } = useSettings();
  const navigate = useNavigate();

  const getPriorityLabel = (priority: string): string => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'Crítica';
      case 'high': return 'Alta';
      case 'medium': return 'Normal';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };
  const [stats, setStats] = useState<DashboardStats>({
    total_cards: 0,
    cards_todo: 0,
    cards_progress: 0,
    cards_done: 0,
    total_meetings: 0,
    upcoming_meetings: 0,
    total_pomodoros: 0,
    completed_pomodoros: 0,
    active_users: 0,
    recent_activities: []
  });

  const [recentCards, setRecentCards] = useState<Card[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    // Simular carregamento de dados
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    // Simular dados do dashboard
    const mockStats: DashboardStats = {
      total_cards: 24,
      cards_todo: 8,
      cards_progress: 6,
      cards_done: 10,
      total_meetings: 12,
      upcoming_meetings: 3,
      total_pomodoros: 45,
      completed_pomodoros: 38,
      active_users: 5,
      recent_activities: [
        {
          id: 1,
          user_id: 1,
          type: 'card_created',
          description: 'Novo cartão criado: "Implementar login"',
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          user_id: 2,
          type: 'card_moved',
          description: 'Cartão movido para "Em Progresso"',
          created_at: new Date(Date.now() - 3600000).toISOString()
        }
      ]
    };

    try {
      if (!user?.id) return;

      // Carregar dados reais do Supabase
      const boards = await db.getBoards(user.id);
      let allCards: any[] = [];
      
      // Carregar cards apenas de boards ativos (não excluídos)
      for (const board of boards) {
        try {
          const boardCards = await db.getCardsForBoard(board.board_id);
          // Verificar se o board ainda existe antes de adicionar os cards
          if (boardCards && boardCards.length > 0) {
            allCards = [...allCards, ...boardCards];
          }
        } catch (error) {
          console.log(`Board ${board.name} não encontrado ou excluído, pulando...`);
          continue;
        }
      }

      // Calcular estatísticas
      const totalCards = allCards.length;
      const cardsTodo = allCards.filter(card => card.status === 'todo').length;
      const cardsProgress = allCards.filter(card => card.status === 'progress').length;
      const cardsDone = allCards.filter(card => card.status === 'done').length;

      // Carregar atividades recentes
      const activities = await db.getActivities(10);

      const realStats: DashboardStats = {
        total_cards: totalCards,
        cards_todo: cardsTodo,
        cards_progress: cardsProgress,
        cards_done: cardsDone,
        total_meetings: 0, // Implementar quando tiver tabela de meetings
        upcoming_meetings: 0,
        total_pomodoros: 0, // Implementar quando tiver tabela de pomodoros
        completed_pomodoros: 0,
        active_users: 1, // Por enquanto apenas o usuário atual
        recent_activities: activities.map(activity => ({
          id: activity.id,
          user_id: activity.user_id,
          type: activity.action as any, // Mapear para o tipo correto
          description: activity.description,
          created_at: activity.created_at
        }))
      };

      // Mapear cards para o formato do Dashboard
      const mappedCards: Card[] = allCards.slice(0, 5).map(card => ({
        id: card.id,
        board_id: 1, // Mapear para ID numérico
        column_id: 1,
        title: card.title,
        description: card.description,
        priority: card.importance as 'low' | 'medium' | 'high',
        status: card.status as 'todo' | 'progress' | 'done',
        created_by: card.user_id || 1,
        created_at: card.created_at,
        updated_at: card.updated_at
      }));

      setStats(realStats);
      setRecentCards(mappedCards);
      setUpcomingMeetings([]); // Implementar quando tiver tabela de meetings
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    }
  };



  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'todo': return 'status-todo';
      case 'progress': return 'status-progress';
      case 'done': return 'status-done';
      default: return 'status-todo';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'todo': return 'A Fazer';
      case 'progress': return 'Em Progresso';
      case 'done': return 'Concluído';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-brand-light-gray/30">
      {/* Header */}
      <div className="bg-white border-b border-brand-light-gray p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-gray">
              Bem-vindo, {user?.username}!
            </h1>
            <p className="text-brand-gray/70">
              Aqui está um resumo das suas atividades
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="btn-primary flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Nova Tarefa</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Cards */}
          <div className="card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-brand-gray/70">Total de Cartões</p>
                <p className="text-2xl font-bold text-brand-gray">{stats.total_cards}</p>
              </div>
                              <div className="w-12 h-12 bg-brand-blue-light/10 rounded-2xl flex items-center justify-center">
                <Trello className="w-6 h-6 text-brand-blue-light" />
              </div>
            </div>
            <div className="mt-4 flex space-x-2">
              <span className="status-todo">{stats.cards_todo} A Fazer</span>
              <span className="status-progress">{stats.cards_progress} Em Progresso</span>
              <span className="status-done">{stats.cards_done} Concluído</span>
            </div>
          </div>

          {/* Meetings */}
          <div className="card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-brand-gray/70">Reuniões</p>
                <p className="text-2xl font-bold text-brand-gray">{stats.total_meetings}</p>
              </div>
                              <div className="w-12 h-12 bg-brand-green-light/10 rounded-2xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-brand-green-light" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-brand-gray/70">
                Próximas: <span className="font-medium text-brand-green">{stats.upcoming_meetings}</span>
              </p>
            </div>
          </div>

          {/* Pomodoro */}
          <div className="card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-brand-gray/70">Pomodoros</p>
                <p className="text-2xl font-bold text-brand-gray">{stats.completed_pomodoros}</p>
              </div>
                              <div className="w-12 h-12 bg-brand-orange-light/10 rounded-2xl flex items-center justify-center">
                <Coffee className="w-6 h-6 text-brand-orange-light" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-brand-gray/70">
                Total: <span className="font-medium text-brand-orange">{stats.total_pomodoros}</span>
              </p>
            </div>
          </div>

          {/* Active Users */}
          <div className="card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-brand-gray/70">Usuários Ativos</p>
                <p className="text-2xl font-bold text-brand-gray">{stats.active_users}</p>
              </div>
                              <div className="w-12 h-12 bg-brand-purple-light/10 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-brand-purple-light" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-brand-gray/70">
                <TrendingUp className="w-4 h-4 inline mr-1 text-brand-green" />
                +12% este mês
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Cards */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-brand-gray flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Cartões Recentes
                </h2>
                <button 
                  onClick={() => navigate('/all-cards')}
                  className="text-brand-red hover:text-brand-red-dark text-sm font-medium"
                >
                  Ver Todos
                </button>
              </div>
              
              <div className="space-y-4">
                {recentCards.map((card) => (
                  <div 
                    key={card.id} 
                    className="border-2 border-brand-light-gray rounded-2xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-brand-gray mb-1">{card.title}</h3>
                        {card.description && (
                          <p className="text-sm text-brand-gray/70 mb-2">{card.description}</p>
                        )}
                        <div className="flex items-center space-x-3">
                          <span className={`text-sm font-medium px-2 py-1 rounded-full text-xs`}
                                style={{ 
                                  backgroundColor: getPriorityColor(card.priority),
                                  color: getPriorityTextColor(card.priority)
                                }}>
                            {getPriorityLabel(card.priority)}
                          </span>
                          <span className={`status-badge ${getStatusBadge(card.status)}`}>
                            {getStatusText(card.status)}
                          </span>
                        </div>
                      </div>
                      <button className="p-2 text-brand-gray/50 hover:text-brand-gray">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Meetings */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-brand-gray flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Próximas Reuniões
                </h3>
                <button className="text-brand-red hover:text-brand-red-dark text-sm">
                  Ver Todas
                </button>
              </div>
              
              <div className="space-y-3">
                {upcomingMeetings.map((meeting) => (
                  <div key={meeting.id} className="border border-brand-light-gray rounded-2xl p-3">
                    <h4 className="font-medium text-brand-gray text-sm mb-1">{meeting.title}</h4>
                    <p className="text-xs text-brand-gray/70 mb-2">
                      {new Date(meeting.date).toLocaleDateString('pt-BR')} às {meeting.time}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-brand-green-light/10 text-brand-green px-2 py-1 rounded-full">
                        {meeting.platform}
                      </span>
                      <button className="text-xs text-brand-blue hover:text-brand-blue-dark">
                        Entrar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-brand-gray flex items-center">
                  <ActivityIcon className="w-4 h-4 mr-2" />
                  Atividades Recentes
                </h3>
                <button className="text-brand-red hover:text-brand-red-dark text-sm">
                  Ver Todas
                </button>
              </div>
              
              <div className="space-y-3">
                {stats.recent_activities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-brand-green rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm text-brand-gray">{activity.description}</p>
                      <p className="text-xs text-brand-gray/50">
                        {new Date(activity.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h3 className="font-semibold text-brand-gray mb-4 flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                Ações Rápidas
              </h3>
              
              <div className="space-y-2">
                <button className="w-full btn-primary text-left flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Novo Cartão</span>
                </button>
                <button className="w-full btn-secondary text-left flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Nova Reunião</span>
                </button>
                <button className="w-full btn-outline text-left flex items-center space-x-2">
                  <Coffee className="w-4 h-4" />
                  <span>Iniciar Pomodoro</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
