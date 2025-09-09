import React from 'react';

interface StarIconCustomProps {
  className?: string;
  size?: number;
}

const StarIconCustom: React.FC<StarIconCustomProps> = ({ className = '', size = 18 }) => {
  // Gerar ID único para evitar conflitos
  const gradientId = `starGradient-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 500 500" 
      className={className}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="50%" stopColor="#0EA5E9" />
          <stop offset="100%" stopColor="#FBBF24" />
        </linearGradient>
      </defs>
      <path 
        fill={`url(#${gradientId})`} 
        stroke="none" 
        d="M 250.5 108 Q 255.3 140.3 267 165.5 Q 278.3 188.7 296.5 205 L 313.5 218 L 338.5 231 L 360.5 239 L 394 247.5 Q 362.7 254.2 335.5 265 L 303 284 Q 304.1 286.7 301.5 286 L 282 306.5 L 267 333.5 L 261 348.5 L 255 369.5 L 251 386.5 L 251 393 Q 247.5 394.1 249 386.5 L 239 348.5 L 232 331.5 L 216 304.5 L 204.5 292 Q 186.6 275.9 163.5 265 Q 136.8 253.8 105 247.5 L 143.5 238 L 170.5 227 L 195.5 212 L 215 193.5 Q 228.4 177.4 237 156.5 L 245 131.5 L 249 114.5 L 249 109.5 L 250.5 108 Z" 
      />
    </svg>
  );
};

export default StarIconCustom;
