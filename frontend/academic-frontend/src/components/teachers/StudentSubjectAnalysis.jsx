//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\teachers\StudentSubjectAnalysis.jsx
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { fetchStudentSubjectAnalysis } from "../services/docentesService";
import { Card, CardContent, CardHeader, CardTitle } from "../shared/ui/card";
import { Button } from "../shared/ui/button";
import { Badge } from "../shared/ui/badge";

export default function StudentSubjectAnalysis() {
  const { studentId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const subjectId = searchParams.get('subject');
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (studentId && subjectId) {
      fetchStudentSubjectAnalysis(studentId, subjectId)
        .then(setData)
        .catch((err) => {
          console.error("Error fetching analysis:", err);
          setError("Error al cargar el análisis del estudiante");
        })
        .finally(() => setLoading(false));
    } else {
      setError("Faltan parámetros: studentId o subjectId");
      setLoading(false);
    }
  }, [studentId, subjectId]);

  const getGradeColor = (grade) => {
    if (grade >= 4.0) return "bg-green-100 text-green-800";
    if (grade >= 3.0) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getPerformanceLevel = (grade) => {
    if (grade >= 4.5) return "Excelente";
    if (grade >= 4.0) return "Bueno";
    if (grade >= 3.0) return "Aceptable";
    return "Necesita Mejora";
  };

  if (loading) return <div className="p-6">Cargando análisis...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!data) return <div className="p-6">No se encontraron datos del análisis</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Análisis del Estudiante</h1>
          <p className="text-gray-600">
            {data.student_name} - {data.subject_name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
          >
            Volver
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/teachers/dashboard')}
          >
            Dashboard
          </Button>
        </div>
      </div>

      {/* Resumen General */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {data.current_grade?.toFixed(1) || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Nota Actual</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Badge className={getGradeColor(data.current_grade)}>
                {getPerformanceLevel(data.current_grade)}
              </Badge>
              <div className="text-sm text-gray-600 mt-2">Nivel</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {data.attendance_percentage || 0}%
              </div>
              <div className="text-sm text-gray-600">Asistencia</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {data.assignments_completed || 0}
              </div>
              <div className="text-sm text-gray-600">Tareas Completadas</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notas por Período */}
      {data.period_grades && data.period_grades.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Notas por Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {data.period_grades.map((period, index) => (
                <div key={index} className="text-center p-4 border rounded-lg">
                  <div className="font-semibold text-lg">{period.period_name}</div>
                  <div className={`text-2xl font-bold mt-2 ${
                    period.grade >= 3.0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {period.grade?.toFixed(1) || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {period.grade >= 3.0 ? 'Aprobado' : 'Reprobado'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informe Narrativo */}
      {data.narrative_report && (
        <Card>
          <CardHeader>
            <CardTitle>Informe Narrativo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Fortalezas:</h4>
                <p className="text-sm mb-4">
                  {data.narrative_report.strengths || "No se han identificado fortalezas específicas."}
                </p>
                
                <h4 className="font-semibold mb-2">Áreas de Mejora:</h4>
                <p className="text-sm mb-4">
                  {data.narrative_report.improvement_areas || "No se han identificado áreas de mejora específicas."}
                </p>
                
                <h4 className="font-semibold mb-2">Recomendaciones:</h4>
                <p className="text-sm">
                  {data.narrative_report.recommendations || "No hay recomendaciones específicas en este momento."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actividades Recientes */}
      {data.recent_activities && data.recent_activities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Actividades Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recent_activities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{activity.title}</div>
                    <div className="text-sm text-gray-600">{activity.description}</div>
                    <div className="text-xs text-gray-500 mt-1">{activity.date}</div>
                  </div>
                  <div className="text-right">
                    {activity.grade && (
                      <Badge className={getGradeColor(activity.grade)}>
                        {activity.grade.toFixed(1)}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráfico de Progreso */}
      {data.progress_chart && (
        <Card>
          <CardHeader>
            <CardTitle>Progreso Académico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                [Aquí iría el gráfico de progreso - Integrar con Chart.js o Recharts]
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Observaciones del Docente */}
      {data.teacher_observations && data.teacher_observations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Observaciones del Docente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.teacher_observations.map((observation, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm">{observation.comment}</p>
                      <div className="text-xs text-gray-500 mt-1">
                        {observation.date} - {observation.teacher_name}
                      </div>
                    </div>
                    {observation.type && (
                      <Badge variant="outline" className="ml-2">
                        {observation.type}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Acciones Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              📝 Agregar Observación
            </Button>
            <Button variant="outline" size="sm">
              📧 Contactar Padres
            </Button>
            <Button variant="outline" size="sm">
              📊 Generar Reporte
            </Button>
            <Button variant="outline" size="sm">
              🎯 Crear Plan de Mejora
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}