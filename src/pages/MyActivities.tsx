import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../contexts/PermissionContext';
import { useToast } from '../contexts/ToastContext';
import { useSettings } from '../contexts/SettingsContext';

import { Card, Column } from '../types';
import { db } from '../services/database';
import {
  Calendar,
  Clock,
  Users,
  Link,
  CheckCircle,
  Circle,
  ArrowRight,
  FileText,
  Edit3,
  RefreshCw,
  Filter,
  Search,
  Eye,
  Target,
  AlertCircle,
  Star,
  Tag,
  User,
  CalendarDays,
  Clock3,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Settings
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'card' | 'subtask' | 'individual_subtask';
  title: string;
  description?: string;
  status: 'pending' | 'completed' | 'in_progress';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  members?: string[];
  dependencies?: string[];
  subtasks?: ActivityItem[];
  parentCardId?: string;
  importance?: string;
  tags?: string[];
  estimatedTime?: string;
  actualTime?: string;
  category?: string;
  recurrence?: string;
}

interface MyActivitiesProps {}

const MyActivities: React.FC<MyActivitiesProps> = () => {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const { addToast } = useToast();
  const { getPriorityColor, getPriorityTextColor } = useSettings();

  const getPriorityLabel = (priority: string): string => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Normal';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  // Cores padrão do sistema - vermelho e verde
  const getSystemPriorityColor = (priority: string): string => {
    switch (priority.toLowerCase()) {
      case 'critical':
      case 'urgent':
        return '#DC2626'; // Vermelho escuro
      case 'high':
        return '#EF4444'; // Vermelho
      case 'medium':
        return '#F59E0B'; // Laranja
      case 'low':
        return '#10B981'; // Verde
      default:
        return '#6B7280'; // Cinza
    }
  };

  const getSystemPriorityTextColor = (priority: string): string => {
    switch (priority.toLowerCase()) {
      case 'critical':
      case 'urgent':
      case 'high':
        return '#FFFFFF'; // Texto branco para fundos escuros
      case 'medium':
        return '#FFFFFF'; // Texto branco para laranja
      case 'low':
        return '#FFFFFF'; // Texto branco para verde
      default:
        return '#FFFFFF'; // Texto branco
    }
  };
  
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'cards' | 'subtasks'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'in_progress'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  // Carregar dados reais do Supabase
  const loadActivities = async () => {
    setLoading(true);
    try {
      if (!user?.id) return;

      // Carregar cards do usuário
      const boards = await db.getBoards(user.id);
      let allCards: any[] = [];
      
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

      // Carregar subtarefas para cada card
      for (const card of allCards) {
        try {
          const subtasks = await db.getSubtasksForCard(card.card_id);
          card.subtasks = subtasks;
        } catch (error) {
          console.error(`Erro ao carregar subtarefas para card ${card.card_id}:`, error);
          card.subtasks = [];
        }
      }

      // Converter cards para ActivityItem
      const convertedActivities: ActivityItem[] = allCards.map(card => {
        // Mapear prioridade corretamente
        let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
        if (card.importance) {
          const importance = card.importance.toLowerCase();
          if (importance === 'critical' || importance === 'urgent') {
            priority = 'urgent';
          } else if (importance === 'high' || importance === 'alta') {
            priority = 'high';
          } else if (importance === 'medium' || importance === 'normal' || importance === 'média') {
            priority = 'medium';
          } else if (importance === 'low' || importance === 'baixa') {
            priority = 'low';
          }
        }

        // Converter subtarefas se existirem
        const subtasks: ActivityItem[] = (card.subtasks || []).map((subtask: any) => {
          let subtaskPriority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
          if (subtask.importance) {
            const importance = subtask.importance.toLowerCase();
            if (importance === 'critical' || importance === 'urgent') {
              subtaskPriority = 'urgent';
            } else if (importance === 'high' || importance === 'alta') {
              subtaskPriority = 'high';
            } else if (importance === 'medium' || importance === 'normal' || importance === 'média') {
              subtaskPriority = 'medium';
            } else if (importance === 'low' || importance === 'baixa') {
              subtaskPriority = 'low';
            }
          }

          return {
            id: subtask.subtask_id,
            type: 'subtask',
            title: subtask.title,
            description: subtask.description,
            status: subtask.status as 'pending' | 'completed' | 'in_progress',
            priority: subtaskPriority,
            dueDate: subtask.due_date,
            members: subtask.assigned_to ? [subtask.assigned_to] : [],
            dependencies: [],
            importance: subtask.importance,
            tags: subtask.tags || [],
            estimatedTime: subtask.estimated_time || '0h',
            actualTime: subtask.actual_time || '0h',
            category: subtask.category || 'Geral',
            parentCardId: card.card_id
          };
        });

        return {
          id: card.card_id,
          type: 'card',
          title: card.title,
          description: card.description,
          status: card.status as 'pending' | 'completed' | 'in_progress',
          priority: priority,
          dueDate: card.due_date,
          members: card.members || [],
          dependencies: card.dependencies || [],
          importance: card.importance,
          tags: card.tags || [],
          estimatedTime: card.estimated_time || '0h',
          actualTime: card.actual_time || '0h',
          category: card.subject || 'Geral',
          subtasks: subtasks
        };
      });

      setActivities(convertedActivities);
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
      addToast({
        type: 'error',
        title: 'Erro ao carregar atividades',
        message: 'Não foi possível carregar suas atividades.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadActivities();
    }
  }, [user?.id]);

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesType = true;
    if (filterType === 'cards') {
      matchesType = activity.type === 'card';
    } else if (filterType === 'subtasks') {
      matchesType = activity.type === 'subtask' || activity.type === 'individual_subtask';
    }
    
    const matchesStatus = filterStatus === 'all' || activity.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || activity.priority === filterPriority;
    
    return matchesSearch && matchesType && matchesStatus && matchesPriority;
  });

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const toggleSubtaskStatus = (subtaskId: string) => {
    setActivities(prev => prev.map(activity => {
      if (activity.id === subtaskId) {
        return {
          ...activity,
          status: activity.status === 'completed' ? 'pending' : 'completed'
        };
      }
      if (activity.subtasks) {
        return {
          ...activity,
          subtasks: activity.subtasks.map(subtask => 
            subtask.id === subtaskId 
              ? { ...subtask, status: subtask.status === 'completed' ? 'pending' : 'completed' }
              : subtask
          )
        };
      }
      return activity;
    }));
  };

  const updateSubtaskStatus = (subtaskId: string, newStatus: 'pending' | 'in_progress' | 'completed') => {
    setActivities(prev => prev.map(activity => {
      if (activity.id === subtaskId) {
        return {
          ...activity,
          status: newStatus
        };
      }
      if (activity.subtasks) {
        return {
          ...activity,
          subtasks: activity.subtasks.map(subtask => 
            subtask.id === subtaskId 
              ? { ...subtask, status: newStatus }
              : subtask
          )
        };
      }
      return activity;
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress':
        return <Clock3 className="w-4 h-4 text-orange-500" />;
      default:
        return <Circle className="w-4 h-4 text-red-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getDaysUntilDue = (dateString: string) => {
    const dueDate = new Date(dateString);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDueDateStatus = (dateString: string) => {
    const daysUntilDue = getDaysUntilDue(dateString);
    if (daysUntilDue < 0) return 'overdue';
    if (daysUntilDue <= 3) return 'urgent';
    if (daysUntilDue <= 7) return 'warning';
    return 'normal';
  };

  const renderActivityItem = (activity: ActivityItem, level: number = 0) => {
    const isExpanded = expandedItems.has(activity.id);
    const hasSubtasks = activity.subtasks && activity.subtasks.length > 0;
    const isOverdue = activity.dueDate && getDueDateStatus(activity.dueDate) === 'overdue';
    const isUrgent = activity.dueDate && getDueDateStatus(activity.dueDate) === 'urgent';
    const isSubtask = activity.type === 'subtask' || activity.type === 'individual_subtask';

    return (
      <div key={activity.id} className={`
        ${level === 0 ? 'mb-4' : 'mb-3'}
        ${isSubtask ? 'ml-6' : ''}
        group
      `}>
        <div 
          className={`
            relative overflow-hidden rounded-xl border transition-all duration-300 ease-in-out
            ${selectedActivity?.id === activity.id 
              ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg shadow-blue-200/50' 
              : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50'
            }
            ${isSubtask 
              ? 'border-l-4 border-l-red-400 bg-gradient-to-r from-red-50/50 to-white' 
              : 'border-l-4 border-l-green-400'
            }
            ${activity.status === 'completed' ? 'opacity-75' : ''}
          `}
          onClick={() => setSelectedActivity(activity)}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Content Container */}
          <div className="relative flex items-center p-5">
            {/* Expand/Collapse button */}
            {hasSubtasks && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(activity.id);
                }}
                className="mr-4 p-2 hover:bg-slate-100 rounded-full transition-all duration-200 hover:scale-110"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-slate-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                )}
              </button>
            )}

            {/* Status Icon with enhanced styling */}
            <div className={`mr-4 p-2.5 rounded-full shadow-sm ${
              isSubtask 
                ? 'bg-gradient-to-br from-red-100 to-red-200 border border-red-200' 
                : 'bg-gradient-to-br from-green-100 to-green-200 border border-green-200'
            }`}>
              {getStatusIcon(activity.status)}
            </div>

            {/* Type Badge with improved styling */}
            <div className="mr-4">
                             <span className={`
                 px-3 py-1.5 text-xs font-bold rounded-full border shadow-sm
                 ${activity.type === 'card' 
                   ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-600' 
                   : 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-600'
                 }
               `}>
                 {activity.type === 'card' ? 'Tarefa' : 'Subtarefa'}
               </span>
            </div>

            {/* Title and Description Section */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className={`
                  font-bold truncate
                  ${activity.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800'}
                  ${isSubtask ? 'text-sm' : 'text-lg'}
                  group-hover:text-slate-900 transition-colors duration-200
                `}>
                  {activity.title}
                </h3>
                {hasSubtasks && (
                  <span className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full font-semibold border border-slate-200 shadow-sm">
                    {activity.subtasks?.length} subtarefa{activity.subtasks?.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              {activity.description && (
                <p className={`text-slate-600 truncate leading-relaxed ${isSubtask ? 'text-xs' : 'text-sm'}`}>
                  {activity.description}
                </p>
              )}
            </div>

            {/* Right Side Information */}
            <div className="flex items-center space-x-4">
              {/* Priority Badge with enhanced visibility */}
              <div>
                <span 
                  className="px-3 py-1.5 text-xs font-bold rounded-full border shadow-lg"
                  style={{ 
                    backgroundColor: getSystemPriorityColor(activity.priority),
                    color: getSystemPriorityTextColor(activity.priority)
                  }}
                >
                  {getPriorityLabel(activity.priority)}
                </span>
              </div>

              {/* Due Date with better formatting */}
              {activity.dueDate && (
                <div className={`text-sm font-semibold ${isOverdue ? 'text-red-600' : isUrgent ? 'text-orange-600' : 'text-green-600'}`}>
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(activity.dueDate)}</span>
                  </div>
                  {isOverdue && (
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-bold border border-red-200 shadow-sm">
                      ⏰ Atrasado
                    </span>
                  )}
                  {!isOverdue && !isUrgent && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-bold border border-green-200 shadow-sm">
                      ✅ No prazo
                    </span>
                  )}
                </div>
              )}

              {/* Estimated Time with better styling */}
              {activity.estimatedTime && (
                <div className="text-sm text-slate-600 font-semibold">
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-4 h-4" />
                    <span>{activity.estimatedTime}</span>
                  </div>
                </div>
              )}

              {/* Tags with improved visibility */}
              {activity.tags && activity.tags.length > 0 && (
                <div className="flex space-x-1.5">
                  {activity.tags.slice(0, 2).map((tag, index) => (
                    <span key={index} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-medium border border-slate-200 shadow-sm">
                      #{tag}
                    </span>
                  ))}
                  {activity.tags.length > 2 && (
                    <span className="text-xs text-slate-500 font-bold bg-slate-50 px-2 py-1 rounded-full border border-slate-200">
                      +{activity.tags.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Subtasks with enhanced visual separation */}
          {hasSubtasks && isExpanded && (
            <div className="bg-gradient-to-br from-red-50 via-slate-50 to-green-50 border-t border-red-200/50">
              <div className="px-6 py-4">
                <div className="text-sm font-bold text-red-800 mb-3 flex items-center">
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Subtarefas ({activity.subtasks?.length})
                </div>
                <div className="space-y-3">
                  {activity.subtasks?.map(subtask => renderActivityItem(subtask, level + 1))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderActivityDetails = () => {
    if (!selectedActivity) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <div className="p-4 bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Eye className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhuma atividade selecionada</h3>
            <p className="text-gray-600">Clique em uma atividade na lista para ver os detalhes</p>
          </div>
        </div>
      );
    }

    const isSubtask = selectedActivity.type === 'subtask' || selectedActivity.type === 'individual_subtask';

    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="border-b pb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${isSubtask ? 'bg-red-100' : 'bg-green-100'}`}>
                {getStatusIcon(selectedActivity.status)}
              </div>
              <span 
                className="px-3 py-1.5 text-xs font-bold rounded-full border-2 shadow-sm"
                style={{ 
                  backgroundColor: getSystemPriorityColor(selectedActivity.priority),
                  color: getSystemPriorityTextColor(selectedActivity.priority)
                }}
              >
                {getPriorityLabel(selectedActivity.priority)}
              </span>
                             <span className={`px-3 py-1.5 text-xs font-bold rounded-full border-2 shadow-sm ${selectedActivity.type === 'card' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'}`}>
                 {selectedActivity.type === 'card' ? 'Tarefa' : 'Subtarefa'}
               </span>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Edit3 className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ExternalLink className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{selectedActivity.title}</h2>
        </div>

        {/* Description */}
        {selectedActivity.description && (
          <div className="bg-gradient-to-r from-slate-50 via-green-50 to-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-semibold mb-3 flex items-center text-slate-800">
              <div className="p-1.5 bg-gradient-to-br from-green-500 to-green-600 rounded-lg mr-2">
                <FileText className="w-4 h-4 text-white" />
              </div>
              Descrição
            </h3>
            <p className="text-slate-700 leading-relaxed">
              {selectedActivity.description}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-6 border-t border-slate-200">
          <button className="flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105">
            <ArrowRight className="w-4 h-4 mr-2" />
            Ir para o Quadro
          </button>
          <button className="flex items-center px-4 py-2 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-lg hover:from-red-500 hover:to-red-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105">
            <ExternalLink className="w-4 h-4 mr-2" />
            Abrir Card
          </button>
          <button className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105">
            <BookOpen className="w-4 h-4 mr-2" />
            Anotações
          </button>
          {selectedActivity.type !== 'card' && (
            <button 
              onClick={() => toggleSubtaskStatus(selectedActivity.id)}
              className={`flex items-center px-4 py-2 text-white rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 ${
                selectedActivity.status === 'completed' 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' 
                  : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
              }`}
            >
              {selectedActivity.status === 'completed' ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Desmarcar
                </>
              ) : (
                <>
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Concluir
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando suas atividades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
             {/* Header */}
       <div className="bg-gradient-to-br from-green-700 via-green-600 to-green-500 text-white shadow-xl">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex items-center justify-between h-20">
             <div className="flex items-center space-x-6">
               <div className="flex items-center space-x-3">
                 <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                   <Target className="w-6 h-6 text-white" />
                 </div>
                 <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                   Minhas Atividades
                 </h1>
               </div>
                               <div className="flex items-center space-x-3">
                  <span className="text-sm bg-gradient-to-r from-green-500/20 to-green-600/20 backdrop-blur-sm px-3 py-1.5 rounded-full font-semibold border border-white/10">
                    {activities.filter(a => a.type === 'card').length} tarefas
                  </span>
                  <span className="text-sm bg-gradient-to-r from-red-400/20 to-red-500/20 backdrop-blur-sm px-3 py-1.5 rounded-full font-semibold border border-white/10">
                    {activities.filter(a => a.type === 'subtask' || a.type === 'individual_subtask').length} subtarefas
                  </span>
                </div>
             </div>
             <div className="flex items-center space-x-3">
               <button
                 onClick={loadActivities}
                 className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
               >
                 <RefreshCw className="w-4 h-4 mr-2" />
                 Atualizar
               </button>
             </div>
           </div>
         </div>
       </div>

      {/* Filters */}
      <div className="bg-gradient-to-r from-slate-50 via-gray-50 to-slate-100 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="🔍 Buscar atividades por título ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 text-lg bg-white/80 backdrop-blur-sm"
              />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 text-lg font-medium appearance-none bg-white/80 backdrop-blur-sm pr-10"
              >
                                 <option value="all">📂 Todos os tipos</option>
                 <option value="cards">Apenas tarefas</option>
                 <option value="subtasks">Apenas subtarefas</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 text-lg font-medium appearance-none bg-white/80 backdrop-blur-sm pr-10"
              >
                <option value="all">🔄 Todos os status</option>
                <option value="pending">⏳ Pendente</option>
                <option value="in_progress">⚡ Em progresso</option>
                <option value="completed">✅ Concluído</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
            </div>

            {/* Priority Filter */}
            <div className="relative">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as any)}
                className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 text-lg font-medium appearance-none bg-white/80 backdrop-blur-sm pr-10"
              >
                <option value="all">🎯 Todas as prioridades</option>
                <option value="urgent">🚨 Urgente</option>
                <option value="high">⚡ Alta</option>
                <option value="medium">📊 Normal</option>
                <option value="low">✅ Baixa</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Activities List */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-white via-slate-50 to-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-100 via-green-50 to-slate-100 p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                                  <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent flex items-center">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg mr-3 shadow-sm">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  Lista de Atividades
                </h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-600 bg-gradient-to-r from-slate-100 to-slate-200 px-3 py-1 rounded-full border border-slate-300 shadow-sm">
                      {filteredActivities.length} resultado{filteredActivities.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
              <div className="max-h-[calc(100vh-350px)] overflow-y-auto p-4 bg-gradient-to-br from-slate-50/50 to-white">
                {filteredActivities.length === 0 ? (
                  <div className="flex items-center justify-center h-64 text-slate-500">
                    <div className="text-center">
                      <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <Target className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Nenhuma atividade encontrada</h3>
                      <p className="text-slate-600">Tente ajustar os filtros ou criar novas atividades</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredActivities.map(activity => renderActivityItem(activity))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Activity Details */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-white via-slate-50 to-white rounded-xl shadow-xl border border-slate-200 h-[calc(100vh-350px)] overflow-hidden">
              <div className="bg-gradient-to-r from-slate-100 via-red-50 to-slate-100 p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent flex items-center">
                  <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg mr-3 shadow-sm">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  Detalhes da Atividade
                </h2>
              </div>
              <div className="overflow-y-auto h-full bg-gradient-to-br from-slate-50/50 to-white">
                {renderActivityDetails()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyActivities;
