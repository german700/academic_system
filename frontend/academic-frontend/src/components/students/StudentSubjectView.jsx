import React, { useState, useEffect } from "react";
import SubjectCardGrid from "./SubjectCardGrid";
import SubjectDetailView from "./SubjectDetailView";
import { obtenerPerfilEstudiante } from "../services/estudiantesService";

const StudentSubjectView = () => {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    obtenerPerfilEstudiante("me")
      .then((data) => {
        setStudentInfo(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error al obtener perfil:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center text-gray-600">Cargando perfil...</p>;

  const course = studentInfo?.curso;
  const materias = studentInfo?.materias;

  if (!course || !materias) {
    return <p className="text-center text-red-500">Perfil incompleto.</p>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {!selectedSubject ? (
        <>
          <h1 className="text-3xl font-bold text-center text-[#2596be] mb-6">
            Mis Materias
          </h1>
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
