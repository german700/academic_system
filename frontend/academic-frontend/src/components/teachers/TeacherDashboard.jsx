//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\teachers\TeacherDashboard.jsx
import React, { useEffect, useState } from "react";
import { fetchTeacherDashboard } from "../services/docentesService";
import { Card, CardContent } from "../shared/ui/card";
import { useNavigate } from "react-router-dom";

export default function TeacherDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeacherDashboard()
      .then(setData)
      .catch((err) => {
        console.error("Error fetching dashboard:", err);
        setError("Error al cargar el dashboard");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Cargando...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!data) return <div className="p-6">No hay datos disponibles</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Mi Dashboard</h1>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-lg">
          Periodo actual:{" "}
          {data.current_period 
            ? `${data.current_period.name} (${data.current_period.number})`
            : "Ninguno activo"
          }
        </p>
      </div>

      <h2 className="text-xl mt-6 mb-4">Mis Cursos</h2>
      
      {data.courses && data.courses.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.courses.map((course) => (
            <Card 
              key={course.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/teachers/courses/${course.id}`)}
            >
              <CardContent className="p-4">
                <div className="font-semibold text-lg">{course.name}</div>
                <div className="text-gray-600">Grado: {course.grado?.numero || 'N/A'}</div>
                <div className="text-sm text-gray-500 mt-2">
                  {course.students_count || 0} estudiantes
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-gray-500">No tienes cursos asignados</div>
      )}
    </div>
  );
}