//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\shared\ui\card.jsx
import React from "react";

export const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow p-4 ${className}`}>
    {children}
  </div>
);

export const CardContent = ({ children, className = "" }) => (
  <div className={`text-base text-gray-800 ${className}`}>
    {children}
  </div>
);
