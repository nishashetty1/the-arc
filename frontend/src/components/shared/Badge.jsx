import React, { memo } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { FiX } from "react-icons/fi";

const variants = {
  primary: "bg-primary-100 text-primary-800",
  secondary: "bg-secondary-100 text-secondary-800",
  success: "bg-green-100 text-green-800",
  danger: "bg-red-100 text-red-800",
  warning: "bg-amber-100 text-amber-800",
  info: "bg-blue-100 text-blue-800",
  gray: "bg-gray-100 text-gray-800",
};

const sizes = {
  sm: "text-xs px-2 py-0.5",
  md: "text-xs px-2.5 py-1",
  lg: "text-sm px-3 py-1.5",
};

const Badge = ({
  children,
  variant = "primary",
  size = "md",
  rounded = false,
  withDot = false,
  onDismiss,
  className,
  icon,
}) => {
  return (
    <span
      className={clsx(
        "inline-flex items-center font-medium",
        variants[variant],
        sizes[size],
        rounded ? "rounded-full" : "rounded",
        className
      )}
    >
      {withDot && (
        <span
          className={clsx(
            "mr-1.5 h-1.5 w-1.5 rounded-full",
            variant === "gray" ? "bg-gray-500" : `bg-${variant}-500`
          )}
        />
      )}
      {icon && <span className="mr-1.5">{icon}</span>}
      {children}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className={clsx(
            "ml-1.5 inline-flex items-center justify-center rounded-full p-0.5",
            "hover:bg-opacity-20 hover:bg-black focus:outline-none"
          )}
          aria-label="Dismiss"
        >
          <FiX className="h-3 w-3" />
        </button>
      )}
    </span>
  );
};

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(Object.keys(variants)),
  size: PropTypes.oneOf(Object.keys(sizes)),
  rounded: PropTypes.bool,
  withDot: PropTypes.bool,
  onDismiss: PropTypes.func,
  className: PropTypes.string,
  icon: PropTypes.node,
};

export default memo(Badge);