import React from 'react';
import { HiChevronDown } from 'react-icons/hi';

const Select = ({
  label,
  name,
  value,
  onChange,
  options,
  children,
  placeholder = "Select an option",
  required = false,
  disabled = false,
  error,
  className = "",
  labelClassName = "",
}) => {
  // Handle onChange to support both event-based and value-based callbacks
  const handleChange = (e) => {
    if (typeof onChange === 'function') {
      // Pass the event object for backwards compatibility
      onChange(e);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={name}
          className={`block text-sm font-medium text-neutral-700 mb-1.5 ${
            required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""
          } ${
            disabled ? "text-neutral-400" : ""
          } ${labelClassName}`}
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          required={required}
          disabled={disabled}
          className={`
            w-full rounded-lg
            border bg-white
            py-2.5 px-4
            text-neutral-900 
            placeholder:text-neutral-400
            appearance-none
            outline-none
            transition-all duration-200
            shadow-soft
            pr-10
            ${error 
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
              : 'border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 hover:border-neutral-400'
            }
            ${disabled 
              ? 'bg-neutral-50 text-neutral-500 cursor-not-allowed border-neutral-200' 
              : 'cursor-pointer'
            }
            ${className}
          `}
        >
          {/* Support children-based options */}
          {children ? (
            children
          ) : (
            <>
              <option value="" disabled className="text-neutral-400">
                {placeholder}
              </option>
              {options && options.map((option) => (
                <option 
                  key={option.value} 
                  value={option.value}
                  className="bg-white text-neutral-900"
                >
                  {option.label}
                </option>
              ))}
            </>
          )}
        </select>
        
        <HiChevronDown 
          className={`absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none ${
            disabled ? 'text-neutral-400' : 'text-neutral-500'
          }`}
        />
      </div>

      {error && (
        <p className="mt-1.5 text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;