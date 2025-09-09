
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  Trash2, 
  Plus,
  Calendar,
  Tag,
  Star,
  AlertTriangle,
  Timer,
  Play,
  Pause,
  Square,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

export interface KanbanItem {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  importance?: 'low' | 'normal' | 'high' | 'critical';
  category?: string;
  tags?: string[];
  estimatedTime?: number;
  actualTime?: number;
  dueDate?: string;
  completed: boolean;
  [key: string]: any;
}

export interface KanbanColumnDef {
  id: string;
  title: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface UnifiedKanbanProps {
  items: KanbanItem[];
  columns: KanbanColumnDef[];
  onItemsChange?: (items: KanbanItem[]) => void;
  onItemMove: (itemId: string, newStatus: string) => void;
  onItemAdd?: (item: Omit<KanbanItem, 'id' | 'completed' | 'status'>) => void;
  onItemDelete?: (itemId: string) => void;
  cardId?: string; // ID do card pai para atualizar status
}

interface KanbanColumnProps {
  column: KanbanColumnDef;
  items: KanbanItem[];
  onDelete: (id: string) => void;
  onMoveToColumn: (item: KanbanItem, newStatus: string) => void;
}

interface KanbanItemProps {
  item: KanbanItem;
  onDelete: (id: string) => void;
  onMoveToColumn: (item: KanbanItem, newStatus: string) => void;
}

const UnifiedKanban: React.FC<UnifiedKanbanProps> = ({ 
  items, 
  columns, 
  onItemsChange, 
  onItemMove, 
  onItemAdd, 
  onItemDelete,
  cardId
}) => {
  const [internalItems, setInternalItems] = useState<KanbanItem[]>([]);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (items && Array.isArray(items)) {
      setInternalItems(items);
    }
  }, [items]);

  const getNextAction = (item: KanbanItem) => {
    const currentIndex = columns.findIndex(c => c.id === item.status);
    
    // Se está na coluna "Concluído", mostrar botão para voltar para "A Fazer"
    if (item.status === 'completed') {
      const firstColumn = columns[0]; // "A Fazer"
      return {
        label: `← Voltar para ${firstColumn.title}`,
        icon: ArrowLeft,
        action: firstColumn.id,
        color: 'bg-[#16704E] hover:bg-[#0F5A3A] text-white',
      };
    }
    
    // Para outras colunas, mostrar botão para próxima coluna
    if (currentIndex < columns.length - 1) {
      const nextColumn = columns[currentIndex + 1];
      return {
        label: `Mover para ${nextColumn.title}`,
        icon: ArrowRight,
        action: nextColumn.id,
        color: 'bg-green-500 hover:bg-green-600 text-white',
      };
    }
    return null;
  };

  const getSubtasksByColumn = (columnId: string): KanbanItem[] => {
    return internalItems.filter(item => item.status === columnId);
  };

  const handleMoveItem = async (item: KanbanItem, newStatus: string) => {
    console.log('=== UNIFIED KANBAN - HANDLE MOVE ITEM ===');
    console.log('item:', item);
    console.log('item.id:', item.id, 'type:', typeof item.id);
    console.log('newStatus:', newStatus);
    
    // Chama a função original de movimento
    onItemMove(item.id, newStatus);
    
    // Se temos um cardId, atualiza o status do card baseado nas subtarefas
    if (cardId) {
      try {
        console.log('UnifiedKanban: Atualizando status do card baseado nas subtarefas...');
        const { db } = await import('../services/database');
        await db.updateCardStatusBasedOnSubtasks(cardId);
        console.log('UnifiedKanban: Status do card atualizado com sucesso');
      } catch (error) {
        console.error('UnifiedKanban: Erro ao atualizar status do card:', error);
      }
    }
  };

  const handleAddItem = async () => {
    if (!newItemTitle.trim() || !onItemAdd) return;
    
    setIsAdding(true);
    
    try {
        await onItemAdd({
            title: newItemTitle.trim(),
        });
        setNewItemTitle('');
        addToast({
            type: 'success',
            title: 'Item adicionado',
            message: 'Novo item adicionado com sucesso!'
        });
    } catch (error) {
        console.error('Erro ao criar item:', error);
        addToast({
            type: 'error',
            title: 'Erro',
            message: 'Não foi possível criar o item.'
        });
    } finally {
        setIsAdding(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!onItemDelete) return;
    try {
      await onItemDelete(id);
      addToast({
        type: 'success',
        title: 'Item removido',
        message: 'Item foi removido com sucesso!'
      });
    } catch (error) {
      console.error('Erro ao deletar item:', error);
      addToast({
        type: 'error',
        title: 'Erro',
        message: 'Não foi possível remover o item.'
      });
    }
  };

  const KanbanColumn: React.FC<KanbanColumnProps> = ({ 
    column, 
    items, 
    onDelete, 
    onMoveToColumn
  }) => {
    const columnItems = getSubtasksByColumn(column.id);
    
    return (
      <div className={`${column.bgColor} ${column.borderColor} border-2 rounded-xl p-4 min-h-[200px]`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`${column.color} font-semibold text-lg`}>
            {column.title}
          </h3>
          <span className={`${column.color} bg-white px-2 py-1 rounded-full text-sm font-medium`}>
            {columnItems.length}
          </span>
        </div>
        
        <div className="space-y-3">
          {columnItems.map((item) => (
            <KanbanItemComponent
              key={item.id}
              item={item}
              onDelete={onDelete}
              onMoveToColumn={onMoveToColumn}
            />
          ))}
          
          {columnItems.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <div className="w-12 h-12 mx-auto mb-2 opacity-50">
                <Circle className="w-full h-full" />
              </div>
              <p className="text-sm">Nenhum item</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const KanbanItemComponent: React.FC<KanbanItemProps> = ({ item, onDelete, onMoveToColumn }) => {
    const itemId = item.id;
    
    if (!itemId || itemId === 'undefined' || itemId === 'null' || itemId === '') {
      return null;
    }
    
    const nextAction = getNextAction(item);

    const getPriorityColor = (priority?: string) => {
      switch (priority) {
        case 'high': return 'text-red-500';
        case 'medium': return 'text-yellow-500';
        case 'low': return 'text-green-500';
        default: return 'text-gray-400';
      }
    };

    const formatTime = (minutes?: number) => {
        if (!minutes) return '';
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    return (
      <div className={`bg-white p-4 rounded-xl shadow-sm border-4 border-slate-200 transition-all duration-200 hover:shadow-lg hover:border-slate-300 hover:scale-[1.02] ${item.completed ? 'opacity-75 bg-gradient-to-r from-green-50 to-white' : 'bg-gradient-to-r from-white to-slate-50'}`}>
        <div className="relative group">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className={`font-medium text-slate-800 ${item.completed ? 'line-through' : ''}`}>
                {item.title}
              </h4>
              {item.description && (
                <p className="text-sm text-slate-600 mt-1">
                  {item.description}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {item.priority && (
              <span className="inline-flex items-center text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                <div 
                  className="w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: getPriorityColor(item.priority) }}
                />
                {item.priority === 'urgent' ? 'Urgente' :
                 item.priority === 'high' ? 'Alta' :
                 item.priority === 'medium' ? 'Normal' :
                 item.priority === 'low' ? 'Baixa' :
                 item.priority}
              </span>
            )}
            
            {item.dueDate && (
              <span className="inline-flex items-center text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(item.dueDate).toLocaleDateString()}
              </span>
            )}
            
            {item.estimatedTime && item.estimatedTime > 0 && (
              <span className="inline-flex items-center text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
                <Timer className="w-3 h-3 mr-1" />
                {formatTime(item.estimatedTime)}
              </span>
            )}
          </div>
          
           <div className="flex items-center justify-between pt-3 border-t border-slate-200 bg-slate-50 -mx-4 -mb-4 px-4 pb-4 rounded-b-xl">
             <div className="flex items-center space-x-2">
               
               {nextAction && (
                 <button
                   onClick={(e) => {
                     e.stopPropagation();
                     onMoveToColumn(item, nextAction.action);
                   }}
                   className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md ${nextAction.color}`}
                   title={nextAction.label}
                 >
                   <nextAction.icon className="w-4 h-4" />
                   <span>{nextAction.label}</span>
                 </button>
               )}
               
               {onItemDelete && (
                <button
                    onClick={(e) => {
                    e.stopPropagation();
                    onDelete(itemId);
                    }}
                    className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 rounded-lg border border-slate-200 hover:border-red-200 flex items-center space-x-1"
                    title="Excluir item"
                >
                    <Trash2 className="w-4 h-4" />
                    <span>Excluir</span>
                </button>
               )}
             </div>
             
             <div className="flex items-center space-x-2">
               {item.completed ? (
                 <CheckCircle className="w-5 h-5 text-green-500" />
               ) : item.status === 'in_progress' ? (
                 <Clock className="w-5 h-5 text-orange-500" />
               ) : (
                 <Circle className="w-5 h-5 text-slate-400" />
               )}
             </div>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {onItemAdd && (
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-slate-800">
                Itens ({internalItems.length})
            </h3>
            </div>
            
            <div className="flex items-center space-x-2">
            <input
                type="text"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                placeholder="Novo item..."
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
            />
            <button
                onClick={handleAddItem}
                disabled={isAdding || !newItemTitle.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
            >
                {isAdding ? (
                <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Adicionando...</span>
                </>
                ) : (
                <>
                    <Plus className="w-4 h-4" />
                    <span>Adicionar</span>
                </>
                )}
            </button>
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columns.map((column) => (
          <KanbanColumn 
            key={column.id} 
            column={column} 
            items={internalItems} 
            onDelete={handleDeleteItem}
            onMoveToColumn={handleMoveItem}
          />
        ))}
      </div>
    </div>
  );
};

export default UnifiedKanban;
