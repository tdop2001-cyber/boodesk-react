import React from 'react';
import { X } from 'lucide-react';

interface ResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '7xl';
  showCloseButton?: boolean;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
}

const ResponsiveModal: React.FC<ResponsiveModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = '4xl',
  showCloseButton = true,
  className = '',
  headerClassName = '',
  bodyClassName = ''
}) => {
  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '7xl': 'max-w-7xl'
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidthClasses[maxWidth]} max-h-[95vh] sm:max-h-[90vh] overflow-hidden ${className}`}>
        {/* Header */}
        <div className={`relative bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6 text-white ${headerClassName}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white/30 rounded"></div>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-blue-100 text-xs sm:text-sm">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className={`p-3 sm:p-6 overflow-y-scroll max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-120px)] modal-scroll ${bodyClassName}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default ResponsiveModal;
