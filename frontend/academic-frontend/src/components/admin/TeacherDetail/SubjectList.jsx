// src/components/admin/TeacherDetail/SubjectList.jsx
import React from "react";
import "./TeacherDetail_css/SubjectList.css";

const SubjectList = ({ subjects = [], onSelect, selected }) => (
  <section className="subject-list-section">
    <h2 className="subject-list-title">Materias que dicta</h2>
    <div className="subject-grid">
      {subjects.map((subj, idx) => {
        const isSelected = selected?.id === subj.id && selected?.course === subj.course;
        return (
          <button
            key={idx}
            className={`subject-card ${isSelected ? "selected" : ""}`}
            onClick={() => onSelect(subj)}
          >
            <h3>{subj.name}</h3>
            <p>Curso: {subj.course}</p>
            <p>Grado: {subj.grado}</p>
          </button>
        );
      })}
    </div>
  </section>
);

export default SubjectList;
