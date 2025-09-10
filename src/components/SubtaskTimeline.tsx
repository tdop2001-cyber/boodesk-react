import React from 'react';
import StarIcon from './StarIcon';
import { Subtask } from './SubtaskManager';

interface SubtaskTimelineProps {
  subtasks: Subtask[];
  className?: string;
  compact?: boolean;
}

const SubtaskTimeline: React.FC<SubtaskTimelineProps> = ({ subtasks, className = '', compact = false }) => {
  if (!subtasks || subtasks.length === 0) {
    return null;
  }

  const totalSubtasks = subtasks.length;
  const completedSubtasks = subtasks.filter(subtask => subtask.completed).length;
  const inProgressSubtasks = subtasks.filter(subtask => subtask.status === 'in_progress' && !subtask.completed).length;
  const pendingSubtasks = subtasks.filter(subtask => subtask.status === 'pending' && !subtask.completed).length;

  // Calcular posição da estrela baseada no progresso
  const progressPercentage = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
  const starPosition = Math.min(Math.max(progressPercentage, 10), 90); // Entre 10% e 90%
  
  // Determinar cor da barra de progresso baseada no progresso
  const getProgressBarColor = () => {
    if (progressPercentage === 0) return 'from-gray-300 to-gray-400';
    if (progressPercentage < 25) return 'from-red-300 to-red-400';
    if (progressPercentage < 50) return 'from-orange-300 to-orange-400';
    if (progressPercentage < 75) return 'from-yellow-300 to-yellow-400';
    if (progressPercentage < 100) return 'from-blue-300 to-blue-400';
    return 'from-green-300 to-green-400';
  };

  if (compact) {
    return (
      <div className={`w-full ${className}`}>
        {/* Timeline Track Compacta */}
        <div className="relative w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          {/* Progress Bar */}
          <div 
            className={`absolute left-0 top-0 h-full bg-gradient-to-r ${getProgressBarColor()} rounded-full transition-all duration-500 ease-out`}
            style={{ width: `${progressPercentage}%` }}
          />
          
          {/* Timeline Indicators */}
          <div className="absolute inset-0 flex items-center justify-between px-0.5">
            {/* Início - Círculo cinza */}
            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full border border-white dark:border-gray-800" />
            
            {/* Estrela de progresso */}
            <div 
              className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-500 ease-out"
              style={{ left: `${starPosition}%`, transform: 'translate(-50%, -50%)' }}
            >
              <StarIcon size={12} />
            </div>
            
            {/* Fim - Círculo verde */}
            <div className={`w-2.5 h-2.5 rounded-full border border-white dark:border-gray-800 transition-all duration-500 ${
              progressPercentage === 100 ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-green-500'
            }`} />
          </div>
        </div>
        
        {/* Progress Stats Compacta */}
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-500 text-center">
          {completedSubtasks}/{totalSubtasks} ({Math.round(progressPercentage)}%)
          {progressPercentage === 100 && (
            <span className="ml-2 text-green-600 font-medium">✓ Concluído!</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Timeline Track */}
      <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        {/* Progress Bar */}
        <div 
          className={`absolute left-0 top-0 h-full bg-gradient-to-r ${getProgressBarColor()} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${progressPercentage}%` }}
        />
        
        {/* Timeline Indicators */}
        <div className="absolute inset-0 flex items-center justify-between px-1">
          {/* Início - Círculo cinza */}
          <div className="w-3 h-3 bg-gray-400 dark:bg-gray-600 rounded-full border-2 border-white dark:border-gray-800 shadow-sm" />
          
          {/* Estrela de progresso */}
          <div 
            className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-500 ease-out"
            style={{ left: `${starPosition}%`, transform: 'translate(-50%, -50%)' }}
          >
            <StarIcon size={20} />
          </div>
          
          {/* Fim - Círculo verde */}
          <div className={`w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 shadow-sm transition-all duration-500 ${
            progressPercentage === 100 ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-green-500'
          }`} />
        </div>
      </div>
      
      {/* Labels */}
      <div className="flex justify-between items-center mt-2 text-xs text-gray-600 dark:text-gray-400">
        <span className="font-medium">A Fazer</span>
        <div className="flex items-center space-x-2">
          {inProgressSubtasks > 0 && (
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
              {inProgressSubtasks} em progresso
            </span>
          )}
          {completedSubtasks > 0 && (
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
              {completedSubtasks} concluídas
            </span>
          )}
        </div>
        <span className="font-medium">Concluído</span>
      </div>
      
      {/* Progress Stats */}
      <div className="mt-1 text-xs text-gray-500 dark:text-gray-500 text-center">
        {completedSubtasks} de {totalSubtasks} subtarefas concluídas ({Math.round(progressPercentage)}%)
        {progressPercentage === 100 && (
          <span className="ml-2 text-green-600 font-medium">✓ Todas as subtarefas concluídas!</span>
        )}
      </div>
    </div>
  );
};

export default SubtaskTimeline;
