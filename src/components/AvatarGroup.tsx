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
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600', 
      'from-red-500 to-red-600',
      'from-purple-500 to-purple-600',
      'from-yellow-500 to-yellow-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
      'from-teal-500 to-teal-600'
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
                shadow-lg
                hover:scale-110 
                transition-transform duration-200
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
              bg-gradient-to-br from-slate-400 to-slate-500 
              rounded-full 
              flex items-center justify-center 
              text-white 
              font-semibold 
              border-2 border-white 
              shadow-lg
              hover:scale-110 
              transition-transform duration-200
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
