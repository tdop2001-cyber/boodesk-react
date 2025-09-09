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
import { useAuth } from '../contexts/AuthContext';
import { Card, Column, User as UserType } from '../types';
import SubtaskManager, { Subtask } from './SubtaskManager';
import AvatarGroup from './AvatarGroup';
import UnifiedKanban, { KanbanItem as UnifiedKanbanItem, KanbanColumnDef } from './UnifiedKanban';
import SubtaskModal from './SubtaskModal';
import { db } from '../services/database';

interface CardDetailModalProps {
  card: Card;
  columns: Column[];
  allCards: Card[]; // Todos os cards do quadro atual
  onSave: (updatedCard: Card) => void;
  onDelete: (cardNumericId: number) => void;
  onClose: () => void;
}

 
interface CardHistory {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
}

interface CardDependency {
  id: string;
  title: string;
  requiredStatus: string;
  description: string;
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
  const { user } = useAuth();

  const [editedCard, setEditedCard] = useState<Card>(card);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'subtasks' | 'history' | 'dependencies'>('details');
  const [subtaskViewMode, setSubtaskViewMode] = useState<'list' | 'kanban'>('list');
  const [showCreateSubtaskModal, setShowCreateSubtaskModal] = useState(false);
  
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);

  const kanbanColumns: KanbanColumnDef[] = [
    {
      id: 'pending',
      title: 'A Fazer',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'in_progress',
      title: 'Em Progresso',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      id: 'completed',
      title: 'Concluído',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    }
  ];

  const handleSubtaskMove = async (itemId: string, newStatus: string) => {
    const subtask = subtasks.find(s => s.id === itemId);
    if (!subtask) return;

    const numericId = parseInt(itemId);
    if (isNaN(numericId)) {
      addToast({ type: 'error', title: 'Erro', message: 'ID da subtarefa é inválido.' });
      return;
    }

    try {
      await db.updateSubtask(numericId, { status: newStatus });

      const updatedSubtasks = subtasks.map(s => 
        s.id === itemId 
          ? { ...s, status: newStatus as 'pending' | 'in_progress' | 'completed', completed: newStatus === 'completed' }
          : s
      );

      setSubtasks(updatedSubtasks);
      addToast({ type: 'success', title: 'Status atualizado', message: `Subtarefa movida para ${newStatus}` });
    } catch (error) {
      console.error('Erro ao mover subtarefa:', error);
      addToast({ type: 'error', title: 'Erro ao atualizar', message: 'Não foi possível mover a subtarefa.' });
    }
  };

  useEffect(() => {
    const loadCardData = async () => {
      try {
        const cardNumericId = card.card_id || card.id;
        
        if (cardNumericId) {
          const cardSubtasks = await db.getSubtasksForCardByUser(
            Number(cardNumericId), 
            user?.id || 1, 
            String(user?.role || 'member')
          );
          
          const mappedSubtasks = cardSubtasks.map(subtask => {
            let mappedStatus = subtask.status || 'pending';
            if (mappedStatus === 'pending') {
              mappedStatus = 'todo';
            }
            
            return {
              id: (subtask.id || '').toString(),
              title: subtask.title || '',
              description: subtask.description || '',
              completed: subtask.completed || false,
              priority: (subtask.priority || 'medium') as 'low' | 'medium' | 'high',
              dueDate: subtask.due_date || '',
              estimatedTime: 0,
              actualTime: 0,
              importance: 'normal' as 'low' | 'high' | 'normal' | 'critical',
              category: 'Geral',
              tags: [],
              status: mappedStatus as 'pending' | 'in_progress' | 'completed',
              createdAt: new Date()
            };
          });
        
        setSubtasks(mappedSubtasks);
        }

        const users = await db.getUsers();
        setAvailableUsers(users);

      } catch (error) {
        console.error('Erro ao carregar dados do card:', error);
      }
    };

    if (card.id) {
      loadCardData();
    }
  }, [card.id, card.card_id]);

  const handleSave = () => {
    const updatedCard = {
      ...editedCard,
      subtasks: subtasks,
    };
    onSave(updatedCard);
    setIsEditing(false);
    addToast({
      type: 'success',
      title: 'Card atualizado',
      message: 'As alterações foram salvas com sucesso!'
    });
  };

  const handleDelete = () => {
    showPopup({
      title: 'Confirmar Exclusão',
      message: 'Tem certeza que deseja excluir este card? Esta ação não pode ser desfeita.',
      onConfirm: () => {
        onDelete(card.id);
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-brand-light-gray">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-brand-red/10 rounded-lg">
              <Target className="w-6 h-6 text-brand-red" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-brand-gray">Detalhes do Card</h2>
              <p className="text-sm text-brand-gray/60">Gerencie todas as informações do card</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isEditing && (
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Salvar</span>
              </button>
            )}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-2 px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>{isEditing ? 'Cancelar' : 'Editar'}</span>
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center space-x-2 px-4 py-2 bg-brand-red text-white rounded-lg hover:bg-brand-red/90 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Excluir</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-brand-gray/50 hover:text-brand-gray hover:bg-brand-light-gray/30 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex space-x-1 bg-brand-light-gray/30 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'details'
                      ? 'bg-white text-brand-gray shadow-sm'
                      : 'text-brand-gray/60 hover:text-brand-gray'
                  }`}
                >
                  Detalhes
                </button>
                <button
                  onClick={() => setActiveTab('subtasks')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'subtasks'
                      ? 'bg-white text-brand-gray shadow-sm'
                      : 'text-brand-gray/60 hover:text-brand-gray'
                  }`}
                >
                  Subtarefas ({subtasks.length})
                </button>
              </div>

              {activeTab === 'details' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-2">Título</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedCard.title}
                        onChange={(e) => setEditedCard({...editedCard, title: e.target.value})}
                        className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                      />
                    ) : (
                      <h3 className="text-lg font-semibold text-brand-gray">{editedCard.title}</h3>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brand-gray mb-2">Descrição</label>
                    {isEditing ? (
                      <textarea
                        value={editedCard.description}
                        onChange={(e) => setEditedCard({...editedCard, description: e.target.value})}
                        className="w-full p-3 border border-brand-light-gray rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        rows={4}
                      />
                    ) : (
                      <p className="text-brand-gray/70">{editedCard.description || 'Sem descrição'}</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'subtasks' && (
                 <div className="space-y-4">
                       <div className="flex items-center justify-between">
                         <h4 className="text-sm font-medium text-brand-gray">Gerenciamento de Subtarefas</h4>
                         <div className="flex items-center space-x-2">
                           <div className="flex items-center space-x-1 bg-brand-light-gray/30 rounded-lg p-1">
                             <button
                               onClick={() => setSubtaskViewMode('list')}
                               className={`px-3 py-1 text-xs rounded-md transition-colors ${
                                 subtaskViewMode === 'list' 
                                   ? 'bg-white text-brand-gray shadow-sm' 
                                   : 'text-brand-gray/60 hover:text-brand-gray'
                               }`}
                             >
                               Lista
                             </button>
                             <button
                               onClick={() => setSubtaskViewMode('kanban')}
                               className={`px-3 py-1 text-xs rounded-md transition-colors ${
                                 subtaskViewMode === 'kanban' 
                                   ? 'bg-white text-brand-gray shadow-sm' 
                                   : 'text-brand-gray/60 hover:text-brand-gray'
                               }`}
                             >
                               Kanban
                             </button>
                           </div>
                           <button
                             onClick={() => setShowCreateSubtaskModal(true)}
                             className="flex items-center space-x-2 px-3 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 transition-colors text-sm font-medium"
                           >
                             <Plus className="w-4 h-4" />
                             <span>Nova Subtarefa</span>
                           </button>
                         </div>
                       </div>

                       <div className="space-y-3">
                         {subtasks.length === 0 ? (
                           <div className="text-center py-8 text-brand-gray/60">
                             <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                             <p className="text-sm">Nenhuma subtarefa criada ainda</p>
                             <p className="text-xs">Clique em "Nova Subtarefa" para começar</p>
                           </div>
                         ) : subtaskViewMode === 'kanban' ? (
                           <UnifiedKanban
                             columns={kanbanColumns}
                             items={subtasks.map(s => ({
                              ...s, 
                              id: String(s.id), 
                              importance: s.importance as any,
                              status: s.status || 'pending'
                            }))}
                             onItemMove={handleSubtaskMove}
                             cardId={String(card.id)}
                           />
                         ) : (
                           <SubtaskManager
                             subtasks={subtasks}
                             onSubtasksChange={(updatedSubtasks) => {
                               setSubtasks(updatedSubtasks);
                             }}
                             isExpanded={true}
                             cardId={card.id}
                             showSubtasks={true}
                           />
                         )}
                       </div>
                     </div>
                  )}
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-brand-light-gray p-6">
                <h3 className="text-sm font-medium text-brand-gray mb-4">Informações do Sistema</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-brand-gray/60">ID do Card:</span>
                    <span className="text-brand-gray font-mono">{card.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-gray/60">Criado em:</span>
                    <span className="text-brand-gray">{new Date(card.created_at || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-gray/60">Última atualização:</span>
                    <span className="text-brand-gray">{new Date(card.updated_at || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-brand-light-gray p-6">
                <h3 className="text-sm font-medium text-brand-gray mb-4">Membros</h3>
                <AvatarGroup
                  members={availableUsers.filter(user => editedCard.members?.includes(user.id))}
                  maxVisible={5}
                  size="md"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <SubtaskModal
        isOpen={showCreateSubtaskModal}
        onClose={() => setShowCreateSubtaskModal(false)}
        onSubmit={async (data) => {
          try {
            const cardNumericId = card.card_id || card.id;
            if (!cardNumericId) {
              addToast({
                type: 'error',
                title: 'Erro ao criar subtarefa',
                message: 'Não foi possível obter o ID do card.'
              });
              return;
            }

            const newSubtaskData = {
              card_id: typeof cardNumericId === 'string' ? parseInt(cardNumericId) : cardNumericId,
              title: data.title,
              description: data.description || 'Sem descrição',
              priority: data.priority,
              due_date: data.due_date || undefined,
              members: data.members,
              created_by: user?.id || 1
            };
            
            const createdSubtask = await db.createSubtask(newSubtaskData);
            
            if (createdSubtask) {
              let mappedStatus = createdSubtask.status || 'pending';
              if (mappedStatus === 'pending') {
                mappedStatus = 'todo';
              }
              
              setSubtasks(prev => [...prev, {
                id: createdSubtask.id.toString(),
                title: createdSubtask.title,
                description: createdSubtask.description || '',
                completed: createdSubtask.status === 'completed',
                priority: createdSubtask.priority || 'medium',
                dueDate: createdSubtask.due_date || '',
                estimatedTime: 0,
                actualTime: 0,
                importance: 'normal',
                category: 'Geral',
                tags: [],
                status: mappedStatus,
                createdAt: new Date()
              }]);
              
              addToast({
                type: 'success',
                title: 'Subtarefa criada',
                message: 'Subtarefa criada com sucesso!'
              });
            }
          } catch (error) {
            console.error('Erro ao criar subtarefa:', error);
            addToast({
              type: 'error',
              title: 'Erro ao criar subtarefa',
              message: 'Não foi possível criar a subtarefa.'
            });
          }
        }}
        cardId={card.id}
        currentUserId={user?.id || 1}
        cardMembers={(card.members || []).map(id => id.toString())}
      />
    </div>
  );
};

export default CardDetailModal;