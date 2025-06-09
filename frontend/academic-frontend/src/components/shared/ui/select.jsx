//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\shared\ui\select.jsx
import React, { useState, useRef, useEffect } from "react";
import { cn } from "../../../utils/utils";

export function Select({ children, value, onValueChange, ...props }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || "");
  const selectRef = useRef(null);

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (itemValue) => {
    setSelectedValue(itemValue);
    setIsOpen(false);
    if (onValueChange) {
      onValueChange(itemValue);
    }
  };

  return (
    <div className="relative" ref={selectRef} {...props}>
      {React.Children.map(children, (child) => {
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, {
            onClick: () => setIsOpen(!isOpen),
            isOpen,
            selectedValue,
          });
        }
        if (child.type === SelectContent) {
          return React.cloneElement(child, {
            isOpen,
            onSelect: handleSelect,
            selectedValue,
          });
        }
        return child;
      })}
    </div>
  );
}

export function SelectTrigger({ className, children, onClick, isOpen, selectedValue, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
      <ChevronDownIcon className={cn("h-4 w-4 opacity-50 transition-transform", isOpen && "rotate-180")} />
    </button>
  );
}

export function SelectValue({ placeholder, selectedValue, ...props }) {
  return (
    <span className="block truncate">
      {selectedValue || placeholder}
    </span>
  );
}

export function SelectContent({ className, children, isOpen, onSelect, selectedValue, ...props }) {
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "absolute top-full z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white text-gray-950 shadow-md animate-in data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    >
      <div className="p-1">
        {React.Children.map(children, (child) => {
          if (child.type === SelectItem) {
            return React.cloneElement(child, {
              onSelect,
              isSelected: selectedValue === child.props.value,
            });
          }
          return child;
        })}
      </div>
    </div>
  );
}

export function SelectItem({ className, children, value, onSelect, isSelected, ...props }) {
  return (
    <div
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        isSelected && "bg-gray-100",
        className
      )}
      onClick={() => onSelect(value)}
      {...props}
    >
      {isSelected && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <CheckIcon className="h-4 w-4" />
        </span>
      )}
      {children}
    </div>
  );
}

// Iconos simples inline
function ChevronDownIcon({ className, ...props }) {
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
      <polyline points="6,9 12,15 18,9" />
    </svg>
  );
}

function CheckIcon({ className, ...props }) {
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
      <polyline points="20,6 9,17 4,12" />
    </svg>
  );
}