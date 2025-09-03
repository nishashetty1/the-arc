import React, { memo } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { motion } from "framer-motion";
import { FiLoader } from "react-icons/fi";

const Spinner = memo(({
  size = "md",
  color = "primary",
  className,
  label = "Loading...",
  showLabel = false,
  fullscreen = false,
}) => {
  const sizeClasses = {
    xs: "h-4 w-4",
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  const colorClasses = {
    primary: "text-primary-600",
    secondary: "text-secondary-600",
    white: "text-white",
    gray: "text-gray-600",
    black: "text-black",
    success: "text-green-600",
    danger: "text-red-600",
    warning: "text-amber-500",
    info: "text-blue-600",
  };

  const SpinnerIcon = () => (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ 
        duration: 1, 
        repeat: Infinity, 
        ease: "linear" 
      }}
      className={clsx(
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    >
      <FiLoader className="w-full h-full" />
    </motion.div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-80">
        <SpinnerIcon />
        {showLabel && (
          <span className={clsx(
            "mt-3 text-sm font-medium",
            colorClasses[color]
          )}>
            {label}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={clsx(
      "flex flex-col items-center",
      className
    )}>
      <SpinnerIcon />
      {showLabel && (
        <span className={clsx(
          "mt-2 text-sm font-medium",
          colorClasses[color]
        )}>
          {label}
        </span>
      )}
    </div>
  );
});

Spinner.displayName = "Spinner";
Spinner.propTypes = {
  size: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl"]),
  color: PropTypes.oneOf([
    "primary", 
    "secondary", 
    "white", 
    "gray", 
    "black", 
    "success", 
    "danger", 
    "warning", 
    "info"
  ]),
  className: PropTypes.string,
  label: PropTypes.string,
  showLabel: PropTypes.bool,
  fullscreen: PropTypes.bool,
};

export default Spinner;