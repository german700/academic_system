//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\teachers\CourseAnalysis.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchCourseAnalysis, fetchTeacherDashboard } from "../services/docentesService";
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
import './teachers_css/CourseAnalysis.css';

const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#0088FE', '#8884D8'];

export default function CourseAnalysis() {
  const { courseId, subjectId } = useParams();
  const [period, setPeriod] = useState(""); // ✅ Inicializar vacío para detectar período actual
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courseInfo, setCourseInfo] = useState({
    courseName: "",
    subjectName: ""
  });

  const periods = [
    { value: "1", label: "Primer Periodo" },
    { value: "2", label: "Segundo Periodo" },
    { value: "3", label: "Tercer Periodo" },
    { value: "4", label: "Cuarto Periodo" },
  ];

  // ✅ useEffect unificado para manejar la carga de datos con detección automática del período
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        let effectivePeriod = period;

        // Si no hay periodo seleccionado, obtener el periodo actual
        if (!effectivePeriod) {
          const dashboard = await fetchTeacherDashboard();
          effectivePeriod = dashboard.current_period.number.toString();
          setPeriod(effectivePeriod);
        }

        // Cargar análisis del período efectivo
        const data = await fetchCourseAnalysis(courseId, subjectId, effectivePeriod);

        setAnalysis(data);
        setCourseInfo({
          courseName: data.metadata?.courseName || `${courseId}`,
          subjectName: data.metadata?.subjectName || "Matemáticas"
        });

      } catch (error) {
        console.error("Error al cargar análisis:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
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

  // Estados de carga y error actualizados
  if (loading) return <div className="analysis-loading"><p className="analysis-loading-text">Cargando análisis…</p></div>;
  if (!analysis) return <div className="analysis-error"><p className="analysis-error-text">Error al cargar datos.</p></div>;

  // Preparar datos para gráficos de rendimiento
  const performanceData = [
    {
      name: 'Alto rendimiento',
      value: Math.round(analysis.highPerformancePct * 100) / 100, // Redondear a 2 decimales
      color: '#00C49F',
      description: '≥ 4.0'
    },
    {
      name: 'Rendimiento medio',
      value: Math.round(Math.max(0, 100 - analysis.highPerformancePct - analysis.lowPerformancePct) * 100) / 100,
      color: '#FFBB28',
      description: '3.0 - 3.9'
    },
    {
      name: 'Bajo rendimiento',
      value: Math.round(analysis.lowPerformancePct * 100) / 100,
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
  const attendanceColor = avgAttendance >= 0.8 ? 'attendance-excellent' : avgAttendance >= 0.6 ? 'attendance-good' : 'attendance-poor';

  // ✅ Obtener label del período seleccionado
  const selectedPeriodLabel = periods.find(p => p.value === period)?.label;

  return (
    <div className="course-analysis">
      {/* Componente de impresión oculto */}
      <div className="print-content" id="print-content">
        <PrintCourseAnalysis
          analysis={analysis}
          metadata={{
            courseName: courseInfo.courseName,
            subjectName: courseInfo.subjectName,
            courseId: courseId
          }}
          period={period}
        />
      </div>

      {/* Encabezado con información del curso */}
      <div className="analysis-header">
        <h2 className="analysis-title">
          Análisis de <span className="subject-name">{courseInfo.subjectName}</span> en el curso <span className="course-name">{courseInfo.courseName}</span>, periodo <span className="period-name">{selectedPeriodLabel}</span>
        </h2>
        <p className="analysis-description">
          El "Promedio IA" es la probabilidad promedio de que un estudiante caiga en riesgo académico, según nuestro modelo.
        </p>
      </div>

      {/* Selector de periodo y botón de imprimir */}
      <div className="analysis-card">
        <div className="analysis-card-header">
          <h3 className="analysis-card-title">Periodo</h3>
        </div>
        <div className="analysis-card-content">
          <div className="period-selector-section">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="period-select">
                <SelectValue placeholder="Selecciona un periodo">
                  {selectedPeriodLabel}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {periods.map(p => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <button
              onClick={handlePrint}
              className="print-btn"
            >
              📄 Imprimir Análisis
            </button>
          </div>
        </div>
      </div>

      {/* Métricas generales mejoradas */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-card-content">
            <div className="metric-info">
              <p className="metric-label">Promedio Real</p>
              <p className="metric-value">{analysis.realAverage}</p>
            </div>
            <TrendingUp className="metric-icon blue" />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-content">
            <div className="metric-info">
              <p className="metric-label">Promedio IA</p>
              <p className="metric-value">{analysis.iaAverage}</p>
            </div>
            <Target className="metric-icon purple" />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-content">
            <div className="metric-info">
              <p className="metric-label">Estudiantes</p>
              <p className="metric-value">{studentsWithData}/{totalStudents}</p>
              <p className="metric-subtitle">con datos</p>
            </div>
            <Users className="metric-icon green" />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-content">
            <div className="metric-info">
              <p className="metric-label">Asistencia</p>
              <p className={`metric-value ${attendanceColor}`}>
                {Math.round(avgAttendance * 100)}%
              </p>
              <p className="metric-subtitle">{attendanceStatus}</p>
            </div>
            <Award className="metric-icon yellow" />
          </div>
        </div>
      </div>

      {/* Resumen de rendimiento del curso */}
      <div className="analysis-card">
        <div className="analysis-card-header">
          <h3 className="analysis-card-title">
            <Target className="h-5 w-5" />
            Resumen de Rendimiento del Curso
          </h3>
        </div>
        <div className="analysis-card-content">
          <div className="performance-summary">
            {/* Distribución de rendimiento */}
            <div className="performance-chart">
              <h4 className="performance-chart-title">Distribución de Rendimiento</h4>
              <div className="chart-container pie">
                <ResponsiveContainer width="100%" height="100%">
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
            </div>

            {/* Estadísticas textuales */}
            <div className="performance-stats">
              <div className="performance-stat high">
                <div className="performance-stat-header">
                  <TrendingUp className="icon high" />
                  <span className="performance-stat-title high">Alto Rendimiento</span>
                </div>
                <p className="performance-stat-value high">{analysis.highPerformancePct}%</p>
                <p className="performance-stat-description high">Estudiantes con promedio ≥ 4.0</p>
              </div>

              <div className="performance-stat low">
                <div className="performance-stat-header">
                  <AlertTriangle className="icon low" />
                  <span className="performance-stat-title low">Necesitan Atención</span>
                </div>
                <p className="performance-stat-value low">{analysis.lowPerformancePct}%</p>
                <p className="performance-stat-description low">Estudiantes con promedio &lt; 3.0</p>
              </div>

              {studentsWithoutData > 0 && (
                <div className="performance-stat no-data">
                  <div className="performance-stat-header">
                    <AlertTriangle className="icon no-data" />
                    <span className="performance-stat-title no-data">Sin Datos</span>
                  </div>
                  <p className="performance-stat-value no-data">{studentsWithoutData}</p>
                  <p className="performance-stat-description no-data">Estudiantes sin evaluaciones</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Promedios por tipo de evaluación */}
      {evaluationTypesData.length > 0 && (
        <div className="analysis-card">
          <div className="analysis-card-header">
            <h3 className="analysis-card-title">Promedios por Tipo de Evaluación</h3>
          </div>
          <div className="analysis-card-content">
            <div className="chart-container bar">
              <ResponsiveContainer width="100%" height="100%">
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
            </div>
          </div>
        </div>
      )}

      {/* Gráficos existentes */}
      <PeriodComparisonChart
        data={analysis.periodComparisons}
        courseName={courseInfo.courseName}
        subjectName={courseInfo.subjectName}
      />

      {analysis.metadata?.courseId != null && (
        <SiblingCoursesChart
          data={analysis.siblingCourses}
          currentCourseId={analysis.metadata.courseId}
          currentCourseName={analysis.metadata.courseName}
        />
      )}

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