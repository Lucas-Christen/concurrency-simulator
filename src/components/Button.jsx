import React from 'react';

const Button = ({ children, onClick, variant = 'primary', icon: Icon, disabled, className = '' }) => {
  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    success: 'bg-green-500 hover:bg-green-600 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    warning: 'bg-orange-500 hover:bg-orange-600 text-white',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${variants[variant]} px-4 py-2 rounded-lg font-semibold 
        flex items-center justify-center gap-2 transition-all disabled:opacity-50 
        disabled:cursor-not-allowed shadow-md hover:shadow-lg w-full ${className}`}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

export default Button;