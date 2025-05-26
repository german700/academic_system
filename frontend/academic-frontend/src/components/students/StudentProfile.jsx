// C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\students\StudentProfile.jsx
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../shared/ui/card";
import { User, BookOpen, GraduationCap, AlertCircle, Loader2 } from "lucide-react";
import StudentAnalysis from "./StudentAnalysis";

const API_URL = "http://localhost:8000/api/academic/students/my-profile/";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(API_URL, {
          method: "GET",
          headers: getAuthHeaders(),
        });

        if (response.status === 401) {
          throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
        }
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: No se pudo cargar el perfil`);
        }

        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Estado de carga
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Cargando perfil del estudiante...</p>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <p className="font-medium">Error al cargar el perfil</p>
            </div>
            <p className="text-red-600 mt-2">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Perfil Académico</h1>
        <p className="text-gray-600">Información personal y detalles académicos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Personal */}
        <Card className="lg:col-span-2">
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-gray-200">
              <User className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Información Personal</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {profile.first_name} {profile.last_name}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID de Estudiante
                </label>
                <p className="text-lg font-mono text-gray-900 bg-gray-100 px-3 py-1 rounded">
                  {profile.student_id}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información del Curso */}
        {profile.curso && (
          <Card>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-gray-200">
                <GraduationCap className="h-5 w-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">Curso Actual</h2>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Curso
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {profile.curso.nombre}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grado
                </label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {profile.curso.grado}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Materias */}
      <Card>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-gray-200">
            <BookOpen className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Materias Inscritas</h2>
            {Array.isArray(profile.materias) && (
              <span className="ml-auto bg-purple-100 text-purple-800 text-sm px-2 py-1 rounded-full">
                {profile.materias.length} {profile.materias.length === 1 ? 'materia' : 'materias'}
              </span>
            )}
          </div>
          {Array.isArray(profile.materias) && profile.materias.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.materias.map((materia) => (
                <div
                  key={materia.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {materia.nombre}
                  </h3>
                  <p className="text-sm text-gray-600 font-mono">
                    Código: {materia.codigo}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay materias asignadas actualmente</p>
              <p className="text-sm text-gray-500 mt-1">
                Contacta con tu coordinador académico para más información
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Integración del componente StudentAnalysis */}
      <StudentAnalysis />
    </div>
  );
};

export default StudentProfile;