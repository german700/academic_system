//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\teachers\TeacherCourses.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCourseStudents } from "../services/docentesService";
import { Card, CardContent, CardHeader, CardTitle } from "../shared/ui/card";
import { Button } from "../shared/ui/button";

export default function TeacherCourses() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (courseId) {
      fetchCourseStudents(courseId)
        .then(setCourseData)
        .catch((err) => {
          console.error("Error fetching course data:", err);
          setError("Error al cargar los datos del curso");
        })
        .finally(() => setLoading(false));
    }
  }, [courseId]);

  const handleGeneratePDF = () => {
    // Implementar generación de planilla PDF
    console.log("Generando planilla PDF para curso:", courseId);
  };

  const handleViewGrades = () => {
    navigate(`/teachers/courses/${courseId}/grades`);
  };

  const handleViewStudents = () => {
    navigate(`/teachers/courses/${courseId}/students`);
  };

  if (loading) return <div className="p-6">Cargando...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!courseData) return <div className="p-6">No se encontraron datos del curso</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{courseData.name}</h1>
          <p className="text-gray-600">
            Grado: {courseData.grado?.numero} | 
            Estudiantes: {courseData.students?.length || 0}
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => navigate('/teachers/dashboard')}
        >
          Volver al Dashboard
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={handleGeneratePDF}
              className="w-full"
              variant="default"
            >
              📄 Planilla PDF
            </Button>
            <Button 
              onClick={handleViewGrades}
              className="w-full"
              variant="outline"
            >
              📊 Ver Notas
            </Button>
            <Button 
              onClick={handleViewStudents}
              className="w-full"
              variant="outline"
            >
              👥 Ver Estudiantes
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Resumen del Curso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-2">Información General</h4>
                <ul className="text-sm space-y-1">
                  <li>Nombre: {courseData.name}</li>
                  <li>Grado: {courseData.grado?.numero}</li>
                  <li>Total Estudiantes: {courseData.students?.length || 0}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Materias</h4>
                <div className="text-sm space-y-1">
                  {courseData.subjects?.length > 0 ? (
                    courseData.subjects.map((subject, index) => (
                      <div key={index} className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {subject.name}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No hay materias asignadas</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}