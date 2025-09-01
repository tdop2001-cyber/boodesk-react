import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Trash2, 
  Calendar, 
  Users, 
  Tag, 
  Flag, 
  CheckSquare, 
  Square,
  Plus,
  Minus,
  Edit,
  MessageSquare,
  Paperclip,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Activity,
  AlertCircle,
  Star,
  Target,
  FolderOpen,
  Link,
  Archive,
  Copy,
  Share2
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { usePermissions } from '../contexts/PermissionContext';
import { useSettings } from '../contexts/SettingsContext';
import { Card, Column } from '../types';
import SubtaskManager, { Subtask } from './SubtaskManager';
import { db } from '../services/database';

interface CardDetailModalProps {
  card: Card;
  columns: Column[];
  allCards: Card[]; // Todos os cards do quadro atual
  onSave: (updatedCard: Card) => void;
  onDelete: (cardId: number) => void;
  onClose: () => void;
}

interface CardHistory {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  details: string;
}

interface CardDependency {
  id: string;
  title: string;
  status: string;
  priority: string;
  requiredStatus?: string; // Status necessário para o card atual progredir
}

interface CardMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

const CardDetailModal: React.FC<CardDetailModalProps> = ({
  card,
  columns,
  allCards,
  onSave,
  onDelete,
  onClose
}) => {
  const { addToast, showPopup } = useToast();
  const { hasPermission } = usePermissions();
  const { cardSettings, getPriorityColor, getPriorityTextColor } = useSettings();

  // Funções locais para cores de prioridade (para uso no DependenciesModal)
  const getLocalPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return '#DC2626'; // red-600
      case 'high': return '#EF4444'; // red-500
      case 'medium': return '#F59E0B'; // amber-500
      case 'low': return '#10B981'; // emerald-500
      default: return '#6B7280'; // gray-500
    }
  };

  const getLocalPriorityTextColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return '#FFFFFF'; // white
      case 'high': return '#FFFFFF'; // white
      case 'medium': return '#FFFFFF'; // white
      case 'low': return '#FFFFFF'; // white
      default: return '#FFFFFF'; // white
    }
  };

  const getPriorityLabel = (priority: string): string => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'Crítica';
      case 'high': return 'Alta';
      case 'medium': return 'Normal';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };
  
  // Estados principais
  const [editedCard, setEditedCard] = useState<Card>(card);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'subtasks' | 'history' | 'dependencies'>('details');
  
  // Estados para campos específicos
  const [includeTime, setIncludeTime] = useState(false);
  const [recurrence, setRecurrence] = useState('none');
  const [goal, setGoal] = useState('');
  const [category, setCategory] = useState('');
  const [importance, setImportance] = useState('normal');
  
  // Estados para membros e dependências
  const [members, setMembers] = useState<CardMember[]>([]);
  const [dependencies, setDependencies] = useState<CardDependency[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);

  // Função para salvar subtarefas no banco de dados
  const saveSubtasksToDatabase = async (updatedSubtasks: Subtask[]) => {
    try {
      // Usar o card_id diretamente se disponível, ou buscar o card no banco
      let cardId = card.card_id;
      if (!cardId) {
        const cardFromDb = await db.getCardById(card.id.toString());
        if (!cardFromDb) {
          console.error('Card não encontrado no banco de dados');
          return;
        }
        cardId = cardFromDb.card_id;
      }

      // Para cada subtarefa, verificar se precisa ser criada, atualizada ou deletada
      for (const subtask of updatedSubtasks) {
        if (subtask.id && subtask.id.startsWith('temp-')) {
          // Nova subtarefa - criar no banco
          const newSubtaskData = {
            card_id: cardId,
            title: subtask.title || '',
            completed: subtask.completed || false,
            due_date: subtask.dueDate || undefined,
            priority: subtask.priority || 'medium',
            importance: subtask.importance || 'normal',
            category: subtask.category || 'Geral',
            estimated_time: (subtask.estimatedTime || 0).toString(),
            tags: subtask.tags || []
          };
          await db.createSubtask(newSubtaskData);
        } else {
          // Subtarefa existente - atualizar no banco
          await db.updateSubtask(parseInt(subtask.id || '0'), {
            title: subtask.title || '',
            completed: subtask.completed || false,
            due_date: subtask.dueDate || undefined,
            priority: subtask.priority || 'medium',
            importance: subtask.importance || 'normal',
            category: subtask.category || 'Geral',
            estimated_time: (subtask.estimatedTime || 0).toString(),
            tags: subtask.tags || []
          });
        }
      }

      // Verificar subtarefas que foram removidas
      const currentSubtaskIds = updatedSubtasks.map(s => s.id);
      const originalSubtasks = await db.getSubtasksForCard(cardId);
      for (const originalSubtask of originalSubtasks) {
        if (!currentSubtaskIds.includes((originalSubtask.id || 0).toString())) {
          // Subtarefa foi removida - deletar do banco
          await db.deleteSubtask(originalSubtask.id || 0);
        }
      }
    } catch (error) {
      console.error('Erro ao salvar subtarefas:', error);
      addToast({
        type: 'error',
        title: 'Erro ao salvar',
        message: 'Erro ao salvar subtarefas no banco de dados.'
      });
    }
  };
  const [history, setHistory] = useState<CardHistory[]>([]);
  
  // Estados para tags
  const [cardTags, setCardTags] = useState<string[]>(card.tags || []);
  const [selectedTag, setSelectedTag] = useState<string>('');
  
  // Estados para Git (modo dev)
  const [gitBranch, setGitBranch] = useState('');
  const [gitCommit, setGitCommit] = useState('');
  const [gitPR, setGitPR] = useState('');
  const [isDevMode] = useState(false);
  
  // Estados para comentários
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  
  // Estados para anexos
  const [attachments, setAttachments] = useState<any[]>([]);
  
  // Estado para modal de dependências
  const [showDependenciesModal, setShowDependenciesModal] = useState(false);

  // Carregar dados reais do Supabase
  useEffect(() => {
    const loadCardData = async () => {
      try {
        // Carregar subtarefas do card
        const cardSubtasks = await db.getSubtasksForCard(card.card_id || card.id.toString());
        setSubtasks(cardSubtasks.map(subtask => ({
          id: (subtask.id || '').toString(),
          title: subtask.title || '',
          completed: subtask.completed || false,
          createdAt: new Date(subtask.created_at || new Date()),
          dueDate: subtask.due_date || undefined,
          priority: (subtask.priority as 'low' | 'medium' | 'high') || 'medium',
          assignedTo: 'Usuário', // Implementar quando tiver campo de usuário
          importance: (subtask.importance as 'normal' | 'low' | 'high' | 'critical') || 'normal',
          category: subtask.category || 'Geral',
          estimatedTime: parseInt(subtask.estimated_time || '0'),
          tags: subtask.tags || [],
          recurrence: 'none'
        })));

        // Carregar atividades do card
        const activities = await db.getActivities(50);
        const cardActivities = activities.filter(activity => activity.card_id === (card.card_id || card.id.toString()));
        
        setHistory(cardActivities.map(activity => ({
          id: activity.id.toString(),
          timestamp: new Date(activity.created_at),
          user: 'Usuário', // Implementar quando tiver campo de usuário
          action: activity.action,
          details: activity.description
        })));

        // Dados vazios por enquanto (implementar quando tiver as tabelas)
        setMembers([]);
        setDependencies([]);
        setComments([]);
        setAttachments([]);
      } catch (error) {
        console.error('Erro ao carregar dados do card:', error);
      }
    };

    if (card.id) {
      loadCardData();
    }
  }, [card.id]);

  const handleSave = () => {
    const updatedCard = {
      ...editedCard,
      members: members.map(m => m.name),
      dependencies: dependencies.map(d => d.title),
      subtasks: subtasks,
      tags: cardTags,
      git_branch: gitBranch,
      git_commit: gitCommit,
      git_pr: gitPR,
      goal,
      category,
      importance,
      recurrence
    };

    onSave(updatedCard);
    setIsEditing(false);
    addToast({
      type: 'success',
      title: 'Card atualizado',
      message: 'As alterações foram salvas com sucesso!'
    });
  };

  const addTagToCard = () => {
    if (selectedTag && !cardTags.includes(selectedTag)) {
      setCardTags([...cardTags, selectedTag]);
      setSelectedTag('');
    }
  };

  const removeTagFromCard = (tagToRemove: string) => {
    setCardTags(cardTags.filter(tag => tag !== tagToRemove));
  };

  const handleDelete = () => {
    showPopup({
      title: 'Excluir Card',
      message: `Tem certeza que deseja excluir o card "${card.title}"? Esta ação não pode ser desfeita.`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      onConfirm: () => {
        onDelete(card.id);
      },
      onCancel: () => {}
    });
  };

  const addMember = (memberName: string) => {
    if (memberName && !members.find(m => m.name === memberName)) {
      const newMember: CardMember = {
        id: Date.now().toString(),
        name: memberName,
        avatar: memberName.split(' ').map(n => n[0]).join(''),
        role: 'Membro'
      };
      setMembers([...members, newMember]);
    }
  };

  const removeMember = (memberId: string) => {
    setMembers(members.filter(m => m.id !== memberId));
  };

  const addDependency = (dependencyTitle: string) => {
    if (dependencyTitle && !dependencies.find(d => d.title === dependencyTitle)) {
      const newDependency: CardDependency = {
        id: Date.now().toString(),
        title: dependencyTitle,
        status: 'Pendente',
        priority: 'Média'
      };
      setDependencies([...dependencies, newDependency]);
    }
  };

  const removeDependency = (dependencyId: string) => {
    setDependencies(dependencies.filter(d => d.id !== dependencyId));
  };

  const addComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now().toString(),
        user: 'Usuário Atual',
        text: newComment,
        timestamp: new Date()
      };
      setComments([...comments, comment]);
      setNewComment('');
    }
  };



  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'concluído': return 'text-green-600 bg-green-50 border-green-200';
      case 'em progresso': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pendente': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div 
        className="bg-white rounded-2xl w-full max-w-[95vw] h-[95vh] flex flex-col shadow-2xl border-4"
        style={{ borderColor: getPriorityColor(card.priority) }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-brand-light-gray">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FolderOpen className="w-5 h-5 text-brand-blue" />
              <span className="text-sm text-brand-gray/60">{card.board_name || 'Quadro'}</span>
              <span className="text-brand-gray/60">/</span>
              <span className="text-sm text-brand-gray/60">{card.column_name || 'Lista'}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 text-brand-gray hover:bg-brand-light-gray/30 rounded-lg transition-colors"
              title="Editar"
            >
              <Edit className="w-4 h-4" />
            </button>
            
            {hasPermission('card:delete') && (
              <button
                onClick={handleDelete}
                className="p-2 text-brand-red hover:bg-brand-red/10 rounded-lg transition-colors"
                title="Excluir"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            
            <button
              onClick={onClose}
              className="p-2 text-brand-gray hover:bg-brand-light-gray/30 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
                     <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full p-8 overflow-y-auto">
             
             {/* Coluna Esquerda - Detalhes Principais */}
             <div className="lg:col-span-3 space-y-8">
              
              {/* Título e Descrição */}
              <div className="bg-white rounded-xl border border-brand-light-gray p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-2">Título</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedCard.title}
                        onChange={(e) => setEditedCard({...editedCard, title: e.target.value})}
                        className="w-full p-4 text-lg border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      />
                    ) : (
                      <h2 className="text-2xl font-bold text-brand-gray">{editedCard.title}</h2>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-2">Descrição</label>
                    {isEditing ? (
                      <textarea
                        value={editedCard.description || ''}
                        onChange={(e) => setEditedCard({...editedCard, description: e.target.value})}
                        rows={5}
                        className="w-full p-4 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      />
                    ) : (
                      <p className="text-brand-gray/70 whitespace-pre-wrap">{editedCard.description || 'Sem descrição'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Datas e Recorrência */}
              <div className="bg-white rounded-xl border border-brand-light-gray p-6">
                <h3 className="text-lg font-semibold text-brand-gray mb-4 flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Datas e Recorrência</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-2">Prazo</label>
                    {isEditing ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="date"
                          value={editedCard.due_date ? editedCard.due_date.split('T')[0] : ''}
                          onChange={(e) => setEditedCard({...editedCard, due_date: e.target.value})}
                          className="flex-1 p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        />
                        <button className="p-3 border border-brand-light-gray rounded-xl hover:bg-brand-light-gray/30">
                          <Calendar className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-brand-gray">
                        <Calendar className="w-4 h-4" />
                        <span>{editedCard.due_date ? new Date(editedCard.due_date).toLocaleDateString('pt-BR') : 'Sem prazo'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-2">Recorrência</label>
                    {isEditing ? (
                      <select
                        value={recurrence}
                        onChange={(e) => setRecurrence(e.target.value)}
                        className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      >
                        <option value="none">Nenhuma</option>
                        <option value="daily">Diariamente</option>
                        <option value="weekly">Semanalmente</option>
                        <option value="monthly">Mensalmente</option>
                        <option value="yearly">Anualmente</option>
                      </select>
                    ) : (
                      <span className="text-brand-gray">{recurrence === 'none' ? 'Sem recorrência' : recurrence}</span>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={includeTime}
                        onChange={(e) => setIncludeTime(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm text-brand-gray">Incluir horário</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Atributos */}
              <div className="bg-white rounded-xl border border-brand-light-gray p-6">
                <h3 className="text-lg font-semibold text-brand-gray mb-4 flex items-center space-x-2">
                  <Tag className="w-5 h-5" />
                  <span>Atributos</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-2">Prioridade</label>
                    {isEditing ? (
                      <select
                        value={editedCard.priority}
                        onChange={(e) => setEditedCard({...editedCard, priority: e.target.value as 'low' | 'medium' | 'high'})}
                        className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      >
                        <option value="low">Baixa</option>
                        <option value="medium">Normal</option>
                        <option value="high">Alta</option>
                        <option value="critical">Crítica</option>
                      </select>
                    ) : (
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-medium border"
                        style={{ 
                          backgroundColor: getPriorityColor(editedCard.priority),
                          color: getPriorityTextColor(editedCard.priority)
                        }}
                      >
                        {getPriorityLabel(editedCard.priority)}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-2">Status</label>
                    {isEditing ? (
                      <select
                        value={editedCard.status}
                        onChange={(e) => setEditedCard({...editedCard, status: e.target.value as 'todo' | 'progress' | 'done'})}
                        className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      >
                        <option value="todo">A Fazer</option>
                        <option value="progress">Em Progresso</option>
                        <option value="review">Em Revisão</option>
                        <option value="done">Concluído</option>
                      </select>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(editedCard.status)}`}>
                        {editedCard.status}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-2">Importância</label>
                    {isEditing ? (
                      <select
                        value={importance}
                        onChange={(e) => setImportance(e.target.value)}
                        className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      >
                        <option value="low">Baixa</option>
                        <option value="normal">Normal</option>
                        <option value="high">Alta</option>
                        <option value="critical">Crítica</option>
                      </select>
                    ) : (
                      <span className="text-brand-gray">{importance}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-2">Categoria</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      />
                    ) : (
                      <span className="text-brand-gray">{category || 'Sem categoria'}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-2">Objetivo</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      />
                    ) : (
                      <span className="text-brand-gray">{goal || 'Sem objetivo'}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="bg-white rounded-xl border border-brand-light-gray p-6">
                <h3 className="text-lg font-semibold text-brand-gray mb-4 flex items-center space-x-2">
                  <Tag className="w-5 h-5" />
                  <span>Tags</span>
                </h3>
                
                <div className="space-y-4">
                  {isEditing && (
                    <div className="flex items-center space-x-2">
                      <select
                        value={selectedTag}
                        onChange={(e) => setSelectedTag(e.target.value)}
                        className="flex-1 p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      >
                        <option value="">Selecionar tag...</option>
                        {cardSettings.customTags.map((tag) => (
                          <option key={tag.id} value={tag.name}>
                            {tag.name} ({tag.type})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={addTagToCard}
                        disabled={!selectedTag}
                        className="p-3 bg-brand-blue text-white rounded-xl hover:bg-brand-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {cardTags.map((tag) => (
                      <div key={tag} className="flex items-center space-x-2 bg-brand-light-gray/20 text-brand-gray rounded-lg px-3 py-2 border border-brand-light-gray">
                        <span className="text-sm font-medium">{tag}</span>
                        {isEditing && (
                          <button
                            onClick={() => removeTagFromCard(tag)}
                            className="text-brand-red hover:text-brand-red-dark"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                    {cardTags.length === 0 && (
                      <span className="text-brand-gray/60 text-sm">Nenhuma tag atribuída</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Membros Responsáveis */}
              <div className="bg-white rounded-xl border border-brand-light-gray p-6">
                <h3 className="text-lg font-semibold text-brand-gray mb-4 flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Membros Responsáveis</span>
                </h3>
                
                <div className="space-y-4">
                  {isEditing && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Adicionar membro..."
                        className="flex-1 p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addMember((e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          const input = document.querySelector('input[placeholder="Adicionar membro..."]') as HTMLInputElement;
                          if (input) {
                            addMember(input.value);
                            input.value = '';
                          }
                        }}
                        className="p-3 bg-brand-blue text-white rounded-xl hover:bg-brand-blue-dark transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center space-x-2 bg-brand-light-gray/30 rounded-lg px-3 py-2">
                        <div className="w-6 h-6 bg-brand-blue rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {member.avatar}
                        </div>
                        <span className="text-sm text-brand-gray">{member.name}</span>
                        {isEditing && (
                          <button
                            onClick={() => removeMember(member.id)}
                            className="text-brand-red hover:text-brand-red-dark"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Informações do Sistema */}
              <div className="bg-white rounded-xl border border-brand-light-gray p-6">
                <h3 className="text-lg font-semibold text-brand-gray mb-4">Informações do Sistema</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-brand-gray/60">Data de Criação:</span>
                    <p className="text-brand-gray">{new Date(card.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div>
                    <span className="text-brand-gray/60">Última Atualização:</span>
                    <p className="text-brand-gray">{new Date(card.updated_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div>
                    <span className="text-brand-gray/60">ID do Card:</span>
                    <p className="text-brand-gray">#{card.id}</p>
                  </div>
                  <div>
                    <span className="text-brand-gray/60">Criado por:</span>
                    <p className="text-brand-gray">{card.created_by || 'Sistema'}</p>
                  </div>
                </div>
              </div>

              {/* Git Integration (Dev Mode) */}
              {isDevMode && (
                <div className="bg-white rounded-xl border border-brand-light-gray p-6">
                  <h3 className="text-lg font-semibold text-brand-gray mb-4 flex items-center space-x-2">
                    <GitBranch className="w-5 h-5" />
                    <span>Integração Git</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-brand-gray mb-2">Branch</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={gitBranch}
                          onChange={(e) => setGitBranch(e.target.value)}
                          className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        />
                      ) : (
                        <span className="text-brand-gray">{gitBranch || 'Não configurado'}</span>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-gray mb-2">Commit</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={gitCommit}
                          onChange={(e) => setGitCommit(e.target.value)}
                          className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        />
                      ) : (
                        <span className="text-brand-gray">{gitCommit || 'Não configurado'}</span>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-gray mb-2">Pull Request</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={gitPR}
                          onChange={(e) => setGitPR(e.target.value)}
                          className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        />
                      ) : (
                        <span className="text-brand-gray">{gitPR || 'Não configurado'}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

                         {/* Coluna Direita - Funcionalidades Avançadas */}
             <div className="lg:col-span-1 space-y-8">
              
                             {/* Tabs de Navegação */}
               <div className="bg-white rounded-xl border border-brand-light-gray">
                 <div className="flex border-b border-brand-light-gray overflow-x-auto">
                   {[
                     { id: 'details', label: 'Detalhes', icon: Edit },
                     { id: 'subtasks', label: 'Subtarefas', icon: CheckSquare },
                     { id: 'history', label: 'Histórico', icon: Activity },
                     { id: 'dependencies', label: 'Dependências', icon: Link }
                   ].map((tab) => (
                     <button
                       key={tab.id}
                       onClick={() => setActiveTab(tab.id as any)}
                       className={`flex-shrink-0 flex items-center justify-center space-x-2 px-6 py-3 text-sm font-medium transition-colors min-w-0 ${
                         activeTab === tab.id
                           ? 'text-brand-blue border-b-2 border-brand-blue'
                           : 'text-brand-gray/60 hover:text-brand-gray'
                       }`}
                     >
                       <tab.icon className="w-4 h-4 flex-shrink-0" />
                       <span className="truncate">{tab.label}</span>
                     </button>
                   ))}
                 </div>

                <div className="p-6">
                  {/* Tab: Detalhes */}
                  {activeTab === 'details' && (
                    <div className="space-y-6">
                      {/* Comentários */}
                      <div>
                        <h4 className="text-sm font-medium text-brand-gray mb-3 flex items-center space-x-2">
                          <MessageSquare className="w-4 h-4" />
                          <span>Comentários</span>
                        </h4>
                        
                        <div className="space-y-3 max-h-40 overflow-y-auto">
                          {comments.map((comment) => (
                            <div key={comment.id} className="bg-brand-light-gray/30 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-brand-gray">{comment.user}</span>
                                <span className="text-xs text-brand-gray/60">
                                  {comment.timestamp.toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                              <p className="text-sm text-brand-gray">{comment.text}</p>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center space-x-2 mt-3">
                          <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Adicionar comentário..."
                            className="flex-1 p-2 border border-brand-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-sm"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') addComment();
                            }}
                          />
                          <button
                            onClick={addComment}
                            className="p-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Anexos */}
                      <div>
                        <h4 className="text-sm font-medium text-brand-gray mb-3 flex items-center space-x-2">
                          <Paperclip className="w-4 h-4" />
                          <span>Anexos</span>
                        </h4>
                        
                        <div className="space-y-2">
                          {attachments.map((attachment) => (
                            <div key={attachment.id} className="flex items-center justify-between bg-brand-light-gray/30 rounded-lg p-2">
                              <div className="flex items-center space-x-2">
                                <Paperclip className="w-4 h-4 text-brand-gray/60" />
                                <span className="text-sm text-brand-gray">{attachment.name}</span>
                                <span className="text-xs text-brand-gray/60">({attachment.size})</span>
                              </div>
                              <button className="text-brand-blue hover:text-brand-blue-dark">
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>

                        <button className="w-full mt-3 p-2 border border-dashed border-brand-light-gray rounded-lg text-brand-gray/60 hover:text-brand-gray hover:border-brand-gray transition-colors">
                          <Plus className="w-4 h-4 mx-auto" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Tab: Subtarefas */}
                  {activeTab === 'subtasks' && (
                    <SubtaskManager
                      subtasks={subtasks}
                      onSubtasksChange={(updatedSubtasks) => {
                        setSubtasks(updatedSubtasks);
                        saveSubtasksToDatabase(updatedSubtasks);
                      }}
                      isExpanded={true}
                    />
                  )}

                  {/* Tab: Histórico */}
                  {activeTab === 'history' && (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {history.map((item) => (
                        <div key={item.id} className="flex items-start space-x-3 p-3 bg-brand-light-gray/30 rounded-lg">
                          <div className="w-2 h-2 bg-brand-blue rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-brand-gray">{item.user}</span>
                              <span className="text-xs text-brand-gray/60">
                                {item.timestamp.toLocaleString('pt-BR')}
                              </span>
                            </div>
                            <p className="text-sm text-brand-gray/70">{item.action}</p>
                            <p className="text-xs text-brand-gray/60">{item.details}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tab: Dependências */}
                  {activeTab === 'dependencies' && (
                    <div className="space-y-4">
                      {/* Botão para abrir modal de dependências */}
                      <button
                        onClick={() => setShowDependenciesModal(true)}
                        className="w-full flex items-center justify-center space-x-2 p-3 border border-dashed border-brand-blue text-brand-blue hover:bg-brand-blue/5 rounded-xl transition-colors"
                      >
                        <Link className="w-4 h-4" />
                        <span className="text-sm font-medium">Gerenciar Dependências</span>
                      </button>

                      {isEditing && (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            placeholder="Adicionar dependência..."
                            className="flex-1 p-2 border border-brand-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-sm"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                addDependency((e.target as HTMLInputElement).value);
                                (e.target as HTMLInputElement).value = '';
                              }
                            }}
                          />
                          <button
                            onClick={() => {
                              const input = document.querySelector('input[placeholder="Adicionar dependência..."]') as HTMLInputElement;
                              if (input) {
                                addDependency(input.value);
                                input.value = '';
                              }
                            }}
                            className="p-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {dependencies.map((dependency) => (
                          <div key={dependency.id} className="flex items-center justify-between p-3 bg-brand-light-gray/30 rounded-lg">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-brand-gray truncate">{dependency.title}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(dependency.status)}`}>
                                  {dependency.status}
                                </span>
                                                                 <span 
                                   className="px-2 py-1 rounded-full text-xs font-medium border"
                                   style={{ 
                                     backgroundColor: getLocalPriorityColor(dependency.priority),
                                     color: getLocalPriorityTextColor(dependency.priority)
                                   }}
                                 >
                                   {dependency.priority}
                                 </span>
                              </div>
                            </div>
                            {isEditing && (
                              <button
                                onClick={() => removeDependency(dependency.id)}
                                className="text-brand-red hover:text-brand-red-dark ml-2"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer com Botões */}
        <div className="p-6 border-t border-brand-light-gray bg-white rounded-b-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button className="p-2 text-brand-gray hover:bg-brand-light-gray/30 rounded-lg transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="p-2 text-brand-gray hover:bg-brand-light-gray/30 rounded-lg transition-colors">
                <Copy className="w-4 h-4" />
              </button>
              <button className="p-2 text-brand-gray hover:bg-brand-light-gray/30 rounded-lg transition-colors">
                <Archive className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-brand-gray hover:bg-brand-light-gray/30 border border-brand-light-gray rounded-xl transition-colors"
              >
                Cancelar
              </button>
              
              {isEditing && (
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-brand-blue text-white rounded-xl hover:bg-brand-blue-dark transition-colors flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Dependências */}
      {showDependenciesModal && (
        <DependenciesModal
          currentCard={card}
          allCards={allCards}
          columns={columns}
          onClose={() => setShowDependenciesModal(false)}
          onSave={(dependencies) => {
            // Atualizar dependências do card
            setDependencies(dependencies);
            setShowDependenciesModal(false);
          }}
        />
      )}
    </div>
  );
};

// Componente Modal de Dependências
interface DependenciesModalProps {
  currentCard: Card;
  allCards: Card[];
  columns: Column[];
  onClose: () => void;
  onSave: (dependencies: CardDependency[]) => void;
}

const DependenciesModal: React.FC<DependenciesModalProps> = ({
  currentCard,
  allCards,
  columns,
  onClose,
  onSave
}) => {
  const [selectedDependencies, setSelectedDependencies] = useState<CardDependency[]>([]);
  const [draggedCard, setDraggedCard] = useState<Card | null>(null);

  // Funções locais para cores de prioridade (para uso no DependenciesModal)
  const getLocalPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return '#DC2626'; // red-600
      case 'high': return '#EF4444'; // red-500
      case 'medium': return '#F59E0B'; // amber-500
      case 'low': return '#10B981'; // emerald-500
      default: return '#6B7280'; // gray-500
    }
  };

  const getLocalPriorityTextColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return '#FFFFFF'; // white
      case 'high': return '#FFFFFF'; // white
      case 'medium': return '#FFFFFF'; // white
      case 'low': return '#FFFFFF'; // white
      default: return '#FFFFFF'; // white
    }
  };

  // Filtrar cards que não são o card atual
  const availableCards = allCards.filter(card => card.id !== currentCard.id);

  const handleDragStart = (e: React.DragEvent, card: Card) => {
    setDraggedCard(card);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: number) => {
    e.preventDefault();
    
    if (draggedCard) {
      // Verificar se o card já está na lista de dependências
      const existingDependency = selectedDependencies.find(dep => dep.id === draggedCard.id.toString());
      
      if (existingDependency) {
        // Atualizar a dependência existente
        const updatedDependencies = selectedDependencies.map(dep => 
          dep.id === draggedCard.id.toString() 
            ? { ...dep, requiredStatus: getStatusFromColumn(targetColumnId) }
            : dep
        );
        setSelectedDependencies(updatedDependencies);
      } else {
        // Adicionar nova dependência
        const newDependency: CardDependency = {
          id: draggedCard.id.toString(),
          title: draggedCard.title,
          status: getStatusFromColumn(draggedCard.column_id),
          priority: draggedCard.priority,
          requiredStatus: getStatusFromColumn(targetColumnId)
        };
        setSelectedDependencies([...selectedDependencies, newDependency]);
      }
    }
    
    setDraggedCard(null);
  };

  const getStatusFromColumn = (columnId: number): string => {
    const column = columns.find(col => col.id === columnId);
    switch (column?.name) {
      case 'A Fazer': return 'todo';
      case 'Em Progresso': return 'progress';
      case 'Em Revisão': return 'review';
      case 'Concluído': return 'done';
      default: return 'todo';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-100 text-green-800 border-green-200';
      case 'progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'todo': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const removeDependency = (dependencyId: string) => {
    setSelectedDependencies(selectedDependencies.filter(dep => dep.id !== dependencyId));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-brand-light-gray">
          <div>
            <h2 className="text-xl font-bold text-brand-gray">Gerenciar Dependências</h2>
            <p className="text-sm text-brand-gray/60 mt-1">
              Arraste os cards para definir quando "{currentCard.title}" pode progredir
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-brand-gray hover:bg-brand-light-gray/30 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full p-6">
            
            {/* Coluna Esquerda - Cards Disponíveis */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-brand-gray">Cards Disponíveis</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {availableCards.map((card) => (
                  <div
                    key={card.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, card)}
                    className="bg-white border border-brand-light-gray rounded-lg p-3 cursor-move hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-brand-gray text-sm">{card.title}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(getStatusFromColumn(card.column_id))}`}>
                            {getStatusFromColumn(card.column_id)}
                          </span>
                          <span 
                            className="px-2 py-1 rounded-full text-xs font-medium border"
                            style={{ 
                              backgroundColor: getLocalPriorityColor(card.priority),
                              color: getLocalPriorityTextColor(card.priority)
                            }}
                          >
                            {card.priority}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-brand-gray/60">
                        Arraste para definir dependência
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coluna Direita - Colunas de Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-brand-gray">Definir Status Necessário</h3>
              <div className="space-y-4">
                {columns.map((column) => (
                  <div
                    key={column.id}
                    className="bg-brand-light-gray/30 rounded-lg p-4"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, column.id)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-brand-gray">{column.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(getStatusFromColumn(column.id))}`}>
                        {getStatusFromColumn(column.id)}
                      </span>
                    </div>
                    <div className="min-h-20 bg-white rounded-lg border-2 border-dashed border-brand-light-gray flex items-center justify-center">
                      <p className="text-sm text-brand-gray/60">
                        Arraste um card aqui para definir dependência
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dependências Selecionadas */}
        {selectedDependencies.length > 0 && (
          <div className="border-t border-brand-light-gray p-6">
            <h3 className="text-lg font-semibold text-brand-gray mb-4">Dependências Configuradas</h3>
            <div className="space-y-2">
              {selectedDependencies.map((dependency) => (
                <div key={dependency.id} className="flex items-center justify-between bg-brand-light-gray/30 rounded-lg p-3">
                  <div className="flex-1">
                    <p className="font-medium text-brand-gray">{dependency.title}</p>
                    <p className="text-sm text-brand-gray/60">
                      Deve estar em: <span className="font-medium">{dependency.requiredStatus}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => removeDependency(dependency.id)}
                    className="text-brand-red hover:text-brand-red-dark"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 border-t border-brand-light-gray">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-brand-gray hover:bg-brand-light-gray/30 border border-brand-light-gray rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => onSave(selectedDependencies)}
              className="px-6 py-2 bg-brand-blue text-white rounded-xl hover:bg-brand-blue-dark transition-colors"
            >
              Salvar Dependências
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDetailModal;
