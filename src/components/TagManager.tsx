import React, { useState, useEffect } from 'react';
import { X, Plus, Tag, Edit2, Trash2, Save, RotateCcw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { db } from '../services/database';

interface Tag {
  id: number;
  name: string;
  color: string;
  type: string;
  description?: string;
  created_by?: number;
}

interface TagManagerProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  maxTags?: number;
  showCreateTag?: boolean;
  className?: string;
}

const TagManager: React.FC<TagManagerProps> = ({
  selectedTags,
  onTagsChange,
  maxTags = 10,
  showCreateTag = true,
  className = ''
}) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#6B7280');
  const [newTagType, setNewTagType] = useState('category');
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  // Cores predefinidas para tags
  const tagColors = [
    '#6B7280', '#DC2626', '#EA580C', '#D97706', '#CA8A04',
    '#65A30D', '#16A34A', '#059669', '#0D9488', '#0891B2',
    '#0284C7', '#2563EB', '#4F46E5', '#7C3AED', '#9333EA',
    '#C026D3', '#DB2777', '#E11D48', '#F59E0B', '#10B981'
  ];

  // Carregar tags disponíveis
  const loadAvailableTags = async () => {
    try {
      setLoading(true);
      const tags = await db.getAvailableTags(user?.id);
      setAvailableTags(tags);
    } catch (error) {
      console.error('Erro ao carregar tags:', error);
      addToast({
        type: 'error',
        title: 'Erro',
        message: 'Não foi possível carregar as tags disponíveis'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAvailableTags();
  }, [user?.id]);

  // Adicionar tag selecionada
  const handleAddTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      addToast({
        type: 'warning',
        title: 'Tag já adicionada',
        message: 'Esta tag já foi adicionada ao item'
      });
      return;
    }

    if (selectedTags.length >= maxTags) {
      addToast({
        type: 'warning',
        title: 'Limite de tags',
        message: `Você pode adicionar no máximo ${maxTags} tags`
      });
      return;
    }

    onTagsChange([...selectedTags, tagName]);
    setShowTagSelector(false);
  };

  // Remover tag
  const handleRemoveTag = (tagName: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagName));
  };

  // Criar nova tag
  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      addToast({
        type: 'warning',
        title: 'Nome obrigatório',
        message: 'Por favor, insira um nome para a tag'
      });
      return;
    }

    if (!user?.id) {
      addToast({
        type: 'error',
        title: 'Erro',
        message: 'Usuário não autenticado'
      });
      return;
    }

    try {
      setIsCreatingTag(true);
      await db.createCustomTag({
        name: newTagName.trim(),
        color: newTagColor,
        type: newTagType,
        createdBy: user.id
      });

      addToast({
        type: 'success',
        title: 'Tag criada',
        message: 'Tag criada com sucesso!'
      });

      // Limpar campos
      setNewTagName('');
      setNewTagColor('#6B7280');
      setNewTagType('category');

      // Recarregar tags
      await loadAvailableTags();
    } catch (error) {
      console.error('Erro ao criar tag:', error);
      addToast({
        type: 'error',
        title: 'Erro',
        message: 'Não foi possível criar a tag'
      });
    } finally {
      setIsCreatingTag(false);
    }
  };

  // Editar tag
  const handleEditTag = async (tag: Tag) => {
    try {
      await db.updateCustomTag(tag.id, {
        name: tag.name,
        color: tag.color,
        type: tag.type,
        description: tag.description
      });

      addToast({
        type: 'success',
        title: 'Tag atualizada',
        message: 'Tag atualizada com sucesso!'
      });

      setEditingTag(null);
      await loadAvailableTags();
    } catch (error) {
      console.error('Erro ao atualizar tag:', error);
      addToast({
        type: 'error',
        title: 'Erro',
        message: 'Não foi possível atualizar a tag'
      });
    }
  };

  // Deletar tag
  const handleDeleteTag = async (tagId: number) => {
    try {
      await db.deleteCustomTag(tagId);
      addToast({
        type: 'success',
        title: 'Tag removida',
        message: 'Tag removida com sucesso!'
      });
      await loadAvailableTags();
    } catch (error) {
      console.error('Erro ao deletar tag:', error);
      addToast({
        type: 'error',
        title: 'Erro',
        message: 'Não foi possível remover a tag'
      });
    }
  };

  // Obter cor da tag
  const getTagColor = (tagName: string) => {
    const tag = availableTags.find(t => t.name === tagName);
    return tag?.color || '#6B7280';
  };

  // Obter tipo da tag
  const getTagType = (tagName: string) => {
    const tag = availableTags.find(t => t.name === tagName);
    return tag?.type || 'category';
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Tags selecionadas */}
      <div className="flex flex-wrap gap-2">
        {selectedTags.map((tagName) => (
          <div
            key={tagName}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium text-white shadow-sm"
            style={{ backgroundColor: getTagColor(tagName) }}
          >
            <Tag className="w-3 h-3" />
            <span>{tagName}</span>
            <button
              onClick={() => handleRemoveTag(tagName)}
              className="ml-1 hover:bg-black/20 rounded-full p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Botão para adicionar tags */}
      {selectedTags.length < maxTags && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTagSelector(!showTagSelector)}
            className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Tag</span>
          </button>

          {showCreateTag && (
            <button
              onClick={() => setIsCreatingTag(!isCreatingTag)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Tag</span>
            </button>
          )}
        </div>
      )}

      {/* Seletor de tags */}
      {showTagSelector && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Selecionar Tags</h4>
            <button
              onClick={() => setShowTagSelector(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Carregando tags...</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availableTags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {tag.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-0.5 rounded">
                      {tag.type}
                    </span>
                  </div>
                  <button
                    onClick={() => handleAddTag(tag.name)}
                    className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                  >
                    Adicionar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Criar nova tag */}
      {isCreatingTag && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Criar Nova Tag</h4>
            <button
              onClick={() => setIsCreatingTag(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nome da Tag
              </label>
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                placeholder="Ex: Urgente, Bug, Feature..."
                maxLength={30}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo
              </label>
              <select
                value={newTagType}
                onChange={(e) => setNewTagType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="category">Categoria</option>
                <option value="priority">Prioridade</option>
                <option value="status">Status</option>
                <option value="custom">Personalizada</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cor
              </label>
              <div className="flex flex-wrap gap-2">
                {tagColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewTagColor(color)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      newTagColor === color ? 'border-gray-900 dark:border-white' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCreateTag}
                disabled={isCreatingTag || !newTagName.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                {isCreatingTag ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Criar Tag</span>
              </button>
              <button
                onClick={() => setIsCreatingTag(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagManager;
