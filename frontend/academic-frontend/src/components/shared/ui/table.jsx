//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\shared\ui\table.jsx
import React from "react";
import { cn } from "../../../utils/utils";

export function Table({ className, ...props }) {
  return (
    <div className="relative w-full overflow-auto">
      <table
        className={cn(
          "w-full caption-bottom text-sm border-collapse",
          className
        )}
        {...props}
      />
    </div>
  );
}

export function TableHeader({ className, ...props }) {
  return (
    <thead
      className={cn(
        "border-b border-gray-200 bg-gray-50",
        className
      )}
      {...props}
    />
  );
}

export function TableBody({ className, ...props }) {
  return (
    <tbody
      className={cn(
        "divide-y divide-gray-200",
        className
      )}
      {...props}
    />
  );
}

export function TableFooter({ className, ...props }) {
  return (
    <tfoot
      className={cn(
        "border-t border-gray-200 bg-gray-50 font-medium",
        className
      )}
      {...props}
    />
  );
}

export function TableRow({ className, ...props }) {
  return (
    <tr
      className={cn(
        "border-b border-gray-200 transition-colors hover:bg-gray-50 data-[state=selected]:bg-gray-100",
        className
      )}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }) {
  return (
    <th
      className={cn(
        "h-12 px-4 text-left align-middle font-medium text-gray-900 [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }) {
  return (
    <td
      className={cn(
        "p-4 align-middle [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  );
}

export function TableCaption({ className, ...props }) {
  return (
    <caption
      className={cn(
        "mt-4 text-sm text-gray-500",
        className
      )}
      {...props}
    />
  );
}

// Componente adicional para tablas con estado de carga
export function TableSkeleton({ rows = 5, columns = 4, className }) {
  return (
    <Table className={className}>
      <TableHeader>
        <TableRow>
          {Array.from({ length: columns }).map((_, index) => (
            <TableHead key={index}>
              <div className="h-4 bg-gray-300 rounded animate-pulse" />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <TableRow key={rowIndex}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <TableCell key={colIndex}>
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// Componente para tabla vacía
export function TableEmpty({ className, children, ...props }) {
  return (
    <TableRow className={className} {...props}>
      <TableCell colSpan={100} className="h-24 text-center text-gray-500">
        {children || "No hay datos disponibles"}
      </TableCell>
    </TableRow>
  );
}