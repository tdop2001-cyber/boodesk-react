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
  
  // Determinar cor da barra de progresso baseada no progresso com gradientes mais modernos
  const getProgressBarColor = () => {
    if (progressPercentage === 0) return 'from-slate-300 via-slate-400 to-slate-500';
    if (progressPercentage < 25) return 'from-red-400 via-red-500 to-red-600';
    if (progressPercentage < 50) return 'from-orange-400 via-orange-500 to-orange-600';
    if (progressPercentage < 75) return 'from-amber-400 via-amber-500 to-amber-600';
    if (progressPercentage < 100) return 'from-blue-400 via-blue-500 to-blue-600';
    return 'from-emerald-400 via-emerald-500 to-emerald-600';
  };

  // Determinar cor do indicador de início
  const getStartIndicatorColor = () => {
    if (progressPercentage === 0) return 'bg-slate-400 dark:bg-slate-600';
    if (progressPercentage < 25) return 'bg-red-500';
    if (progressPercentage < 50) return 'bg-orange-500';
    if (progressPercentage < 75) return 'bg-amber-500';
    if (progressPercentage < 100) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  if (compact) {
    return (
      <div className={`w-full ${className}`}>
        {/* Timeline Track Compacta */}
        <div className="relative w-full h-2 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-full overflow-hidden shadow-inner">
          {/* Progress Bar com efeito de brilho */}
          <div 
            className={`absolute left-0 top-0 h-full bg-gradient-to-r ${getProgressBarColor()} rounded-full transition-all duration-700 ease-out shadow-lg`}
            style={{ width: `${progressPercentage}%` }}
          />
          
          {/* Efeito de brilho na barra de progresso */}
          <div 
            className={`absolute left-0 top-0 h-full bg-gradient-to-r from-white/30 to-transparent rounded-full transition-all duration-700 ease-out`}
            style={{ width: `${progressPercentage}%` }}
          />
          
          {/* Timeline Indicators */}
          <div className="absolute inset-0 flex items-center justify-between px-1">
            {/* Início - Círculo com gradiente */}
            <div className={`w-2.5 h-2.5 ${getStartIndicatorColor()} rounded-full border-2 border-white dark:border-slate-800 shadow-md transition-all duration-500`} />
            
            {/* Estrela de progresso com efeito de brilho */}
            <div 
              className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-700 ease-out drop-shadow-lg"
              style={{ left: `${starPosition}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div className="relative">
                <StarIcon size={14} className="drop-shadow-md" />
                <div className="absolute inset-0 animate-pulse">
                  <StarIcon size={14} className="opacity-30" />
                </div>
              </div>
            </div>
            
            {/* Fim - Círculo com gradiente e efeito de brilho */}
            <div className={`w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 transition-all duration-700 ${
              progressPercentage === 100 
                ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/50 animate-pulse' 
                : 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-md'
            }`} />
          </div>
        </div>
        
        {/* Progress Stats Compacta */}
        {progressPercentage === 100 && (
          <div className="mt-1.5 text-xs text-emerald-600 dark:text-emerald-400 text-center font-semibold animate-pulse">
            ✓ Concluído!
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Timeline Track */}
      <div className="relative w-full h-3 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-full overflow-hidden shadow-inner border border-slate-200/50 dark:border-slate-700/50">
        {/* Progress Bar com efeito de brilho */}
        <div 
          className={`absolute left-0 top-0 h-full bg-gradient-to-r ${getProgressBarColor()} rounded-full transition-all duration-700 ease-out shadow-lg`}
          style={{ width: `${progressPercentage}%` }}
        />
        
        {/* Efeito de brilho na barra de progresso */}
        <div 
          className={`absolute left-0 top-0 h-full bg-gradient-to-r from-white/40 to-transparent rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${progressPercentage}%` }}
        />
        
        {/* Timeline Indicators */}
        <div className="absolute inset-0 flex items-center justify-between px-1.5">
          {/* Início - Círculo com gradiente e efeito de brilho */}
          <div className={`w-4 h-4 ${getStartIndicatorColor()} rounded-full border-2 border-white dark:border-slate-800 shadow-lg transition-all duration-500 relative`}>
            <div className="absolute inset-0.5 bg-white/20 rounded-full"></div>
          </div>
          
          {/* Estrela de progresso com efeito de brilho e animação */}
          <div 
            className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-700 ease-out drop-shadow-xl"
            style={{ left: `${starPosition}%`, transform: 'translate(-50%, -50%)' }}
          >
            <div className="relative group">
              <StarIcon size={24} className="drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 animate-pulse">
                <StarIcon size={24} className="opacity-40" />
              </div>
              {/* Efeito de brilho ao redor da estrela */}
              <div className="absolute inset-0 animate-ping">
                <StarIcon size={24} className="opacity-20" />
              </div>
            </div>
          </div>
          
          {/* Fim - Círculo com gradiente e efeito de brilho */}
          <div className={`w-5 h-5 rounded-full border-2 border-white dark:border-slate-800 transition-all duration-700 relative ${
            progressPercentage === 100 
              ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl shadow-emerald-500/50 animate-pulse' 
              : 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg'
          }`}>
            <div className="absolute inset-0.5 bg-white/30 rounded-full"></div>
            {progressPercentage === 100 && (
              <div className="absolute inset-0 animate-ping bg-emerald-400 rounded-full opacity-30"></div>
            )}
          </div>
        </div>
      </div>
      
      {/* Labels */}
      <div className="flex justify-between items-center mt-3 text-sm text-slate-600 dark:text-slate-400">
        <span className="font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">A Fazer</span>
        <div className="flex items-center space-x-2">
          {inProgressSubtasks > 0 && (
            <span className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 text-blue-700 dark:text-blue-300 rounded-full font-medium shadow-sm border border-blue-200 dark:border-blue-700">
              {inProgressSubtasks} em progresso
            </span>
          )}
          {completedSubtasks > 0 && (
            <span className="px-3 py-1.5 bg-gradient-to-r from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/40 text-emerald-700 dark:text-emerald-300 rounded-full font-medium shadow-sm border border-emerald-200 dark:border-emerald-700">
              {completedSubtasks} concluídas
            </span>
          )}
        </div>
        <span className="font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">Concluído</span>
      </div>
      
      {/* Progress Stats */}
      {progressPercentage === 100 && (
        <div className="mt-2 text-sm text-emerald-600 dark:text-emerald-400 text-center font-bold animate-pulse">
          <span className="bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-700">
            ✓ Todas as subtarefas concluídas!
          </span>
        </div>
      )}
    </div>
  );
};

export default SubtaskTimeline;
