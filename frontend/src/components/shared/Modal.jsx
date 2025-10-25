// src/components/ui/Modal.jsx
import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { HiX } from "react-icons/hi";

export const Modal = ({ isOpen, onClose, children, className, ...props }) => {
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (e) => {
      if (overlayRef.current === e.target) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          ref={overlayRef}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={clsx(
              "relative max-h-[90vh] w-full max-w-md overflow-auto rounded-lg bg-white p-6 shadow-lg",
              className
            )}
            {...props}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export const ModalHeader = ({ children, className, ...props }) => {
  return (
    <div
      className={clsx("mb-4 flex items-start justify-between", className)}
      {...props}
    >
      <div>{children}</div>
    </div>
  );
};

export const ModalTitle = ({ children, className, ...props }) => {
  return (
    <h3
      className={clsx("text-lg font-medium text-neutral-900", className)}
      {...props}
    >
      {children}
    </h3>
  );
};

export const ModalCloseButton = ({ className, onClick, ...props }) => {
  return (
    <button
      className={clsx(
        "absolute right-4 top-4 rounded-full p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700",
        "focus:outline-none focus:ring-2 focus:ring-primary-500",
        className
      )}
      onClick={onClick}
      aria-label="Close"
      {...props}
    >
      <HiX className="h-5 w-5" />
    </button>
  );
};

export const ModalBody = ({ children, className, ...props }) => {
  return (
    <div className={clsx("text-neutral-700", className)} {...props}>
      {children}
    </div>
  );
};

export const ModalFooter = ({ children, className, ...props }) => {
  return (
    <div
      className={clsx(
        "mt-6 flex items-center justify-end space-x-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Modal;