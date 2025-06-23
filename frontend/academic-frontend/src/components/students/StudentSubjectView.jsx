//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\students\StudentSubjectView.jsx
import React, { useState, useEffect } from "react";
import SubjectCardGrid from "./SubjectCardGrid";
import SubjectDetailView from "./SubjectDetailView";
import { obtenerPerfilEstudiante } from "../services/estudiantesService";

const StudentSubjectView = () => {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    obtenerPerfilEstudiante("me").then(data => {
      setStudentInfo(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <p>Cargando perfil...</p>;

  const course = studentInfo?.curso;
  const materias = studentInfo?.materias;

  if (!course || !materias) return <p>Perfil incompleto.</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {!selectedSubject ? (
        <>
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Mis Materias</h1>
          <SubjectCardGrid materias={materias} onSelect={setSelectedSubject} />
        </>
      ) : (
        <SubjectDetailView
          subject={selectedSubject}
          course={course}
          studentId={studentInfo.id}
          onBack={() => setSelectedSubject(null)}
        />
      )}
    </div>
  );
};

export default StudentSubjectView;
