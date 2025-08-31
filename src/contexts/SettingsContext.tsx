import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PriorityColors {
  critical: string;
  high: string;
  medium: string;
  low: string;
}

interface CustomTag {
  id: number;
  name: string;
  type: string;
}

interface CardSettings {
  defaultPriority: 'low' | 'medium' | 'high' | 'critical';
  defaultStatus: string;
  showDueDate: boolean;
  showAssignee: boolean;
  showTags: boolean;
  showAttachments: boolean;
  allowComments: boolean;
  autoAssignToCreator: boolean;
  enableSubtasks: boolean;
  maxTagsPerCard: number;
  priorityColors: PriorityColors;
  customTags: CustomTag[];
}

interface SettingsContextType {
  cardSettings: CardSettings;
  updateCardSettings: (settings: Partial<CardSettings>) => void;
  getPriorityColor: (priority: string) => string;
  getPriorityBgColor: (priority: string) => string;
  getPriorityTextColor: (priority: string) => string;
}

const defaultCardSettings: CardSettings = {
  defaultPriority: 'medium',
  defaultStatus: 'A Fazer',
  showDueDate: true,
  showAssignee: true,
  showTags: true,
  showAttachments: true,
  allowComments: true,
  autoAssignToCreator: false,
  enableSubtasks: true,
  maxTagsPerCard: 5,
  priorityColors: {
    critical: '#DC2626',
    high: '#EF4444',
    medium: '#F59E0B',
    low: '#6B7280'
  },
  customTags: [
    { id: 1, name: 'Urgent', type: 'priority' },
    { id: 2, name: 'Bug', type: 'category' },
    { id: 3, name: 'Feature', type: 'category' },
    { id: 4, name: 'Documentation', type: 'category' }
  ]
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [cardSettings, setCardSettings] = useState<CardSettings>(defaultCardSettings);

  const updateCardSettings = (newSettings: Partial<CardSettings>) => {
    setCardSettings(prev => ({ ...prev, ...newSettings }));
  };

  const getPriorityColor = (priority: string): string => {
    const priorityKey = priority.toLowerCase() as keyof PriorityColors;
    return cardSettings.priorityColors[priorityKey] || cardSettings.priorityColors.medium;
  };

  const getPriorityBgColor = (priority: string): string => {
    const color = getPriorityColor(priority);
    // Converter cor hex para rgba com transparência
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, 0.1)`;
  };

  const getPriorityTextColor = (priority: string): string => {
    const color = getPriorityColor(priority);
    // Converter cor hex para determinar se deve usar texto claro ou escuro
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
  };

  const value: SettingsContextType = {
    cardSettings,
    updateCardSettings,
    getPriorityColor,
    getPriorityBgColor,
    getPriorityTextColor
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
