import React, { useState, useRef, useEffect } from 'react';
import { HiChevronDown } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

const Dropdown = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  disabled = false,
  error,
  className = "",
  labelClassName = "",
  multiple = false,
  searchable = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const filteredOptions = searchable 
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    if (multiple) {
      const newValue = value.includes(option.value)
        ? value.filter(v => v !== option.value)
        : [...value, option.value];
      onChange(newValue);
    } else {
      onChange(option.value);
      setIsOpen(false);
    }
  };

  const getDisplayValue = () => {
    if (!value) return placeholder;
    
    if (multiple) {
      const selectedLabels = options
        .filter(option => value.includes(option.value))
        .map(option => option.label);
      return selectedLabels.join(', ') || placeholder;
    }

    const selectedOption = options.find(option => option.value === value);
    return selectedOption ? selectedOption.label : placeholder;
  };

  return (
    <div className="w-full" ref={dropdownRef}>
      {label && (
        <label className={`block text-sm font-medium text-white mb-1 ${labelClassName}`}>
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full 
            rounded-md 
            border border-white/40 
            bg-white/10
            py-2.5 px-3 
            text-left
            text-white 
            focus:outline-none 
            focus:ring-2 
            focus:ring-primary-500 
            focus:border-transparent
            disabled:opacity-50
            disabled:cursor-not-allowed
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
        >
          <span className={`block truncate ${!value ? 'text-white/60' : ''}`}>
            {getDisplayValue()}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2">
            <HiChevronDown
              className={`h-5 w-5 text-white/70 transition-transform ${
                isOpen ? 'transform rotate-180' : ''
              }`}
            />
          </span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute z-10 mt-1 w-full rounded-md bg-primary-800 shadow-lg"
            >
              {searchable && (
                <div className="p-2">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-md border border-white/40 bg-white/10 py-1.5 px-3 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Search..."
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}

              <div className="max-h-60 overflow-auto">
                {filteredOptions.map((option) => {
                  const isSelected = multiple 
                    ? value.includes(option.value)
                    : value === option.value;

                  return (
                    <div
                      key={option.value}
                      onClick={() => handleSelect(option)}
                      className={`
                        cursor-pointer 
                        select-none 
                        px-3 
                        py-2 
                        text-sm 
                        text-white
                        transition-colors
                        ${isSelected ? 'bg-primary-600' : 'hover:bg-white/10'}
                      `}
                    >
                      {multiple && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="mr-2"
                        />
                      )}
                      {option.label}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};

export default Dropdown;