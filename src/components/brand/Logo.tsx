import React from 'react';

interface LogoProps {
  variant?: 'desktop' | 'laptop' | 'mobile' | 'sidebar' | 'icon-only' | 'app-icon' | 'badge';
  className?: string;
  isDark?: boolean;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'desktop',
  className = '',
  isDark = false,
  onClick,
}) => {
  // Abstract AgriTech Mark: 'A' geometric structure blended with agricultural crop furrow lines and connecting bridge
  const primaryColor = isDark ? '#C0EDD4' : '#002517';
  const secondaryColor = '#0D6C45';
  const accentColor = '#274E3C';
  const trackColor = isDark ? '#9DF1C0' : '#157049';

  const renderIcon = (size = 36) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-200"
      aria-label="AgriTech Brand Icon"
    >
      {/* Abstract 'A' structure with layered agricultural furrow lines & connecting marketplace node */}
      <defs>
        <linearGradient id={`agriGrad-${isDark ? 'dark' : 'light'}`} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor={trackColor} />
          <stop offset="1" stopColor={primaryColor} />
        </linearGradient>
      </defs>

      {/* Furrow / Field curved bands on left side of 'A' */}
      <path
        d="M 6 38 C 12 36, 18 30, 21 24"
        stroke={secondaryColor}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M 6 31 C 13 29, 18 24, 23 18"
        stroke={trackColor}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M 8 23 C 14 20, 20 16, 25 10"
        stroke={secondaryColor}
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Main Arching Highway / Canopy forming 'A' apex and sweeping down to buyer market */}
      <path
        d="M 23 8 L 27 8 C 30 11, 33 16, 35 22 C 37 27, 39 33, 42 38"
        stroke={`url(#agriGrad-${isDark ? 'dark' : 'light'})`}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Connecting Bridge & Triangular Marketplace base (connection) */}
      <path
        d="M 18 38 L 42 38"
        stroke={primaryColor}
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Digital Node / Market Point Dot */}
      <circle cx="28" cy="22" r="2.75" fill={isDark ? '#FFDF9E' : '#C2962A'} />
    </svg>
  );

  if (variant === 'icon-only') {
    return (
      <div 
        onClick={onClick} 
        className={`inline-flex items-center justify-center ${onClick ? 'cursor-pointer hover:opacity-90' : ''} ${className}`}
      >
        {renderIcon(32)}
      </div>
    );
  }

  if (variant === 'app-icon') {
    return (
      <div 
        onClick={onClick}
        className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#002517] p-2.5 shadow-md ${className}`}
      >
        {renderIcon(36)}
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-2 bg-[#E6F0E8] border border-[#C1C8C2]/60 px-3 py-1.5 rounded-full ${className}`}>
        {renderIcon(18)}
        <span className="text-xs font-bold uppercase tracking-wider text-[#002517]">AgriTech Verified</span>
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div 
        onClick={onClick}
        className={`flex items-center gap-3 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      >
        {renderIcon(34)}
        <div className="flex flex-col">
          <div className="flex items-center tracking-tight">
            <span className={`text-[21px] font-extrabold ${isDark ? 'text-white' : 'text-[#002517]'}`}>Agri</span>
            <span className="text-[21px] font-extrabold text-[#0D6C45]">Tech</span>
          </div>
          <span className="text-[9px] font-semibold uppercase tracking-widest text-[#717973] -mt-1">Ecosystem</span>
        </div>
      </div>
    );
  }

  if (variant === 'mobile') {
    return (
      <div 
        onClick={onClick}
        className={`inline-flex items-center gap-2 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      >
        {renderIcon(28)}
        <span className={`text-[19px] font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-[#002517]'}`}>
          Agri<span className="text-[#0D6C45]">Tech</span>
        </span>
      </div>
    );
  }

  // Desktop & Laptop (Default)
  return (
    <div 
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {renderIcon(34)}
      <div className="flex flex-col leading-none">
        <span className={`text-[23px] font-black tracking-tight ${isDark ? 'text-white' : 'text-[#002517]'}`}>
          Agri<span className="text-[#0D6C45]">Tech</span>
        </span>
        <span className="text-[10px] font-medium tracking-wide text-[#717973] mt-0.5">
          From Farm to Buyer
        </span>
      </div>
    </div>
  );
};
