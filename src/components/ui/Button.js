import { forwardRef } from 'react';

const Button = forwardRef(({ 
  children, 
  variant = 'default', // default, primary, danger
  size = 'md', // sm, md, lg
  className = '',
  ...props 
}, ref) => {
  const baseStyles = 'rounded transition-colors';
  const variants = {
    default: 'hover:bg-gray-100 dark:hover:bg-gray-700',
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    danger: 'hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400'
  };
  const sizes = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-1.5',
    lg: 'px-4 py-2'
  };

  return (
    <button 
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
