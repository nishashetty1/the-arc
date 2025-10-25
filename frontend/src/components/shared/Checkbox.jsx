import React, { memo, forwardRef } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { FiCheck } from "react-icons/fi";

const CheckboxIcon = memo(({ checked, indeterminate }) => {
  if (!checked && !indeterminate) return null;
  
  return indeterminate ? (
    <div className="h-1.5 w-1.5 rounded-sm bg-white absolute inset-0 m-auto" />
  ) : (
    <FiCheck className="h-3 w-3 text-white" />
  );
});

CheckboxIcon.displayName = "CheckboxIcon";
CheckboxIcon.propTypes = {
  checked: PropTypes.bool,
  indeterminate: PropTypes.bool,
};

const Checkbox = forwardRef(
  (
    {
      id,
      name,
      label,
      checked = false,
      indeterminate = false,
      disabled = false,
      required = false,
      error,
      onChange,
      className,
      size = "md",
      helpText,
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "h-3.5 w-3.5",
      md: "h-4 w-4",
      lg: "h-5 w-5",
    };

    const generatedId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={clsx("flex items-start", className)}>
        <div className="flex items-center h-5">
          <input
            ref={ref}
            id={generatedId}
            name={name}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            required={required}
            onChange={onChange}
            aria-invalid={!!error}
            aria-describedby={helpText ? `${generatedId}-description` : undefined}
            className="sr-only"
          />
          <div
            className={clsx(
              "flex items-center justify-center rounded",
              sizeClasses[size],
              checked || indeterminate
                ? "bg-primary-600"
                : "bg-white border border-gray-300",
              disabled
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer",
              error && "border-red-500",
              !disabled &&
                !error &&
                (checked || indeterminate
                  ? "hover:bg-primary-700"
                  : "hover:border-primary-500")
            )}
            onClick={() => !disabled && onChange && onChange({ target: { checked: !checked } })}
            aria-hidden="true"
          >
            <CheckboxIcon checked={checked} indeterminate={indeterminate} />
          </div>
        </div>
        {label && (
          <label
            htmlFor={generatedId}
            className={clsx(
              "ml-2 text-sm",
              disabled ? "text-gray-400" : "text-gray-700",
              error && "text-red-600"
            )}
          >
            {label}
            {helpText && (
              <p
                id={`${generatedId}-description`}
                className="mt-1 text-xs text-gray-500"
              >
                {helpText}
              </p>
            )}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
Checkbox.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  label: PropTypes.node,
  checked: PropTypes.bool,
  indeterminate: PropTypes.bool,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  error: PropTypes.string,
  onChange: PropTypes.func,
  className: PropTypes.string,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  helpText: PropTypes.node,
};

export default memo(Checkbox);