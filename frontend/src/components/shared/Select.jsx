import React from 'react';
import { HiChevronDown } from 'react-icons/hi';

const Select = ({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  required = false,
  disabled = false,
  error,
  className = "",
  labelClassName = "",
}) => {
  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={name}
          className={`block text-sm font-medium text-white mb-1 ${labelClassName}`}
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`
            w-full rounded-md 
            border border-white/40 
            bg-white/10
            py-2.5 px-3 
            text-white 
            placeholder:text-white/60
            appearance-none
            focus:outline-none 
            focus:ring-2 
            focus:ring-primary-500 
            focus:border-transparent
            disabled:opacity-50
            disabled:cursor-not-allowed
            pr-10
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              className="bg-primary-800"
            >
              {option.label}
            </option>
          ))}
        </select>
        
        <HiChevronDown 
          className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70 pointer-events-none"
        />
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;