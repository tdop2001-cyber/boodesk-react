import React from 'react';
import { User as UserType } from '../types';

interface AvatarGroupProps {
  members: UserType[];
  maxVisible?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const AvatarGroup: React.FC<AvatarGroupProps> = ({ 
  members, 
  maxVisible = 3, 
  size = 'md',
  className = ''
}) => {
  if (!members || members.length === 0) {
    return null;
  }

  const visibleMembers = members.slice(0, maxVisible);
  const remainingCount = members.length - maxVisible;

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-6 h-6 text-xs';
      case 'lg':
        return 'w-10 h-10 text-sm';
      default:
        return 'w-8 h-8 text-xs';
    }
  };

  const getInitials = (user: UserType) => {
    if (user.username) {
      return user.username.charAt(0).toUpperCase();
    }
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getAvatarColor = (userId: number) => {
    const colors = [
      'from-green-400 to-green-500',
      'from-green-500 to-green-600', 
      'from-emerald-400 to-emerald-500',
      'from-emerald-500 to-emerald-600',
      'from-teal-400 to-teal-500',
      'from-teal-500 to-teal-600',
      'from-lime-400 to-lime-500',
      'from-lime-500 to-lime-600'
    ];
    return colors[userId % colors.length];
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex -space-x-2">
        {visibleMembers.map((member, index) => {
          const initials = getInitials(member);
          const avatarColor = getAvatarColor(member.id);
          
          return (
            <div
              key={member.id}
              className={`
                ${getSizeClasses()} 
                bg-gradient-to-br ${avatarColor} 
                rounded-full 
                flex items-center justify-center 
                text-white 
                font-semibold 
                border-2 border-white 
                shadow-md
                hover:scale-105 
                transition-all duration-200
                cursor-pointer
                relative
                z-10
              `}
              style={{ zIndex: visibleMembers.length - index }}
              title={`${member.username || member.email || `Usuário ${member.id}`}`}
            >
              {initials}
            </div>
          );
        })}
        
        {remainingCount > 0 && (
          <div 
            className={`
              ${getSizeClasses()} 
              bg-gradient-to-br from-green-300 to-green-400 
              rounded-full 
              flex items-center justify-center 
              text-white 
              font-semibold 
              border-2 border-white 
              shadow-md
              hover:scale-105 
              transition-all duration-200
              cursor-pointer
            `}
            title={`+${remainingCount} membros`}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvatarGroup;
