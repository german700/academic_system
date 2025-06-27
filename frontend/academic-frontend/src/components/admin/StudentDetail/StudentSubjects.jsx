//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\admin\StudentDetail\StudentSubjects.jsx
import React from "react";

const StudentSubjects = ({ materias }) => {
  if (!materias || materias.length === 0) {
    return <p>Este estudiante no tiene materias asignadas.</p>;
  }

  return (
    <section className="mb-6">
      <h2>Materias</h2>
      <ul>
        {materias.map((materia) => (
          <li key={materia.id}>
            {materia.name || materia.nombre} (ID: {materia.id})
          </li>
        ))}
      </ul>
    </section>
  );
};

export default StudentSubjects;
