//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\shared\ui\dialog.jsx
import React, { useState, useEffect, useRef } from "react";
import { cn } from "../../../utils/utils";

export function Dialog({ children, open, onOpenChange, ...props }) {
  const [isOpen, setIsOpen] = useState(open || false);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (onOpenChange) {
      onOpenChange(true);
    }
  };

  return (
    <div {...props}>
      {React.Children.map(children, (child) => {
        if (child.type === DialogTrigger) {
          return React.cloneElement(child, {
            onClick: handleOpen,
          });
        }
        if (child.type === DialogContent) {
          return React.cloneElement(child, {
            isOpen,
            onClose: handleClose,
            dialogRef,
          });
        }
        return child;
      })}
    </div>
  );
}

export function DialogTrigger({ className, children, onClick, ...props }) {
  return (
    <div
      className={cn("inline-block", className)}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

export function DialogContent({ 
  className, 
  children, 
  isOpen, 
  onClose, 
  dialogRef,
  showCloseButton = true,
  ...props 
}) {
  if (!isOpen) return null;

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
      
      {/* Dialog */}
      <div
        ref={dialogRef}
        className={cn(
          "relative z-50 w-full max-w-lg mx-4 bg-white rounded-lg shadow-xl animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
          className
        )}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {showCloseButton && (
          <button
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={onClose}
          >
            <XIcon className="h-4 w-4" />
            <span className="sr-only">Cerrar</span>
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ className, ...props }) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left p-6 pb-0",
        className
      )}
      {...props}
    />
  );
}

export function DialogFooter({ className, ...props }) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-4",
        className
      )}
      {...props}
    />
  );
}

export function DialogTitle({ className, ...props }) {
  return (
    <h3
      className={cn(
        "text-lg font-semibold leading-none tracking-tight text-gray-900",
        className
      )}
      {...props}
    />
  );
}

export function DialogDescription({ className, ...props }) {
  return (
    <p
      className={cn(
        "text-sm text-gray-500 mt-2",
        className
      )}
      {...props}
    />
  );
}

export function DialogBody({ className, ...props }) {
  return (
    <div
      className={cn(
        "p-6 pt-0",
        className
      )}
      {...props}
    />
  );
}

// Hook personalizado para controlar el diálogo
export function useDialog(initialOpen = false) {
  const [open, setOpen] = useState(initialOpen);

  const openDialog = () => setOpen(true);
  const closeDialog = () => setOpen(false);
  const toggleDialog = () => setOpen(!open);

  return {
    open,
    openDialog,
    closeDialog,
    toggleDialog,
    setOpen,
  };
}

// Componentes de confirmación rápida
export function ConfirmDialog({ 
  open, 
  onOpenChange, 
  title, 
  description, 
  onConfirm, 
  onCancel,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "default"
}) {
  const handleConfirm = () => {
    onConfirm?.();
    onOpenChange?.(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter>
          <button
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500 h-10 px-4 py-2"
            onClick={handleCancel}
          >
            {cancelText}
          </button>
          <button
            className={cn(
              "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 ml-2",
              variant === "destructive" 
                ? "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
                : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
            )}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Icono X simple inline
function XIcon({ className, ...props }) {
  return (
    <svg
      className={className}
      fill="none"
      height="24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="24"
      {...props}
    >
      <path d="m18 6-12 12" />
      <path d="m6 6 12 12" />
    </svg>
  );
}