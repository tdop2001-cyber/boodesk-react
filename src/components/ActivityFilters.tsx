import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  X,
  Calendar,
  Tag,
  User,
  Target,
  AlertCircle,
  Clock,
  CheckCircle,
  Star,
  Zap,
  RefreshCw,
  Save,
  Download,
  Upload
} from 'lucide-react';
import { ActivityFilter } from '../types/activities';

interface ActivityFiltersProps {
  filters: ActivityFilter;
  onFiltersChange: (filters: ActivityFilter) => void;
  onResetFilters: () => void;
  onSaveFilters?: (name: string) => void;
  onLoadFilters?: (name: string) => void;
  availableCategories?: string[];
  availableUsers?: string[];
  className?: string;
}

const ActivityFilters: React.FC<ActivityFiltersProps> = ({
  filters,
  onFiltersChange,
  onResetFilters,
  onSaveFilters,
  onLoadFilters,
  availableCategories = [],
  availableUsers = [],
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [savedFilters, setSavedFilters] = useState<string[]>([]);
  const [filterName, setFilterName] = useState('');

  // Carregar filtros salvos do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedActivityFilters');
    if (saved) {
      try {
        setSavedFilters(JSON.parse(saved));
      } catch (error) {
        console.error('Erro ao carregar filtros salvos:', error);
      }
    }
  }, []);

  // Salvar filtros no localStorage
  const saveFiltersToStorage = (name: string, filters: ActivityFilter) => {
    try {
      const saved = localStorage.getItem('savedActivityFilters') || '[]';
      const savedFilters = JSON.parse(saved);
      const newSavedFilters = [...savedFilters, name];
      localStorage.setItem('savedActivityFilters', JSON.stringify(newSavedFilters));
      localStorage.setItem(`activityFilter_${name}`, JSON.stringify(filters));
      setSavedFilters(newSavedFilters);
    } catch (error) {
      console.error('Erro ao salvar filtros:', error);
    }
  };

  // Carregar filtros do localStorage
  const loadFiltersFromStorage = (name: string) => {
    try {
      const saved = localStorage.getItem(`activityFilter_${name}`);
      if (saved) {
        const loadedFilters = JSON.parse(saved);
        onFiltersChange(loadedFilters);
      }
    } catch (error) {
      console.error('Erro ao carregar filtros:', error);
    }
  };

  // Aplicar filtro de data
  const getDateFilterOptions = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return [
      { value: 'all', label: 'Todas as datas' },
      { value: 'today', label: 'Vencem hoje' },
      { value: 'tomorrow', label: 'Vencem amanhã' },
      { value: 'week', label: 'Esta semana' },
      { value: 'month', label: 'Este mês' },
      { value: 'overdue', label: 'Atrasadas' }
    ];
  };

  // Aplicar filtro de prioridade
  const getPriorityOptions = () => [
    { value: 'all', label: 'Todas as prioridades', color: 'text-gray-600' },
    { value: 'urgent', label: '🚨 Urgente', color: 'text-red-600' },
    { value: 'high', label: '⚡ Alta', color: 'text-orange-600' },
    { value: 'medium', label: '📊 Normal', color: 'text-yellow-600' },
    { value: 'low', label: '✅ Baixa', color: 'text-green-600' }
  ];

  // Aplicar filtro de status
  const getStatusOptions = () => [
    { value: 'all', label: 'Todos os status', color: 'text-gray-600' },
    { value: 'pending', label: '⏳ Pendente', color: 'text-yellow-600' },
    { value: 'in_progress', label: '⚡ Em progresso', color: 'text-blue-600' },
    { value: 'completed', label: '✅ Concluído', color: 'text-green-600' }
  ];

  // Aplicar filtro de tipo
  const getTypeOptions = () => [
    { value: 'all', label: 'Todos os tipos', color: 'text-gray-600' },
    { value: 'cards', label: '📋 Apenas tarefas', color: 'text-blue-600' },
    { value: 'subtasks', label: '📝 Apenas subtarefas', color: 'text-green-600' }
  ];

  // Aplicar filtro de categoria
  const getCategoryOptions = () => [
    { value: 'all', label: 'Todas as categorias', color: 'text-gray-600' },
    ...availableCategories.map(cat => ({
      value: cat,
      label: cat,
      color: 'text-blue-600'
    }))
  ];

  // Aplicar filtro de usuário
  const getUserOptions = () => [
    { value: 'all', label: 'Todos os usuários', color: 'text-gray-600' },
    ...availableUsers.map(user => ({
      value: user,
      label: user,
      color: 'text-blue-600'
    }))
  ];

  // Contar filtros ativos
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.type !== 'all') count++;
    if (filters.status !== 'all') count++;
    if (filters.priority !== 'all') count++;
    if (filters.category !== 'all') count++;
    if (filters.assignedTo !== 'all') count++;
    if (filters.dueDate !== 'all') count++;
    return count;
  };

  // Limpar filtros
  const clearAllFilters = () => {
    onResetFilters();
  };

  // Aplicar filtro
  const applyFilter = (key: keyof ActivityFilter, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header dos Filtros */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
            <Filter className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Filtros Avançados</h3>
          
          {/* Contador de filtros ativos */}
          {getActiveFiltersCount() > 0 && (
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              {getActiveFiltersCount()} ativo{getActiveFiltersCount() !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Botão para expandir/colapsar */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            {isExpanded ? 'Ocultar' : 'Mostrar'} Filtros
          </button>

          {/* Botão para limpar todos os filtros */}
          {getActiveFiltersCount() > 0 && (
            <button
              onClick={clearAllFilters}
              className="flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-800 transition-colors"
            >
              <X className="w-4 h-4 mr-1" />
              Limpar Tudo
            </button>
          )}

          {/* Botão para salvar filtros */}
          {onSaveFilters && (
            <button
              onClick={() => {
                if (filterName.trim()) {
                  saveFiltersToStorage(filterName.trim(), filters);
                  setFilterName('');
                }
              }}
              className="flex items-center px-3 py-2 text-sm text-green-600 hover:text-green-800 transition-colors"
              disabled={!filterName.trim()}
            >
              <Save className="w-4 h-4 mr-1" />
              Salvar
            </button>
          )}
        </div>
      </div>

      {/* Campo de busca principal */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="🔍 Buscar atividades por título, descrição ou tags..."
          value={filters.searchTerm}
          onChange={(e) => applyFilter('searchTerm', e.target.value)}
          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg bg-white/80 backdrop-blur-sm"
        />
      </div>

      {/* Filtros expandidos */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 bg-gray-50 rounded-xl border border-gray-200">
          {/* Filtro de Tipo */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Tipo de Atividade
            </label>
            <select
              value={filters.type}
              onChange={(e) => applyFilter('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {getTypeOptions().map(option => (
                <option key={option.value} value={option.value} className={option.color}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => applyFilter('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {getStatusOptions().map(option => (
                <option key={option.value} value={option.value} className={option.color}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Prioridade */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <Star className="w-4 h-4 mr-2" />
              Prioridade
            </label>
            <select
              value={filters.priority}
              onChange={(e) => applyFilter('priority', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {getPriorityOptions().map(option => (
                <option key={option.value} value={option.value} className={option.color}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Categoria */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <Tag className="w-4 h-4 mr-2" />
              Categoria
            </label>
            <select
              value={filters.category}
              onChange={(e) => applyFilter('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {getCategoryOptions().map(option => (
                <option key={option.value} value={option.value} className={option.color}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Usuário */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Responsável
            </label>
            <select
              value={filters.assignedTo}
              onChange={(e) => applyFilter('assignedTo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {getUserOptions().map(option => (
                <option key={option.value} value={option.value} className={option.color}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Data */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Data de Vencimento
            </label>
            <select
              value={filters.dueDate}
              onChange={(e) => applyFilter('dueDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {getDateFilterOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Filtros salvos */}
      {savedFilters.length > 0 && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Save className="w-4 h-4 mr-2" />
            Filtros Salvos
          </h4>
          
          <div className="flex flex-wrap gap-2">
            {savedFilters.map((filterName, index) => (
              <button
                key={index}
                onClick={() => loadFiltersFromStorage(filterName)}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
              >
                {filterName}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Campo para salvar filtro */}
      {onSaveFilters && (
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Nome para salvar o filtro atual..."
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={() => {
              if (filterName.trim()) {
                saveFiltersToStorage(filterName.trim(), filters);
                setFilterName('');
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!filterName.trim()}
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar Filtro
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityFilters;
