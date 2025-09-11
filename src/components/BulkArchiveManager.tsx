import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { db, supabase } from '../services/database';
import {
  Archive,
  Folder,
  CheckSquare,
  Square,
  Filter,
  Search,
  Calendar,
  User,
  Tag,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';

interface BulkArchiveManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onCardsArchived?: (archivedCount: number) => void;
}

interface CompletedCard {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
  completed_at: string;
  board_name: string;
  column_name: string;
  assigned_to?: number;
  created_by: number;
}

const BulkArchiveManager: React.FC<BulkArchiveManagerProps> = ({
  isOpen,
  onClose,
  onCardsArchived
}) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [completedCards, setCompletedCards] = useState<CompletedCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [archiveFolders, setArchiveFolders] = useState<any[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterBoard, setFilterBoard] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'title' | 'completed_at' | 'priority'>('completed_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCompletedCards();
      loadArchiveFolders();
    }
  }, [isOpen]);

  const loadCompletedCards = async () => {
    try {
      setLoading(true);
      // Buscar cards concluídos que não estão arquivados
      const { data, error } = await supabase
        .from('cards')
        .select(`
          id,
          title,
          description,
          status,
          importance,
          created_at,
          completed_at,
          board_id,
          list_name,
          user_id
        `)
        .eq('status', 'done')
        .eq('is_archived', false)
        .order('completed_at', { ascending: false });

      if (error) {
        throw error;
      }

      const mappedCards = data?.map((card: any) => ({
        id: card.id,
        title: card.title,
        description: card.description || '',
        priority: card.importance || 'medium',
        status: card.status,
        created_at: card.created_at,
        completed_at: card.completed_at,
        board_name: card.board_id || 'Sem Board',
        column_name: card.list_name || 'Sem Coluna',
        assigned_to: card.user_id,
        created_by: card.user_id
      })) || [];

      setCompletedCards(mappedCards);
    } catch (error) {
      console.error('Erro ao carregar cards concluídos:', error);
      addToast({
        type: 'error',
        title: 'Erro ao carregar',
        message: 'Não foi possível carregar os cards concluídos.'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadArchiveFolders = async () => {
    try {
      const folders = await db.getArchiveFolders();
      setArchiveFolders(folders);
    } catch (error) {
      console.error('Erro ao carregar pastas de arquivo:', error);
    }
  };

  const handleArchiveSelected = async () => {
    if (selectedCards.length === 0) {
      addToast({
        type: 'warning',
        title: 'Nenhum card selecionado',
        message: 'Selecione pelo menos um card para arquivar.'
      });
      return;
    }

    if (!selectedFolder) {
      addToast({
        type: 'warning',
        title: 'Pasta não selecionada',
        message: 'Escolha uma pasta de arquivo para os cards.'
      });
      return;
    }

    try {
      setLoading(true);
      await db.archiveCardsBulk(
        selectedCards,
        selectedFolder,
        user?.id || 1,
        'Arquivamento em lote'
      );

      addToast({
        type: 'success',
        title: 'Cards arquivados',
        message: `${selectedCards.length} cards foram arquivados com sucesso!`
      });

      setSelectedCards([]);
      onCardsArchived?.(selectedCards.length);
      loadCompletedCards();
    } catch (error) {
      console.error('Erro ao arquivar cards:', error);
      addToast({
        type: 'error',
        title: 'Erro ao arquivar',
        message: 'Não foi possível arquivar os cards selecionados.'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleCardSelection = (cardId: number) => {
    setSelectedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  const selectAllCards = () => {
    const filteredCards = getFilteredCards();
    setSelectedCards(filteredCards.map(card => card.id));
  };

  const clearSelection = () => {
    setSelectedCards([]);
  };

  const getFilteredCards = () => {
    let filtered = completedCards.filter(card => 
      card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.board_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterPriority !== 'all') {
      filtered = filtered.filter(card => card.priority === filterPriority);
    }

    if (filterBoard !== 'all') {
      filtered = filtered.filter(card => card.board_name === filterBoard);
    }

    // Ordenação
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'completed_at':
          aValue = new Date(a.completed_at);
          bValue = new Date(b.completed_at);
          break;
        case 'priority':
          const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'critical': return 'Crítica';
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return 'Normal';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getUniqueBoards = () => {
    const boards = Array.from(new Set(completedCards.map(card => card.board_name)));
    return boards.sort();
  };

  const filteredCards = getFilteredCards();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Archive className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Arquivamento em Lote</h2>
                <p className="text-purple-100 text-sm">
                  Gerencie cards concluídos em massa
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col h-[calc(95vh-120px)]">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar cards concluídos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                  />
                </div>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filtros</span>
                  {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedCards.length} de {filteredCards.length} selecionado(s)
                </span>
                <button
                  onClick={selectAllCards}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Selecionar Todos
                </button>
                <button
                  onClick={clearSelection}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Limpar
                </button>
              </div>
            </div>

            {/* Filtros */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioridade
                  </label>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todas</option>
                    <option value="critical">Crítica</option>
                    <option value="high">Alta</option>
                    <option value="medium">Média</option>
                    <option value="low">Baixa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Board
                  </label>
                  <select
                    value={filterBoard}
                    onChange={(e) => setFilterBoard(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todos</option>
                    {getUniqueBoards().map(board => (
                      <option key={board} value={board}>{board}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ordenar por
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="completed_at">Data de Conclusão</option>
                    <option value="title">Título</option>
                    <option value="priority">Prioridade</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ordem
                  </label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="desc">Decrescente</option>
                    <option value="asc">Crescente</option>
                  </select>
                </div>
              </div>
            )}

            {/* Ações de Arquivamento */}
            {selectedCards.length > 0 && (
              <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">
                    Arquivar em:
                  </label>
                  <select
                    value={selectedFolder || ''}
                    onChange={(e) => setSelectedFolder(Number(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Escolher pasta...</option>
                    {archiveFolders.map((folder) => (
                      <option key={folder.id} value={folder.id}>
                        {folder.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <button
                  onClick={handleArchiveSelected}
                  disabled={loading || !selectedFolder}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Archive className="w-4 h-4" />
                  <span>Arquivar {selectedCards.length} Card(s)</span>
                </button>
              </div>
            )}
          </div>

          {/* Cards List */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Carregando...</span>
              </div>
            ) : filteredCards.length === 0 ? (
              <div className="text-center py-12">
                <Archive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum card concluído encontrado
                </h3>
                <p className="text-gray-600">
                  {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Cards concluídos aparecerão aqui quando estiverem prontos para arquivamento.'}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredCards.map((card) => (
                  <div
                    key={card.id}
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedCards.includes(card.id)}
                        onChange={() => toggleCardSelection(card.id)}
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 mb-1">
                              {card.title}
                            </h4>
                            {card.description && (
                              <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                                {card.description}
                              </p>
                            )}
                            
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>Concluído: {formatDate(card.completed_at)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Tag className="w-3 h-3" />
                                <span>{card.board_name}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(card.priority)}`}>
                              {getPriorityLabel(card.priority)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkArchiveManager;
