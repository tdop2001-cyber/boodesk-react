import React from 'react';

interface StarIconProps {
  className?: string;
  size?: number;
}

const StarIcon: React.FC<StarIconProps> = ({ className = '', size = 16 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      {/* Efeito de brilho externo */}
      <defs>
        <filter id="starGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        
        {/* Gradiente principal da estrela */}
        <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="25%" stopColor="#F59E0B" />
          <stop offset="50%" stopColor="#D97706" />
          <stop offset="75%" stopColor="#B45309" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
        
        {/* Gradiente de brilho */}
        <linearGradient id="starShine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="50%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#FCD34D" />
        </linearGradient>
        
        {/* Gradiente de sombra */}
        <linearGradient id="starShadow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#92400E" />
          <stop offset="100%" stopColor="#451A03" />
        </linearGradient>
      </defs>
      
      {/* Sombra da estrela */}
      <path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill="url(#starShadow)"
        transform="translate(0.5, 0.5)"
        opacity="0.3"
      />
      
      {/* Corpo principal da estrela */}
      <path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill="url(#starGradient)"
        filter="url(#starGlow)"
        stroke="none"
      />
      
      {/* Brilho interno */}
      <path
        d="M12 4L14.2 8.8L19.2 9.4L15.6 12.8L16.4 17.8L12 15.4L7.6 17.8L8.4 12.8L4.8 9.4L9.8 8.8L12 4Z"
        fill="url(#starShine)"
        opacity="0.6"
      />
      
      {/* Ponto de brilho central */}
      <circle
        cx="12"
        cy="12"
        r="1.5"
        fill="#FEF3C7"
        opacity="0.8"
      />
    </svg>
  );
};

export default StarIcon;
