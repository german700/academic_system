//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\admin\TeacherDetail\SubjectList.jsx
import React from "react";

const SubjectList = ({ subjects = [], onSelect, selected }) => (
  <section className="mb-6">
    <h2 className="text-xl font-semibold mb-2">Materias que dicta</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {subjects.map((subj, idx) => (
        <button
          key={idx}
          className={`border rounded-xl p-4 text-left shadow-sm hover:shadow-md transition ${
            selected?.id === subj.id && selected?.course === subj.course
              ? "bg-blue-100 border-blue-400"
              : "bg-white"
          }`}
          onClick={() => onSelect(subj)}
        >
          <h3 className="font-semibold">{subj.name}</h3>
          <p className="text-sm text-gray-600">Curso: {subj.course}</p>
          <p className="text-sm text-gray-600">Grado: {subj.grado}</p>
        </button>
      ))}
    </div>
  </section>
);

export default SubjectList;