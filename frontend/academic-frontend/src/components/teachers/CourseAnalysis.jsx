//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\teachers\CourseAnalysis.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchCourseAnalysis } from "../services/docentesService";
import OverviewMetrics from "./OverviewMetrics";
import PeriodComparisonChart from "./PeriodComparisonChart";
import SiblingCoursesChart from "./SiblingCoursesChart";
import StudentList from "./StudentList";
import PrintCourseAnalysis from "./PrintCourseAnalysis";
import { Card, CardContent, CardHeader, CardTitle } from "../shared/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../shared/ui/select";
import { Button } from "../shared/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, Users, Target, Award, AlertTriangle } from "lucide-react";

const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#0088FE', '#8884D8'];

export default function CourseAnalysis() {
  const { courseId, subjectId } = useParams();
  const [period, setPeriod] = useState("1");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courseInfo, setCourseInfo] = useState({
    courseName: "",
    subjectName: ""
  });

  const periods = [
    { value: "1", label: "Periodo 1" },
    { value: "2", label: "Periodo 2" },
    { value: "3", label: "Periodo 3" },
    { value: "4", label: "Periodo 4" },
  ];

  useEffect(() => {
    setLoading(true);
    fetchCourseAnalysis(courseId, subjectId, period)
      .then((data) => {
        setAnalysis(data);
        setCourseInfo({
          courseName: data.metadata?.courseName || `${courseId}`,
          subjectName: data.metadata?.subjectName || "Matemáticas"
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [courseId, subjectId, period]);

  // Función de impresión mejorada
  const handlePrint = () => {
    try {
      const printElement = document.getElementById('print-content');
      if (!printElement) {
        alert('No se pudo preparar el contenido para impresión');
        return;
      }
      
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Análisis del Curso - ${courseInfo.courseName} - Periodo ${period}</title>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: white;
            }
            * { box-sizing: border-box; }
            @media print {
              body { margin: 0; padding: 15mm; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          ${printElement.innerHTML}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    } catch (error) {
      console.error('Error al imprimir:', error);
      alert('Ocurrió un error al intentar imprimir');
    }
  };

  if (loading) return <p>Cargando análisis…</p>;
  if (!analysis) return <p>Error al cargar datos.</p>;

  // Preparar datos para gráficos de rendimiento
  const performanceData = [
    {
      name: 'Alto rendimiento',
      value: analysis.highPerformancePct,
      color: '#00C49F',
      description: '≥ 4.0'
    },
    {
      name: 'Rendimiento medio',
      value: Math.max(0, 100 - analysis.highPerformancePct - analysis.lowPerformancePct),
      color: '#FFBB28',
      description: '3.0 - 3.9'
    },
    {
      name: 'Bajo rendimiento',
      value: analysis.lowPerformancePct,
      color: '#FF8042',
      description: '< 3.0'
    }
  ].filter(item => item.value > 0);

  // Preparar datos para gráfico de tipos de evaluación
  const evaluationTypesData = Object.entries(analysis.promediosPorTipoCurso || {}).map(([tipo, promedio]) => ({
    tipo: tipo.replace(/_/g, ' ').toLowerCase(),
    promedio: promedio
  }));

  // Estadísticas generales
  const totalStudents = analysis.studentReports?.length || 0;
  const studentsWithData = analysis.studentReports?.filter(s => s.promedio_general !== null).length || 0;
  const studentsWithoutData = totalStudents - studentsWithData;

  // Calcular estadísticas de asistencia
  const avgAttendance = analysis.avgAsistenciaPeriodo || analysis.avgAsistenciaCurso || 0;
  const attendanceStatus = avgAttendance >= 0.8 ? 'Excelente' : avgAttendance >= 0.6 ? 'Buena' : 'Necesita atención';
  const attendanceColor = avgAttendance >= 0.8 ? 'text-green-600' : avgAttendance >= 0.6 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="p-6 space-y-6">
      {/* Componente de impresión oculto */}
      <div 
        id="print-content" 
        style={{ 
          position: 'absolute', 
          left: '-9999px', 
          top: 0, 
          width: '210mm', 
          minHeight: '297mm',
          overflow: 'hidden',
          visibility: 'hidden'
        }}
      >
        <PrintCourseAnalysis
          analysis={analysis}
          metadata={{
            courseName: courseInfo.courseName,
            subjectName: courseInfo.subjectName
          }}
          period={period}
        />
      </div>

      {/* Encabezado con información del curso */}
      <div className="mb-6">
        <h2 className="text-xl font-bold">
          Análisis de <span className="text-blue-600">{courseInfo.subjectName}</span> en el curso <span className="text-green-600">{courseInfo.courseName}</span>, periodo <span className="text-purple-600">{period}</span>
        </h2>
        <p className="text-sm text-gray-500">
          El "Promedio IA" es la probabilidad promedio de que un estudiante caiga en riesgo académico, según nuestro modelo.
        </p>
      </div>

      {/* Selector de periodo y botón de imprimir */}
      <Card>
        <CardHeader><CardTitle>Periodo</CardTitle></CardHeader>
        <CardContent className="flex items-center gap-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue>{periods.find(p => p.value === period)?.label}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {periods.map(p => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            onClick={handlePrint}
            className="flex items-center gap-2"
            variant="outline"
          >
            📄 Imprimir Análisis
          </Button>
        </CardContent>
      </Card>

      {/* Métricas generales mejoradas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Promedio Real</p>
                <p className="text-2xl font-bold">{analysis.realAverage}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Promedio IA</p>
                <p className="text-2xl font-bold">{analysis.iaAverage}</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Estudiantes</p>
                <p className="text-2xl font-bold">{studentsWithData}/{totalStudents}</p>
                <p className="text-xs text-gray-500">con datos</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Asistencia</p>
                <p className={`text-2xl font-bold ${attendanceColor}`}>
                  {Math.round(avgAttendance * 100)}%
                </p>
                <p className="text-xs text-gray-500">{attendanceStatus}</p>
              </div>
              <Award className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumen de rendimiento del curso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Resumen de Rendimiento del Curso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Distribución de rendimiento */}
            <div>
              <h4 className="font-medium mb-4">Distribución de Rendimiento</h4>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={performanceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {performanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Estadísticas textuales */}
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Alto Rendimiento</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{analysis.highPerformancePct}%</p>
                <p className="text-sm text-green-600">Estudiantes con promedio ≥ 4.0</p>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-800">Necesitan Atención</span>
                </div>
                <p className="text-2xl font-bold text-red-600">{analysis.lowPerformancePct}%</p>
                <p className="text-sm text-red-600">Estudiantes con promedio &lt; 3.0</p>
              </div>

              {studentsWithoutData > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-800">Sin Datos</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-600">{studentsWithoutData}</p>
                  <p className="text-sm text-gray-600">Estudiantes sin evaluaciones</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Promedios por tipo de evaluación */}
      {evaluationTypesData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Promedios por Tipo de Evaluación</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={evaluationTypesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="tipo"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Bar dataKey="promedio" fill="#0088FE">
                  {evaluationTypesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Gráficos existentes */}
      <PeriodComparisonChart
        data={analysis.periodComparisons}
        courseName={courseInfo.courseName}
        subjectName={courseInfo.subjectName}
      />

      <SiblingCoursesChart
        data={analysis.siblingCourses}
        currentCourseId={parseInt(courseId)}
      />

      {/* Lista de estudiantes */}
      <StudentList
        students={analysis.studentReports}
        courseId={courseId}
        subjectId={subjectId}
        period={period}
        courseName={courseInfo.courseName}
        subjectName={courseInfo.subjectName}
      />
    </div>
  );
}