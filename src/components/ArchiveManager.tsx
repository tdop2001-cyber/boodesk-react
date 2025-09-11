import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { db, supabase } from '../services/database';
import ArchiveStats from './ArchiveStats';
import {
  Archive,
  Folder,
  FolderOpen,
  Trash2,
  RotateCcw,
  Settings,
  Clock,
  Calendar,
  User,
  Tag,
  Filter,
  Search,
  Plus,
  CheckSquare,
  Square,
  MoreHorizontal,
  Download,
  Upload,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Info,
  X,
  BarChart3
} from 'lucide-react';

interface ArchiveManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onCardRestored?: (cardId: number) => void;
}

interface ArchiveFolder {
  id: number;
  name: string;
  description: string;
  color: string;
  icon: string;
  created_at: string;
}

interface ArchivedCard {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
  completed_at: string;
  archived_at: string;
  archive_folder_name: string;
  archive_folder_color: string;
  archive_folder_icon: string;
  archived_by_username: string;
  archived_by_name: string;
  board_name: string;
  column_name: string;
}

const ArchiveManager: React.FC<ArchiveManagerProps> = ({
  isOpen,
  onClose,
  onCardRestored
}) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [folders, setFolders] = useState<ArchiveFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [archivedCards, setArchivedCards] = useState<ArchivedCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [autoArchiveSettings, setAutoArchiveSettings] = useState({
    enabled: false,
    archiveAfterDays: 30,
    defaultFolderId: 1
  });
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [newFolder, setNewFolder] = useState({
    name: '',
    description: '',
    color: '#6B7280',
    icon: 'folder'
  });

  // Filtros e separação
  const [filters, setFilters] = useState({
    board: '',
    member: '',
    priority: '',
    dateRange: '',
    sortBy: 'archived_at',
    sortOrder: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [groupBy, setGroupBy] = useState<'none' | 'board' | 'member' | 'priority' | 'date'>('none');
  const [boards, setBoards] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);

  // Carregar dados iniciais
  useEffect(() => {
    if (isOpen) {
      loadFolders();
      loadArchivedCards();
      loadAutoArchiveSettings();
      loadBoards();
      loadMembers();
    }
  }, [isOpen]);

  // Carregar cards quando pasta selecionada mudar
  useEffect(() => {
    if (selectedFolder !== null) {
      loadArchivedCards(selectedFolder);
    }
  }, [selectedFolder]);

  const loadFolders = async () => {
    try {
      const foldersData = await db.getArchiveFolders();
      setFolders(foldersData);
    } catch (error) {
      console.error('Erro ao carregar pastas:', error);
      addToast({
        type: 'error',
        title: 'Erro ao carregar pastas',
        message: 'Não foi possível carregar as pastas de arquivo.'
      });
    }
  };

  const loadArchivedCards = async (folderId?: number) => {
    try {
      setLoading(true);
      const cardsData = await db.getArchivedCards(folderId);
      setArchivedCards(cardsData);
    } catch (error) {
      console.error('Erro ao carregar cards arquivados:', error);
      addToast({
        type: 'error',
        title: 'Erro ao carregar cards',
        message: 'Não foi possível carregar os cards arquivados.'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAutoArchiveSettings = async () => {
    try {
      const settings = await db.getAutoArchiveSettings();
      if (settings) {
        setAutoArchiveSettings({
          enabled: settings.auto_archive_enabled,
          archiveAfterDays: settings.archive_after_days,
          defaultFolderId: settings.default_folder_id
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const loadBoards = async () => {
    try {
      const { data, error } = await supabase
        .from('boards')
        .select('board_id, name')
        .order('name');
      
      if (error) throw error;
      setBoards(data || []);
    } catch (error) {
      console.error('Erro ao carregar boards:', error);
    }
  };

  const loadMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, nome_completo')
        .order('nome_completo');
      
      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
    }
  };

  const handleArchiveCard = async (cardId: number, folderId: number) => {
    try {
      setLoading(true);
      await db.archiveCard(cardId, folderId, user?.id || 1, 'Arquivamento manual');
      addToast({
        type: 'success',
        title: 'Card arquivado',
        message: 'Card foi arquivado com sucesso!'
      });
      loadArchivedCards(selectedFolder || undefined);
    } catch (error) {
      console.error('Erro ao arquivar card:', error);
      addToast({
        type: 'error',
        title: 'Erro ao arquivar',
        message: 'Não foi possível arquivar o card.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreCard = async (cardId: number) => {
    try {
      setLoading(true);
      await db.restoreArchivedCard(cardId, user?.id || 1);
      addToast({
        type: 'success',
        title: 'Card restaurado',
        message: 'Card foi restaurado com sucesso!'
      });
      loadArchivedCards(selectedFolder || undefined);
      onCardRestored?.(cardId);
    } catch (error) {
      console.error('Erro ao restaurar card:', error);
      addToast({
        type: 'error',
        title: 'Erro ao restaurar',
        message: 'Não foi possível restaurar o card.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkRestore = async () => {
    if (selectedCards.length === 0) return;

    try {
      setLoading(true);
      for (const cardId of selectedCards) {
        await db.restoreArchivedCard(cardId, user?.id || 1);
      }
      addToast({
        type: 'success',
        title: 'Cards restaurados',
        message: `${selectedCards.length} cards foram restaurados com sucesso!`
      });
      setSelectedCards([]);
      loadArchivedCards(selectedFolder || undefined);
    } catch (error) {
      console.error('Erro ao restaurar cards:', error);
      addToast({
        type: 'error',
        title: 'Erro ao restaurar',
        message: 'Não foi possível restaurar os cards selecionados.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolder.name.trim()) {
      addToast({
        type: 'warning',
        title: 'Nome obrigatório',
        message: 'Digite um nome para a pasta.'
      });
      return;
    }

    try {
      setLoading(true);
      await db.createArchiveFolder(
        newFolder.name,
        newFolder.description,
        newFolder.color,
        newFolder.icon,
        user?.id || 1
      );
      addToast({
        type: 'success',
        title: 'Pasta criada',
        message: 'Pasta de arquivo foi criada com sucesso!'
      });
      setNewFolder({ name: '', description: '', color: '#6B7280', icon: 'folder' });
      setShowCreateFolder(false);
      loadFolders();
    } catch (error) {
      console.error('Erro ao criar pasta:', error);
      addToast({
        type: 'error',
        title: 'Erro ao criar pasta',
        message: 'Não foi possível criar a pasta.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAutoArchiveSettings = async () => {
    try {
      setLoading(true);
      await db.setAutoArchiveSettings(
        null, // Configuração global
        autoArchiveSettings.enabled,
        autoArchiveSettings.archiveAfterDays,
        autoArchiveSettings.defaultFolderId,
        user?.id || 1
      );
      addToast({
        type: 'success',
        title: 'Configurações salvas',
        message: 'Configurações de arquivamento automático foram salvas!'
      });
      setShowSettings(false);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      addToast({
        type: 'error',
        title: 'Erro ao salvar',
        message: 'Não foi possível salvar as configurações.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteAutoArchive = async () => {
    try {
      setLoading(true);
      const archivedCount = await db.executeAutoArchive();
      addToast({
        type: 'success',
        title: 'Arquivamento automático executado',
        message: `${archivedCount} cards foram arquivados automaticamente.`
      });
      loadArchivedCards(selectedFolder || undefined);
    } catch (error) {
      console.error('Erro ao executar arquivamento automático:', error);
      addToast({
        type: 'error',
        title: 'Erro ao executar',
        message: 'Não foi possível executar o arquivamento automático.'
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
    const filteredCards = archivedCards.filter(card => 
      card.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSelectedCards(filteredCards.map(card => card.id));
  };

  const clearSelection = () => {
    setSelectedCards([]);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const applyFilters = (cards: ArchivedCard[]) => {
    let filtered = cards.filter(card => 
      card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.board_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Aplicar filtros
    if (filters.board) {
      filtered = filtered.filter(card => card.board_name === filters.board);
    }
    
    if (filters.member) {
      filtered = filtered.filter(card => 
        card.archived_by_username === filters.member || 
        card.archived_by_name === filters.member
      );
    }
    
    if (filters.priority) {
      filtered = filtered.filter(card => card.priority === filters.priority);
    }

    // Aplicar ordenação
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case 'completed_at':
          aValue = new Date(a.completed_at).getTime();
          bValue = new Date(b.completed_at).getTime();
          break;
        default:
          aValue = new Date(a.archived_at).getTime();
          bValue = new Date(b.archived_at).getTime();
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const groupCards = (cards: ArchivedCard[]) => {
    if (groupBy === 'none') return { 'Todos': cards };

    const grouped: { [key: string]: ArchivedCard[] } = {};

    cards.forEach(card => {
      let groupKey = 'Sem categoria';
      
      switch (groupBy) {
        case 'board':
          groupKey = card.board_name || 'Sem Board';
          break;
        case 'member':
          groupKey = card.archived_by_name || card.archived_by_username || 'Sistema';
          break;
        case 'priority':
          groupKey = getPriorityLabel(card.priority);
          break;
        case 'date':
          const date = new Date(card.archived_at);
          groupKey = date.toLocaleDateString('pt-BR', { 
            year: 'numeric', 
            month: 'long' 
          });
          break;
      }

      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(card);
    });

    return grouped;
  };

  const filteredCards = applyFilters(archivedCards);
  const groupedCards = groupCards(filteredCards);

  const clearFilters = () => {
    setFilters({
      board: '',
      member: '',
      priority: '',
      dateRange: '',
      sortBy: 'archived_at',
      sortOrder: 'desc'
    });
    setSearchTerm('');
    setGroupBy('none');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Archive className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Gerenciador de Arquivo</h2>
                <p className="text-purple-100 text-sm">
                  Gerencie cards concluídos e configurações de arquivamento
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowStats(true)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
                title="Estatísticas"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
                title="Configurações"
              >
                <Settings className="w-5 h-5" />
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

        <div className="flex h-[calc(95vh-120px)]">
          {/* Sidebar - Pastas */}
          <div className="w-80 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Pastas de Arquivo</h3>
              <button
                onClick={() => setShowCreateFolder(true)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
                title="Criar nova pasta"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setSelectedFolder(null)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  selectedFolder === null 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Archive className="w-5 h-5" />
                <span className="font-medium">Todos os Cards</span>
              </button>

              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder.id)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    selectedFolder === folder.id 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div 
                    className="w-5 h-5 rounded"
                    style={{ backgroundColor: folder.color }}
                  />
                  <span className="font-medium">{folder.name}</span>
                </button>
              ))}
            </div>

            {/* Ações Rápidas */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Ações Rápidas</h4>
              <div className="space-y-2">
                <button
                  onClick={handleExecuteAutoArchive}
                  disabled={loading}
                  className="w-full flex items-center space-x-2 p-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Clock className="w-4 h-4" />
                  <span>Executar Arquivamento Automático</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar cards arquivados..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                    />
                  </div>
                  
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      showFilters 
                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    <span>Filtros</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">Agrupar por:</label>
                    <select
                      value={groupBy}
                      onChange={(e) => setGroupBy(e.target.value as any)}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="none">Não agrupar</option>
                      <option value="board">Quadro</option>
                      <option value="member">Membro</option>
                      <option value="priority">Prioridade</option>
                      <option value="date">Data</option>
                    </select>
                  </div>
                  
                  {selectedCards.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        {selectedCards.length} selecionado(s)
                      </span>
                      <button
                        onClick={handleBulkRestore}
                        disabled={loading}
                        className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Restaurar</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={selectAllCards}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Selecionar Todos
                  </button>
                  <button
                    onClick={clearSelection}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Limpar Seleção
                  </button>
                </div>
              </div>

              {/* Painel de Filtros */}
              {showFilters && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quadro
                      </label>
                      <select
                        value={filters.board}
                        onChange={(e) => setFilters({...filters, board: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Todos os quadros</option>
                        {boards.map((board) => (
                          <option key={board.board_id} value={board.name}>
                            {board.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Membro
                      </label>
                      <select
                        value={filters.member}
                        onChange={(e) => setFilters({...filters, member: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Todos os membros</option>
                        {members.map((member) => (
                          <option key={member.id} value={member.nome_completo || member.username}>
                            {member.nome_completo || member.username}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prioridade
                      </label>
                      <select
                        value={filters.priority}
                        onChange={(e) => setFilters({...filters, priority: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Todas as prioridades</option>
                        <option value="high">Alta</option>
                        <option value="medium">Média</option>
                        <option value="low">Baixa</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ordenar por
                      </label>
                      <div className="flex space-x-2">
                        <select
                          value={filters.sortBy}
                          onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="archived_at">Data de arquivamento</option>
                          <option value="completed_at">Data de conclusão</option>
                          <option value="title">Título</option>
                          <option value="priority">Prioridade</option>
                        </select>
                        <button
                          onClick={() => setFilters({
                            ...filters, 
                            sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'
                          })}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-100"
                          title={filters.sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}
                        >
                          {filters.sortOrder === 'asc' ? '↑' : '↓'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-600">
                      {filteredCards.length} card(s) encontrado(s)
                    </div>
                    <button
                      onClick={clearFilters}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Limpar todos os filtros
                    </button>
                  </div>
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
                    Nenhum card arquivado encontrado
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Cards concluídos aparecerão aqui quando forem arquivados.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedCards).map(([groupName, cards]) => (
                    <div key={groupName}>
                      {groupBy !== 'none' && (
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="flex items-center space-x-2">
                            {groupBy === 'board' && <Tag className="w-5 h-5 text-blue-600" />}
                            {groupBy === 'member' && <User className="w-5 h-5 text-green-600" />}
                            {groupBy === 'priority' && <AlertCircle className="w-5 h-5 text-yellow-600" />}
                            {groupBy === 'date' && <Calendar className="w-5 h-5 text-purple-600" />}
                            <h3 className="text-lg font-semibold text-gray-900">{groupName}</h3>
                          </div>
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {cards.length} card(s)
                          </span>
                        </div>
                      )}
                      
                      <div className="grid gap-4">
                        {cards.map((card) => (
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
                                        <Archive className="w-3 h-3" />
                                        <span>Arquivado: {formatDate(card.archived_at)}</span>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <User className="w-3 h-3" />
                                        <span>Por: {card.archived_by_name || card.archived_by_username}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(card.priority)}`}>
                                      {getPriorityLabel(card.priority)}
                                    </span>
                                    
                                    <button
                                      onClick={() => handleRestoreCard(card.id)}
                                      disabled={loading}
                                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                      title="Restaurar card"
                                    >
                                      <RotateCcw className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                                
                                <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                                  <div className="flex items-center space-x-1">
                                    <div 
                                      className="w-3 h-3 rounded"
                                      style={{ backgroundColor: card.archive_folder_color }}
                                    />
                                    <span>{card.archive_folder_name}</span>
                                  </div>
                                  {card.board_name && (
                                    <div className="flex items-center space-x-1">
                                      <Tag className="w-3 h-3" />
                                      <span>{card.board_name}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal de Configurações */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Configurações de Arquivamento</h3>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Arquivamento Automático
                    </label>
                    <input
                      type="checkbox"
                      checked={autoArchiveSettings.enabled}
                      onChange={(e) => setAutoArchiveSettings({
                        ...autoArchiveSettings,
                        enabled: e.target.checked
                      })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Arquivar após (dias)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={autoArchiveSettings.archiveAfterDays}
                      onChange={(e) => setAutoArchiveSettings({
                        ...autoArchiveSettings,
                        archiveAfterDays: parseInt(e.target.value)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pasta Padrão
                    </label>
                    <select
                      value={autoArchiveSettings.defaultFolderId}
                      onChange={(e) => setAutoArchiveSettings({
                        ...autoArchiveSettings,
                        defaultFolderId: parseInt(e.target.value)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {folders.map((folder) => (
                        <option key={folder.id} value={folder.id}>
                          {folder.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveAutoArchiveSettings}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Criar Pasta */}
        {showCreateFolder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Criar Nova Pasta</h3>
                  <button
                    onClick={() => setShowCreateFolder(false)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Pasta
                    </label>
                    <input
                      type="text"
                      value={newFolder.name}
                      onChange={(e) => setNewFolder({...newFolder, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Projetos 2024"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição
                    </label>
                    <textarea
                      value={newFolder.description}
                      onChange={(e) => setNewFolder({...newFolder, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Descrição da pasta..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cor
                    </label>
                    <input
                      type="color"
                      value={newFolder.color}
                      onChange={(e) => setNewFolder({...newFolder, color: e.target.value})}
                      className="w-full h-10 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowCreateFolder(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateFolder}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    Criar Pasta
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Estatísticas */}
        <ArchiveStats 
          isOpen={showStats} 
          onClose={() => setShowStats(false)} 
        />
      </div>
    </div>
  );
};

export default ArchiveManager;
