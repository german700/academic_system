//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\students\SubjectCardGrid.jsx
import React from "react";
import { BookOpen } from "lucide-react";
import "../students/students_css/SubjectCardGrid.css";

const SubjectCardGrid = ({ materias, onSelect }) => {
  return (
    <div className="subject-grid">
      {materias.map((materia) => (
        <div
          key={materia.id}
          className="subject-card"
          onClick={() => onSelect(materia)}
        >
          <div className="subject-card-header">
            <BookOpen className="subject-icon" />
            <h3 className="subject-title">
              {materia.nombre || materia.name}
            </h3>
          </div>
          <div className="subject-info">
            <p className="subject-code">
              <span className="label">Código:</span> {materia.codigo || "N/A"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SubjectCardGrid;