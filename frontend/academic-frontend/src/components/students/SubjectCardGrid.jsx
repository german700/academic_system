//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\students\SubjectCardGrid.jsx
import React from "react";
import { BookOpen } from "lucide-react";

const SubjectCardGrid = ({ materias, onSelect }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {materias.map((materia) => (
        <div
          key={materia.id}
          className="cursor-pointer bg-white shadow-md rounded-2xl p-4 border hover:border-blue-500 transition duration-200 hover:shadow-lg"
          onClick={() => onSelect(materia)}
        >
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="text-blue-500 w-6 h-6" />
            <h3 className="text-lg font-bold text-gray-800 truncate">
              {materia.nombre || materia.name}
            </h3>
          </div>
          <div className="text-sm text-gray-600">
            <p className="truncate">
              <span className="font-medium">Código:</span> {materia.codigo || "N/A"}
            </p>
            {/* Puedes agregar más info aquí si está disponible */}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SubjectCardGrid;
