import React, { memo } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";

const Switch = memo(
  ({
    id,
    name,
    checked = false,
    onChange,
    disabled = false,
    label,
    size = "md",
    color = "primary",
    className,
    labelPosition = "right",
    error,
    helpText,
  }) => {
    const generatedId =
      id || `switch-${Math.random().toString(36).substring(2, 9)}`;

    const sizeClasses = {
      sm: {
        switch: "w-8 h-4",
        dot: "h-3 w-3 translate-x-0.5",
        dotChecked: "translate-x-4",
      },
      md: {
        switch: "w-11 h-6",
        dot: "h-5 w-5 translate-x-0.5",
        dotChecked: "translate-x-5",
      },
      lg: {
        switch: "w-14 h-7",
        dot: "h-6 w-6 translate-x-0.5",
        dotChecked: "translate-x-7",
      },
    };

    const colorClasses = {
      primary: "bg-primary-600",
      secondary: "bg-secondary-600",
      success: "bg-green-600",
      danger: "bg-red-600",
      warning: "bg-amber-500",
      info: "bg-blue-600",
    };

    const handleChange = (e) => {
      if (!disabled && onChange) {
        onChange(e);
      }
    };

    const switchEl = (
      <button
        type="button"
        id={generatedId}
        role="switch"
        tabIndex={disabled ? -1 : 0}
        aria-checked={checked}
        aria-labelledby={`${generatedId}-label`}
        className={clsx(
          "relative inline-flex shrink-0 border-2 border-transparent rounded-full cursor-pointer",
          "transition-colors ease-in-out duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-600",
          sizeClasses[size].switch,
          checked ? colorClasses[color] : "bg-gray-200",
          disabled && "opacity-50 cursor-not-allowed",
          error && "ring-2 ring-red-500"
        )}
        onClick={(e) => handleChange({ target: { name, checked: !checked } })}
        disabled={disabled}
      >
        <span
          className={clsx(
            "pointer-events-none inline-block rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200",
            sizeClasses[size].dot,
            checked ? sizeClasses[size].dotChecked : ""
          )}
        />
      </button>
    );

    if (!label) {
      return switchEl;
    }

    return (
      <div className={className}>
        <div
          className={clsx(
            "flex items-center",
            labelPosition === "left"
              ? "flex-row-reverse justify-end"
              : "justify-start"
          )}
        >
          {switchEl}
          <label
            id={`${generatedId}-label`}
            htmlFor={generatedId}
            className={clsx(
              "text-sm font-medium text-gray-700",
              labelPosition === "left" ? "mr-3" : "ml-3",
              disabled && "text-gray-400",
              error && "text-red-600"
            )}
          >
            {label}
          </label>
        </div>

        {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}

        {helpText && !error && (
          <p className="mt-1.5 text-sm text-gray-500">{helpText}</p>
        )}
      </div>
    );
  }
);

Switch.displayName = "Switch";
Switch.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  label: PropTypes.node,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "success",
    "danger",
    "warning",
    "info",
  ]),
  className: PropTypes.string,
  labelPosition: PropTypes.oneOf(["left", "right"]),
  error: PropTypes.string,
  helpText: PropTypes.string,
};

export default Switch;
