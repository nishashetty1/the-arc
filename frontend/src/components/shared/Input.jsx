import React, { memo, forwardRef, useState } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { 
  FiEye, 
  FiEyeOff, 
  FiAlertCircle, 
  FiSearch,
  FiCalendar,
  FiMail,
  FiUser,
  FiPhone
} from "react-icons/fi";

const iconComponents = {
  search: FiSearch,
  calendar: FiCalendar,
  email: FiMail,
  user: FiUser,
  phone: FiPhone
};

const ErrorMessage = memo(({ error }) => {
  if (!error) return null;
  
  return (
    <div className="mt-1.5 flex items-center text-sm text-red-600">
      <FiAlertCircle className="h-3.5 w-3.5 mr-1.5" />
      <span>{error}</span>
    </div>
  );
});

ErrorMessage.displayName = "ErrorMessage";
ErrorMessage.propTypes = {
  error: PropTypes.string
};

const HelpText = memo(({ text }) => {
  if (!text) return null;
  
  return (
    <p className="mt-1.5 text-sm text-neutral-500">{text}</p>
  );
});

HelpText.displayName = "HelpText";
HelpText.propTypes = {
  text: PropTypes.string
};

const InputIcon = memo(({ icon, position = "left" }) => {
  if (!icon) return null;
  
  const Icon = typeof icon === "string" ? iconComponents[icon] : icon;
  
  return (
    <div className={clsx(
      "absolute inset-y-0 flex items-center pointer-events-none text-neutral-500",
      position === "left" ? "left-3" : "right-3"
    )}>
      {React.isValidElement(Icon) ? Icon : <Icon className="w-5 h-5" />}
    </div>
  );
});

InputIcon.displayName = "InputIcon";
InputIcon.propTypes = {
  icon: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.elementType,
    PropTypes.node
  ]),
  position: PropTypes.oneOf(["left", "right"])
};

const Input = forwardRef(({
  id,
  name,
  type = "text",
  label,
  placeholder,
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  disabled = false,
  readOnly = false,
  required = false,
  error,
  helpText,
  className,
  icon,
  iconPosition = "left",
  endIcon,
  fullWidth = false,
  size = "md",
  ...props
}, ref) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && passwordVisible ? "text" : type;
  const generatedId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

  const sizeClasses = {
    sm: "h-9 py-1.5 text-sm",
    md: "h-11 py-2.5 text-base",
    lg: "h-12 py-3 text-lg"
  };

  const iconPaddingClasses = {
    left: icon ? "pl-10" : "",
    right: endIcon ? "pr-10" : "",
    password: isPassword ? "pr-10" : ""
  };

  const togglePassword = () => {
    setPasswordVisible(prev => !prev);
  };

  return (
    <div className={clsx(
      fullWidth ? "w-full" : "max-w-md",
      className
    )}>
      {label && (
        <label 
          htmlFor={generatedId}
          className={clsx(
            "block mb-1.5 text-sm font-medium text-neutral-700",
            required && "after:content-['*'] after:ml-0.5 after:text-red-500",
            disabled && "text-neutral-400"
          )}
        >
          {label}
        </label>
      )}

      <div className="relative">
        <InputIcon icon={icon} position={iconPosition} />
        
        <input
          ref={ref}
          id={generatedId}
          name={name}
          type={inputType}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={helpText ? `${generatedId}-help` : undefined}
          className={clsx(
            "block w-full rounded-lg border bg-white px-4 outline-none transition-all duration-200 shadow-soft",
            sizeClasses[size],
            iconPaddingClasses[iconPosition],
            isPassword && "pr-10",
            error 
              ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-neutral-900" 
              : "border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-neutral-900 hover:border-neutral-400",
            disabled && "bg-neutral-50 text-neutral-500 cursor-not-allowed border-neutral-200",
            readOnly && "bg-neutral-50 cursor-default border-neutral-200",
            "placeholder:text-neutral-400"
          )}
          {...props}
        />
        
        <InputIcon icon={endIcon} position="right" />
        
        {isPassword && (
          <button
            type="button"
            className="absolute inset-y-0 right-3 flex items-center text-neutral-500 hover:text-neutral-700"
            onClick={togglePassword}
            tabIndex="-1"
            aria-label={passwordVisible ? "Hide password" : "Show password"}
          >
            {passwordVisible ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
          </button>
        )}
      </div>

      <ErrorMessage error={error} />
      
      {helpText && !error && (
        <HelpText text={helpText} id={`${generatedId}-help`} />
      )}
    </div>
  );
});

Input.displayName = "Input";
Input.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  type: PropTypes.string,
  label: PropTypes.node,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  required: PropTypes.bool,
  error: PropTypes.string,
  helpText: PropTypes.string,
  className: PropTypes.string,
  icon: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.elementType,
    PropTypes.node
  ]),
  iconPosition: PropTypes.oneOf(["left", "right"]),
  endIcon: PropTypes.oneOfType([
    PropTypes.elementType,
    PropTypes.node
  ]),
  fullWidth: PropTypes.bool,
  size: PropTypes.oneOf(["sm", "md", "lg"])
};

export default memo(Input);