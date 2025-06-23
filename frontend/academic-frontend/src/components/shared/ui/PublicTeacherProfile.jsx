//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\public\PublicTeacherProfile.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Ruta base de la API
const BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:8000";

const PublicTeacherProfile = () => {
  const { teacherId } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeacherProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${BASE_URL}/api/academic/teachers/public-profile/${teacherId}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Error al cargar el perfil");
        }

        const data = await res.json();
        setTeacher(data);
      } catch (err) {
        console.error("Error al obtener el perfil público:", err.message);
        setError(err.message);
      }
    };

    fetchTeacherProfile();
  }, [teacherId]);

  if (error) return <div className="p-4 text-red-600">❌ {error}</div>;
  if (!teacher) return <div className="p-4">Cargando perfil del docente...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h1 className="text-2xl font-semibold text-gray-800">
        {teacher.nombre} <span className="text-gray-500">({teacher.codigo})</span>
      </h1>
      <p className="text-gray-700">
        <strong>Email:</strong> {teacher.email}
      </p>
      <h2 className="text-xl mt-4 font-bold text-gray-800">Asignaturas que imparte:</h2>
      <ul className="list-disc list-inside text-gray-700">
        {teacher.asignaturas.map((a, idx) => (
          <li key={idx}>
            {a.materia} — {a.curso} ({a.grado}°)
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PublicTeacherProfile;