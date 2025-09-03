import React, { memo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import clsx from "clsx";
import { 
  FiInfo, 
  FiAlertCircle, 
  FiCheckCircle, 
  FiXCircle,
  FiX
} from "react-icons/fi";

const variants = {
  info: {
    icon: FiInfo,
    className: "bg-blue-50 border-blue-200 text-blue-800"
  },
  warning: {
    icon: FiAlertCircle,
    className: "bg-amber-50 border-amber-200 text-amber-800"
  },
  success: {
    icon: FiCheckCircle,
    className: "bg-green-50 border-green-200 text-green-800"
  },
  error: {
    icon: FiXCircle,
    className: "bg-red-50 border-red-200 text-red-800"
  }
};

const AlertIcon = memo(({ type }) => {
  const Icon = variants[type].icon;
  return <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />;
});

AlertIcon.displayName = "AlertIcon";
AlertIcon.propTypes = {
  type: PropTypes.oneOf(Object.keys(variants)).isRequired
};

const Alert = ({
  type = "info",
  title,
  children,
  className,
  onClose,
  autoClose = false,
  autoCloseTime = 5000,
  showIcon = true
}) => {
  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseTime);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose, autoCloseTime]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={clsx(
          "rounded-md border p-4 flex items-start",
          variants[type].className,
          className
        )}
        role="alert"
        aria-live="assertive"
      >
        {showIcon && (
          <div className="mr-3 pt-0.5">
            <AlertIcon type={type} />
          </div>
        )}
        <div className="flex-1">
          {title && <h3 className="text-sm font-medium mb-1">{title}</h3>}
          {children && <div className="text-sm opacity-90">{children}</div>}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="ml-auto -mt-0.5 -mr-1.5 bg-transparent text-gray-400 hover:text-gray-600 p-1.5 rounded-full"
            aria-label="Close"
          >
            <FiX className="h-4 w-4" />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

Alert.propTypes = {
  type: PropTypes.oneOf(Object.keys(variants)),
  title: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string,
  onClose: PropTypes.func,
  autoClose: PropTypes.bool,
  autoCloseTime: PropTypes.number,
  showIcon: PropTypes.bool
};

export default memo(Alert);