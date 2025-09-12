import React from 'react';
import { CheckCircle, Circle, Clock, Flag, User, Calendar, Edit3 } from 'lucide-react';

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  status?: 'pending' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  assignedTo?: string;
  description?: string;
}

interface SubtaskListProps {
  subtasks: Subtask[];
  onSubtaskClick?: (subtask: Subtask) => void;
  className?: string;
  compact?: boolean;
  showDetails?: boolean;
}

const SubtaskList: React.FC<SubtaskListProps> = ({ 
  subtasks, 
  onSubtaskClick, 
  className = '', 
  compact = false,
  showDetails = false 
}) => {
  if (!subtasks || subtasks.length === 0) {
    return null;
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getPriorityIcon = (priority?: string) => {
    return <Flag className={`w-3 h-3 ${getPriorityColor(priority)}`} />;
  };

  const getStatusColor = (status?: string, completed?: boolean) => {
    if (completed || status === 'completed') return 'text-green-600 bg-green-100';
    if (status === 'in_progress') return 'text-blue-600 bg-blue-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getStatusText = (status?: string, completed?: boolean) => {
    if (completed || status === 'completed') return 'Concluída';
    if (status === 'in_progress') return 'Em Progresso';
    return 'Pendente';
  };

  if (compact) {
    return (
      <div className={`space-y-1 ${className}`}>
        {subtasks.map((subtask) => (
          <div
            key={subtask.id}
            onClick={() => onSubtaskClick?.(subtask)}
            className={`
              flex items-center space-x-2 p-2 rounded-md transition-all duration-200
              ${onSubtaskClick ? 'cursor-pointer hover:bg-gray-50 hover:shadow-sm' : ''}
              ${subtask.completed ? 'opacity-75' : ''}
            `}
          >
            {subtask.completed ? (
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-gray-400 flex-shrink-0" />
            )}
            <span className={`text-sm flex-1 truncate ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
              {subtask.title}
            </span>
            {subtask.priority && (
              <div className="flex-shrink-0">
                {getPriorityIcon(subtask.priority)}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {subtasks.map((subtask) => (
        <div
          key={subtask.id}
          onClick={() => {
            // Aqui você pode adicionar lógica para abrir detalhes da subtask
            // Por enquanto, mantemos o comportamento original
            onSubtaskClick?.(subtask);
          }}
          className={`
            border border-gray-200 rounded-lg p-3 transition-all duration-200
            ${onSubtaskClick ? 'cursor-pointer hover:border-gray-300 hover:shadow-sm' : ''}
            ${subtask.completed ? 'bg-gray-50 border-gray-100' : 'bg-white'}
          `}
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2 flex-1">
              {subtask.completed ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              )}
              <h4 className={`font-medium text-sm ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {subtask.title}
              </h4>
            </div>
            
            {/* Status Badge e Botão Modal */}
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(subtask.status, subtask.completed)}`}>
                {getStatusText(subtask.status, subtask.completed)}
              </span>
              
              {/* Botão para abrir modal de subtasks */}
              {onSubtaskClick && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSubtaskClick(subtask);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  title="Abrir modal de subtarefa"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Description */}
          {showDetails && subtask.description && (
            <p className="text-xs text-gray-600 mt-2 ml-7">
              {subtask.description}
            </p>
          )}

          {/* Details */}
          {showDetails && (
            <div className="flex items-center space-x-4 mt-2 ml-7 text-xs text-gray-500">
              {subtask.priority && (
                <div className="flex items-center space-x-1">
                  {getPriorityIcon(subtask.priority)}
                  <span className="capitalize">{subtask.priority}</span>
                </div>
              )}
              
              {subtask.due_date && (
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(subtask.due_date).toLocaleDateString('pt-BR')}</span>
                </div>
              )}
              
              {subtask.assignedTo && (
                <div className="flex items-center space-x-1">
                  <User className="w-3 h-3" />
                  <span>{subtask.assignedTo}</span>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SubtaskList;
