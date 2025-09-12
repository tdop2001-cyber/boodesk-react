// Correção para o TagManager - versão simplificada
// Substitua o conteúdo do TagManager.tsx por este código

import React, { useState, useEffect } from 'react';
import { Plus, X, Tag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { db } from '../services/database';

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
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  // Tags predefinidas
  const predefinedTags = [
    'API', 'Frontend', 'Backend', 'Database', 'UI/UX', 'Teste',
    'Bug', 'Feature', 'Documentação', 'Reunião', 'Design',
    'Mobile', 'Web', 'DevOps', 'Segurança', 'Performance'
  ];

  // Carregar tags disponíveis
  const loadAvailableTags = async () => {
    try {
      setLoading(true);
      // Usar tags predefinidas por enquanto
      setAvailableTags(predefinedTags);
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
  }, []);

  // Adicionar tag selecionada
  const handleAddTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      addToast({
        type: 'warning',
        title: 'Tag já existe',
        message: 'Esta tag já foi adicionada ao card'
      });
      return;
    }

    if (selectedTags.length >= maxTags) {
      addToast({
        type: 'warning',
        title: 'Limite atingido',
        message: `Máximo de ${maxTags} tags permitidas`
      });
      return;
    }

    const newTags = [...selectedTags, tagName];
    onTagsChange(newTags);
    setShowTagSelector(false);
  };

  // Remover tag
  const handleRemoveTag = (tagName: string) => {
    const newTags = selectedTags.filter(tag => tag !== tagName);
    onTagsChange(newTags);
  };

  // Criar nova tag
  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      addToast({
        type: 'warning',
        title: 'Nome inválido',
        message: 'Digite um nome para a tag'
      });
      return;
    }

    if (selectedTags.includes(newTagName.trim())) {
      addToast({
        type: 'warning',
        title: 'Tag já existe',
        message: 'Esta tag já foi adicionada ao card'
      });
      return;
    }

    if (selectedTags.length >= maxTags) {
      addToast({
        type: 'warning',
        title: 'Limite atingido',
        message: `Máximo de ${maxTags} tags permitidas`
      });
      return;
    }

    try {
      setIsCreatingTag(true);
      const newTags = [...selectedTags, newTagName.trim()];
      onTagsChange(newTags);
      setNewTagName('');
      setShowTagSelector(false);
      
      addToast({
        type: 'success',
        title: 'Tag criada',
        message: 'Nova tag foi adicionada com sucesso!'
      });
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

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Tags selecionadas */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full border border-blue-200"
            >
              <Tag className="w-3 h-3" />
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Botões de ação */}
      <div className="flex gap-2">
        {showCreateTag && (
          <button
            onClick={() => setShowTagSelector(!showTagSelector)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-300 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar Tag
          </button>
        )}
        
        <button
          onClick={() => {
            setNewTagName('');
            setShowTagSelector(false);
          }}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg border border-blue-300 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Tag
        </button>
      </div>

      {/* Seletor de tags */}
      {showTagSelector && (
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Selecionar tag existente:
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTags
                .filter(tag => !selectedTags.includes(tag))
                .map((tag, index) => (
                  <button
                    key={index}
                    onClick={() => handleAddTag(tag)}
                    className="px-2 py-1 text-xs bg-white hover:bg-blue-50 text-gray-700 rounded border border-gray-300 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Criar nova tag:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Nome da tag"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateTag()}
              />
              <button
                onClick={handleCreateTag}
                disabled={isCreatingTag || !newTagName.trim()}
                className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                {isCreatingTag ? 'Criando...' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagManager;
