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
  // Nuevo estado para materia seleccionada
  const [selectedSubject, setSelectedSubject] = useState("");

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

      <Card>
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

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Selecciona una materia</h3>
        {courseData.subjects?.length > 0 ? (
          <div className="flex space-x-2">
            <select
              className="border rounded p-2 flex-grow"
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
            >
              <option value="">-- Elige materia --</option>
              {courseData.subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {selectedSubject && (
              <Button
                className="px-4"
                onClick={() =>
                  navigate(
                    `/teachers/courses/${courseId}/subject/${selectedSubject}/grades`
                  )
                }
              >
                📊 Ver Notas
              </Button>
            )}
          </div>
        ) : (
          <p className="text-gray-500">Este curso no tiene materias asignadas.</p>
        )}
      </div>

      {/* Nueva sección de estudiantes */}
      <div className="mt-8">
        <h3 className="font-semibold mb-2">Estudiantes del curso</h3>
        {courseData.students?.length > 0 ? (
          <ul className="space-y-1 text-sm">
            {courseData.students
              .slice() // para no mutar el array original
              .sort((a, b) => 
                a.last_name.localeCompare(b.last_name) || 
                a.first_name.localeCompare(b.first_name)
              )
              .map((student) => (
                <li key={student.id}>
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => navigate(`/perfil-estudiante/${student.id}`)}
                  >
                    {student.codigo} {student.first_name} {student.last_name}
                  </button>
                </li>
              ))}
          </ul>
        ) : (
          <p className="text-gray-500">No hay estudiantes asignados a este curso.</p>
        )}
      </div>
    </div>
  );
}