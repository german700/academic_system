import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { fetchStudentAnalysis, fetchCourseAnalysis } from "../services/docentesService";
import { Card, CardHeader, CardTitle, CardContent } from "../shared/ui/card";
import { Badge } from "../shared/ui/badge";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, Legend
} from "recharts";
import {
  User, BookOpen, Calendar, TrendingUp, TrendingDown,
  Clock, AlertCircle, CheckCircle, Target, Award,
  Users, BarChart3, Printer
} from "lucide-react";
import PrintStudentAnalysis from "./PrintStudentAnalysis";
import "./teachers_css/StudentSubjectAnalysis.css"; // Importar el CSS

export default function StudentSubjectAnalysis() {
  const { courseId, subjectId, studentId } = useParams();
  const period = new URLSearchParams(useLocation().search).get("period");
  const [data, setData] = useState(null);
  const [group, setGroup] = useState(null);
  const [shouldPrint, setShouldPrint] = useState(false);

  useEffect(() => {
    // 1) Traigo el detalle individual completo
    fetchStudentAnalysis(courseId, subjectId, studentId, period)
      .then(res => setData(res));

    // 2) Traigo el análisis de todo el curso para compararlo
    fetchCourseAnalysis(courseId, subjectId, period)
      .then(res => {
        setGroup({
          promedioGroup: res.realAverage,
          periodComparisons: res.periodComparisons
        });
      });
  }, [courseId, subjectId, studentId, period]);

  if (!data || !group) {
    return (
      <div className="course-analysis">
        <div className="analysis-loading">
          <div className="analysis-loading-text">
            Cargando análisis de estudiante…
          </div>
        </div>
      </div>
    );
  }

  // Construir el nombre completo del estudiante
  const { first_name, last_name, segundo_apellido, student_email } = data;
  const fullName = [first_name, last_name, segundo_apellido].filter(Boolean).join(" ") || student_email?.split("@")[0];

  // Validar que resumen_por_periodo sea un array
  const evolutionData = Array.isArray(data.resumen_por_periodo)
    ? data.resumen_por_periodo.map(d => ({
      periodo: d.periodo,
      nota: d.nota
    }))
    : [];

  // Datos para comparación vs grupo
  const studentShortName = `${first_name} ${last_name}`;
  const comparisonData = [
    { name: studentShortName, value: data.promedio_general || 0 },
    { name: 'Grupo', value: group.promedioGroup || 0 }
  ];

  // Datos para gráfico de distribución de tipos de evaluación
  const distributionData = data.distribucion_tipos ?
    Object.entries(data.distribucion_tipos).map(([tipo, info]) => ({
      name: tipo,
      cantidad: info.cantidad,
      porcentaje: info.porcentaje
    })) : [];

  // Datos para gráfico de promedios por tipo
  const gradesByTypeData = data.promedios_por_tipo ?
    Object.entries(data.promedios_por_tipo).map(([tipo, info]) => ({
      tipo,
      promedio: info.promedio,
      evaluaciones: info.evaluaciones
    })) : [];

  // Colores para gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Función para interpretar el nivel de riesgo
  const getRiskInterpretation = (riesgo) => {
    if (riesgo < 0.3) return "bajo riesgo";
    if (riesgo < 0.6) return "riesgo moderado";
    return "alto riesgo";
  };

  const getRiskColor = (riesgo) => {
    if (riesgo < 0.3) return "green";
    if (riesgo < 0.6) return "yellow";
    return "red";
  };

  const getRiskBadgeClass = (riesgo) => {
    if (riesgo < 0.3) return "risk-badge-low";
    if (riesgo < 0.6) return "risk-badge-moderate";
    return "risk-badge-high";
  };

  const getGradeColor = (grade) => {
    if (grade >= 4.0) return "grade-high";
    if (grade >= 3.0) return "grade-medium";
    return "grade-low";
  };

  // Función para manejar valores nulos/undefined de manera más descriptiva
  const formatValue = (value, fallback = "Sin datos", formatter = null) => {
    if (value === null || value === undefined || value === "") {
      return fallback;
    }
    return formatter ? formatter(value) : value;
  };

  const handlePrint = () => {
    setShouldPrint(true);
  };

  return (
    <div className="course-analysis">
      {/* Encabezado */}
      <div className="analysis-header">
        <h1 className="analysis-title">
          <User className="inline-icon" />
          Análisis individual de <span className="student-name">{fullName}</span>
        </h1>
        <div className="student-info">
          <div className="student-detail">
            📧 {student_email} • 🎂 {formatValue(data.edad, "Sin datos", (v) => `${v} años`)} • 📊 Estrato {formatValue(data.estrato, "No disponible")}
          </div>
          <div className="course-detail">
            📚 <span className="subject-name">{data.materia}</span> (curso <span className="course-name">{data.curso}</span>) — Periodo <span className="period-name">{period}</span>
          </div>
        </div>
        {data.prediccion_riesgo?.riesgo !== undefined && (
          <div className={`risk-badge ${getRiskBadgeClass(data.prediccion_riesgo.riesgo)}`}>
            {getRiskInterpretation(data.prediccion_riesgo.riesgo).toUpperCase()}
          </div>
        )}
      </div>

      {/* Métricas principales */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-card-content">
            <div className="metric-info">
              <p className="metric-label">Promedio General</p>
              <p className={`metric-value ${getGradeColor(data.promedio_general || 0)}`}>
                {formatValue(data.promedio_general, "Sin datos", (v) => v.toFixed(2))}
              </p>
            </div>
            <Award className="metric-icon blue" />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-content">
            <div className="metric-info">
              <p className="metric-label">Rango de Notas</p>
              <div className="grade-range">
                <span className={`grade-min ${getGradeColor(data.nota_min || 0)}`}>
                  {formatValue(data.nota_min, "N/A", (v) => v.toFixed(1))}
                </span>
                <span className="grade-separator"> - </span>
                <span className={`grade-max ${getGradeColor(data.nota_max || 0)}`}>
                  {formatValue(data.nota_max, "N/A", (v) => v.toFixed(1))}
                </span>
              </div>
            </div>
            <BarChart3 className="metric-icon purple" />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-content">
            <div className="metric-info">
              <p className="metric-label">Asistencia Periodo</p>
              <p className="metric-value attendance-rate">
                {formatValue(data.asistencia_periodo, "Sin datos", (v) => `${(v * 100).toFixed(0)}%`)}
              </p>
            </div>
            <Clock className="metric-icon green" />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-content">
            <div className="metric-info">
              <p className="metric-label">Entregas Tardías</p>
              <p className="metric-value late-submissions">
                {formatValue(data.entregas_tardias, "Sin datos")}
              </p>
            </div>
            <AlertCircle className="metric-icon yellow" />
          </div>
        </div>
      </div>

      {/* Información adicional de entregas */}
      {(data.total_evaluaciones || data.entregas_tardias) && (
        <div className="analysis-card">
          <div className="analysis-card-header">
            <h3 className="analysis-card-title">
              <Target className="card-icon" />
              Resumen de Entregas
            </h3>
          </div>
          <div className="analysis-card-content">
            <div className="submission-summary">
              <div className="summary-item">
                <div className="summary-value total-evaluations">
                  {formatValue(data.total_evaluaciones, "Sin datos")}
                </div>
                <div className="summary-label">Total Evaluaciones</div>
              </div>
              <div className="summary-item">
                <div className="summary-value late-submissions">
                  {formatValue(data.entregas_tardias, "Sin datos")}
                </div>
                <div className="summary-label">Entregas Tardías</div>
              </div>
            </div>
            {data.entregas_tardias > 2 && (
              <div className="warning-message">
                <AlertCircle className="warning-icon" />
                <p>El estudiante tiene {data.entregas_tardias} entregas tardías en este periodo.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Distribución de tipos de evaluación */}
      {distributionData.length > 0 && (
        <div className="chart-section">
          <div className="analysis-card">
            <div className="analysis-card-header">
              <h3 className="analysis-card-title">Distribución de Evaluaciones</h3>
            </div>
            <div className="analysis-card-content">
              <div className="chart-container pie">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, porcentaje }) => `${name}: ${porcentaje}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="cantidad"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name, props) => [
                        `${value} evaluaciones (${props.payload.porcentaje}%)`,
                        props.payload.name
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="analysis-card">
            <div className="analysis-card-header">
              <h3 className="analysis-card-title">Promedios por Tipo de Evaluación</h3>
            </div>
            <div className="analysis-card-content">
              <div className="chart-container bar">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gradesByTypeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="tipo"
                      tick={{ fontSize: 12 }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      domain={[0, 5]}
                      label={{ value: 'Promedio', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip
                      formatter={(value, name, props) => [
                        `Promedio: ${value.toFixed(2)}`,
                        `${props.payload.tipo} (${props.payload.evaluaciones} evaluaciones)`
                      ]}
                      labelFormatter={(label) => `Tipo: ${label}`}
                    />
                    <Bar dataKey="promedio" fill="#60a5fa" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Evolución individual */}
      <div className="analysis-card">
        <div className="analysis-card-header">
          <h3 className="analysis-card-title">
            <TrendingUp className="card-icon" />
            Evolución por Periodo
          </h3>
        </div>
        <div className="analysis-card-content">
          {evolutionData.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={evolutionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="periodo"
                    label={{ value: 'Periodo', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis
                    domain={[1, 5]}
                    label={{ value: 'Nota', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    formatter={(value) => [`Nota: ${value.toFixed(2)}`, 'Calificación']}
                    labelFormatter={(label) => `Periodo ${label}`}
                  />
                  <Line
                    dataKey="nota"
                    stroke="#4ade80"
                    strokeWidth={3}
                    dot={{ fill: '#4ade80', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="no-data-message">
              <p className="no-data-text">📊 No hay datos de evolución disponibles</p>
              <p className="no-data-subtitle">Se necesitan al menos dos periodos con calificaciones</p>
            </div>
          )}
        </div>
      </div>

      {/* Comparación vs grupo */}
      <div className="analysis-card">
        <div className="analysis-card-header">
          <h3 className="analysis-card-title">
            <Users className="card-icon" />
            Comparación con el Grupo
          </h3>
        </div>
        <div className="analysis-card-content">
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis
                  domain={[0, 5]}
                  label={{ value: 'Promedio', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  formatter={(value, name) => [
                    `Promedio: ${value.toFixed(2)}`,
                    name === studentShortName ? 'Estudiante' : 'Promedio del Grupo'
                  ]}
                />
                <Bar dataKey="value" fill="#60a5fa" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="comparison-summary">
            <p className="comparison-text">
              Diferencia: <span className={`comparison-value ${(data.promedio_general || 0) >= (group.promedioGroup || 0) ? 'positive' : 'negative'}`}>
                {((data.promedio_general || 0) - (group.promedioGroup || 0) >= 0 ? '+' : '')}{((data.promedio_general || 0) - (group.promedioGroup || 0)).toFixed(2)} puntos
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Narrativa mejorada */}
      <div className="analysis-card">
        <div className="analysis-card-header">
          <h3 className="analysis-card-title">
            <BookOpen className="card-icon" />
            Resumen del Análisis
          </h3>
        </div>
        <div className="analysis-card-content">
          <div className="narrative-section">
            <div className="narrative-item performance">
              <h4 className="narrative-title">📊 Rendimiento Académico</h4>
              <p className="narrative-text">
                {fullName} obtuvo un promedio de <strong>{formatValue(data.promedio_general, "sin datos", (v) => v.toFixed(2))}</strong>,
                mientras que el promedio del curso fue de <strong>{formatValue(group.promedioGroup, "sin datos", (v) => v.toFixed(2))}</strong>.
                {data.nota_min && data.nota_max && (
                  <> Su rango de notas va desde <strong>{data.nota_min.toFixed(1)}</strong> hasta <strong>{data.nota_max.toFixed(1)}</strong>.</>
                )}
              </p>
            </div>

            {data.prediccion_riesgo?.riesgo !== undefined && (
              <div className={`narrative-item risk ${getRiskColor(data.prediccion_riesgo.riesgo)}`}>
                <h4 className="narrative-title">🤖 Análisis de Riesgo IA</h4>
                <p className="narrative-text">
                  Su riesgo IA es <strong>{(data.prediccion_riesgo.riesgo * 100).toFixed(0)}%</strong>
                  (confianza {Math.round((data.prediccion_riesgo.confianza || 0) * 100)}%),
                  lo que indica <strong>{getRiskInterpretation(data.prediccion_riesgo.riesgo)}</strong>.
                </p>
              </div>
            )}

            {data.asistencia_periodo && (
              <div className="narrative-item attendance">
                <h4 className="narrative-title">🕐 Asistencia</h4>
                <p className="narrative-text">
                  Asistencia en el periodo: <strong>{(data.asistencia_periodo * 100).toFixed(0)}%</strong>
                  {data.asistencia && (
                    <> (Asistencia general: <strong>{(data.asistencia * 100).toFixed(0)}%</strong>)</>
                  )}
                </p>
              </div>
            )}

            {/* Análisis de tendencia */}
            {evolutionData.length > 1 && (
              <div className="narrative-item trend">
                <h4 className="narrative-title">📈 Análisis de Tendencia:</h4>
                <p className="narrative-text">
                  {(() => {
                    const firstNote = evolutionData[0]?.nota;
                    const lastNote = evolutionData[evolutionData.length - 1]?.nota;
                    const trend = lastNote - firstNote;
                    const trendPercentage = ((trend / firstNote) * 100).toFixed(1);

                    if (trend > 0.2) return `📈 Muestra una tendencia positiva con una mejora de ${trend.toFixed(2)} puntos (${trendPercentage}% de crecimiento).`;
                    if (trend < -0.2) return `📉 Muestra una tendencia descendente con una caída de ${Math.abs(trend).toFixed(2)} puntos (${Math.abs(trendPercentage)}% de descenso) que requiere atención.`;
                    return `➡️ Mantiene un rendimiento estable a lo largo del periodo con variación mínima de ${Math.abs(trend).toFixed(2)} puntos.`;
                  })()}
                </p>
              </div>
            )}

            {/* Recomendaciones mejoradas */}
            <div className="narrative-item recommendations">
              <h4 className="narrative-title">💡 Recomendaciones Específicas</h4>
              <div className="recommendations-list">
                {data.entregas_tardias > 2 && (
                  <div className="recommendation-item">
                    <strong>Puntualidad:</strong> Trabajar en la gestión del tiempo - {data.entregas_tardias} entregas tardías detectadas
                  </div>
                )}
                {data.asistencia_periodo < 0.8 && (
                  <div className="recommendation-item">
                    <strong>Asistencia:</strong> Mejorar la presencia en clases (actual: {(data.asistencia_periodo * 100).toFixed(0)}%)
                  </div>
                )}
                {data.promedio_general < group.promedioGroup && (
                  <div className="recommendation-item">
                    <strong>Rendimiento:</strong> Considerar apoyo adicional para alcanzar el promedio del grupo ({((group.promedioGroup - data.promedio_general) || 0).toFixed(2)} puntos de diferencia)
                  </div>
                )}
                {data.prediccion_riesgo?.riesgo > 0.6 && (
                  <div className="recommendation-item">
                    <strong>Intervención:</strong> Implementar estrategias de apoyo inmediato - alto riesgo detectado
                  </div>
                )}
                {evolutionData.length > 1 && (() => {
                  const trend = evolutionData[evolutionData.length - 1]?.nota - evolutionData[0]?.nota;
                  if (trend > 0.2) return (
                    <div className="recommendation-item">
                      <strong>Fortalezas:</strong> Mantener la tendencia positiva actual
                    </div>
                  );
                  if (trend < -0.2) return (
                    <div className="recommendation-item">
                      <strong>Atención:</strong> Abordar la tendencia descendente con estrategias de recuperación
                    </div>
                  );
                  return null;
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botón de impresión */}
      <div className="print-section">
        <button
          onClick={handlePrint}
          className="print-btn"
        >
          <Printer className="print-icon" />
          Imprimir análisis completo
        </button>
      </div>

      {/* Componente de impresión */}
      {shouldPrint && (
        <PrintStudentAnalysis
          analysis={data}
          metadata={data.metadata}
        />
      )}
    </div>
  );
}