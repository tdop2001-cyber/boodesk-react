import React, { useState, useEffect } from 'react';
import { X, Calendar, Users, AlertCircle } from 'lucide-react';
import { CreateSubtaskData } from '../hooks/useSubtasks';
import { db } from '../services/database';

interface SubtaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSubtaskData) => Promise<void>;
  cardId: number;
  currentUserId: number;
  cardMembers?: string[];
}

interface User {
  id: number;
  username: string;
  avatar_url?: string;
}

const SubtaskModal: React.FC<SubtaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  cardId,
  currentUserId,
  cardMembers = []
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'normal',
    due_date: '',
    members: [currentUserId.toString()]
  });
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar usuários disponíveis
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await db.getUsers();
        setAvailableUsers(users);
      } catch (err) {
        console.error('Erro ao carregar usuários:', err);
      }
    };

    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  // Resetar formulário quando modal abrir
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        description: '',
        priority: 'normal',
        due_date: '',
        members: [currentUserId.toString()]
      });
      setError(null);
    }
  }, [isOpen, currentUserId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Título é obrigatório');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSubmit({
        card_id: cardId,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        priority: formData.priority,
        due_date: formData.due_date || undefined,
        members: formData.members,
        created_by: currentUserId
      });

      onClose();
    } catch (err) {
      console.error('Erro ao criar subtarefa:', err);
      setError('Erro ao criar subtarefa');
    } finally {
      setLoading(false);
    }
  };

  const handleMemberToggle = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.includes(userId)
        ? prev.members.filter(id => id !== userId)
        : [...prev.members, userId]
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Nova Subtarefa</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Digite o título da subtarefa"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Digite a descrição da subtarefa"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Prioridade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prioridade
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">Baixa</option>
              <option value="normal">Normal</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </select>
          </div>

          {/* Data de Vencimento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Vencimento
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Calendar size={16} className="absolute right-3 top-3 text-gray-400" />
            </div>
          </div>

          {/* Membros */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users size={16} className="inline mr-1" />
              Membros
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
              {availableUsers.map(user => (
                <label key={user.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={formData.members.includes(user.id.toString())}
                    onChange={() => handleMemberToggle(user.id.toString())}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-2">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.username}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-600">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm text-gray-700">{user.username}</span>
                    {cardMembers.includes(user.id.toString()) && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                        Membro do Card
                      </span>
                    )}
                  </div>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Selecione os membros que participarão desta subtarefa
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Criando...' : 'Criar Subtarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubtaskModal;
