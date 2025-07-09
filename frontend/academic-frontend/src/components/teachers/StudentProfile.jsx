//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\teachers\StudentProfile.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "../shared/ui/card";
import { User, Mail, Calendar, GraduationCap, AlertCircle, Loader2, ImageIcon } from "lucide-react";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const StudentProfile = () => {
  const { studentId } = useParams();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Determinar la URL según si hay studentId o no
  const API_URL = studentId 
    ? `http://localhost:8000/api/academic/teachers/student-profile/${studentId}/`
    : "http://localhost:8000/api/academic/students/my-profile/";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(API_URL, {
          method: "GET",
          headers: getAuthHeaders(),
        });

        if (!response.ok) throw new Error("Error al cargar el perfil.");
        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [API_URL, studentId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Cargando perfil del estudiante...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center text-red-800">
              <AlertCircle className="h-5 w-5 mr-2" />
              <p className="font-medium">Error al cargar el perfil</p>
            </div>
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reintentar
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        {studentId ? "Perfil del Estudiante" : "Mi Perfil"}
      </h1>

      <Card>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Foto */}
          <div className="flex justify-center">
            {profile.photo ? (
              <img 
                src={profile.photo} 
                alt="Foto del estudiante" 
                className="w-32 h-32 rounded-full object-cover border" 
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 border">
                <ImageIcon className="h-10 w-10" />
              </div>
            )}
          </div>

          {/* Datos personales */}
          <div className="md:col-span-2 space-y-3">
            <div>
              <label className="text-sm text-gray-600">Nombre Completo</label>
              <p className="text-lg font-semibold text-gray-900">
                {profile.first_name} {profile.middle_name || ""} {profile.last_name} {profile.second_last_name || ""}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">ID Estudiante</label>
                <p className="font-mono bg-gray-100 px-2 py-1 rounded">{profile.student_id}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Correo</label>
                <p className="text-gray-800 flex items-center gap-1">
                  <Mail className="w-4 h-4 text-gray-500" />
                  {profile.email || "No disponible"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Fecha de nacimiento</label>
                <p className="text-gray-800 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  {profile.date_of_birth || "No registrada"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Curso actual */}
      {profile.curso && (
        <Card>
          <CardContent className="pt-6 space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-800">Curso Actual</h2>
            </div>
            <p><strong>Curso:</strong> {profile.curso.nombre}</p>
            <p><strong>Grado:</strong> {profile.curso.grado}°</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentProfile;