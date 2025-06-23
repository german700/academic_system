//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\teachers\TeacherProfile.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "../shared/ui/card";
import { Loader2, User, Mail, Phone, BookOpen, ChevronLeftCircle } from "lucide-react";

const API_URL = "http://localhost:8000/api/academic/teachers";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const TeacherProfile = () => {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const response = await fetch(`${API_URL}/${teacherId}/`, {
          headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error("Error al cargar el perfil del docente.");
        const data = await response.json();
        setTeacher(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacher();
  }, [teacherId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Cargando perfil del docente...</span>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-600 text-center mt-10">{error}</p>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-blue-600 hover:underline mb-4"
      >
        <ChevronLeftCircle className="w-5 h-5" />
        Volver
      </button>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-2 border-b pb-3">
            <User className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Perfil del Docente</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800">
            <div>
              <label className="text-sm text-gray-600">Nombre</label>
              <p className="font-semibold">
                {teacher.first_name} {teacher.last_name}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Correo</label>
              <p className="flex items-center gap-1">
                <Mail className="w-4 h-4 text-gray-500" />
                {teacher.email}
              </p>
            </div>
            {teacher.phone && (
              <div>
                <label className="text-sm text-gray-600">Teléfono</label>
                <p className="flex items-center gap-1">
                  <Phone className="w-4 h-4 text-gray-500" />
                  {teacher.phone}
                </p>
              </div>
            )}
            {teacher.title && (
              <div>
                <label className="text-sm text-gray-600">Título Profesional</label>
                <p>{teacher.title}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {teacher.subjects && teacher.subjects.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 border-b pb-3 mb-3">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-800">Materias que enseña</h3>
            </div>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {teacher.subjects.map((s) => (
                <li key={s.id}>
                  {s.name} ({s.code})
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeacherProfile;
