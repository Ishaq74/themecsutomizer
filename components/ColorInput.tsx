import React from 'react';

interface ColorInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  value: string;
}

export const ColorInput: React.FC<ColorInputProps> = ({ id, value, ...props }) => {
  return (
    <div 
      className="relative flex items-center w-full border rounded-md focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-shadow"
      style={{
        backgroundColor: 'var(--input-bg)',
        borderColor: 'var(--input-border-color)',
      }}
    >
      <div 
        className="w-6 h-6 rounded-md border ml-2" 
        style={{ 
          backgroundColor: value,
          borderColor: 'var(--border-default)' 
        }}
      />
      <input
        id={id}
        type="text"
        value={value}
        {...props}
        className="flex-1 pl-3 pr-10 py-2 font-mono text-sm bg-transparent border-none focus:ring-0"
        style={{ color: 'var(--input-color)' }}
      />
      <input
        type="color"
        value={value}
        onChange={props.onChange}
        className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 p-0 border-none cursor-pointer appearance-none bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none"
        aria-label="Color picker"
      />
    </div>
  );
};