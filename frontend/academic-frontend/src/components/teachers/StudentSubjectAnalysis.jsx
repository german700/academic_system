//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\teachers\StudentSubjectAnalysis.jsx
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
  FileX, Users, BarChart3 
} from "lucide-react";

export default function StudentSubjectAnalysis() {
  const { courseId, subjectId, studentId } = useParams();
  const period = new URLSearchParams(useLocation().search).get("period");
  const [data, setData] = useState(null);
  const [group, setGroup] = useState(null);

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

  if (!data || !group) return <p>Cargando análisis de estudiante…</p>;

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
    if (riesgo < 0.3) return "text-green-600";
    if (riesgo < 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const getRiskBadgeColor = (riesgo) => {
    if (riesgo < 0.3) return "bg-green-100 text-green-800";
    if (riesgo < 0.6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getGradeColor = (grade) => {
    if (grade >= 4.0) return "text-green-600";
    if (grade >= 3.0) return "text-yellow-600";
    return "text-red-600";
  };

  // Función para manejar valores nulos/undefined de manera más descriptiva
  const formatValue = (value, fallback = "Sin datos", formatter = null) => {
    if (value === null || value === undefined || value === "") {
      return fallback;
    }
    return formatter ? formatter(value) : value;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado mejorado */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <User className="w-6 h-6" />
              Análisis individual de {fullName}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              📧 {student_email} • 🎂 {formatValue(data.edad, "Sin datos", (v) => `${v} años`)} • 📊 Estrato {formatValue(data.estrato, "No disponible")}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              📚 {data.materia} (curso {data.curso}) — Periodo {period}
            </p>
          </div>
          {data.prediccion_riesgo?.riesgo !== undefined && (
            <Badge className={getRiskBadgeColor(data.prediccion_riesgo.riesgo)}>
              {getRiskInterpretation(data.prediccion_riesgo.riesgo).toUpperCase()}
            </Badge>
          )}
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Promedio General</p>
                <p className={`text-2xl font-bold ${getGradeColor(data.promedio_general || 0)}`}>
                  {formatValue(data.promedio_general, "Sin datos", (v) => v.toFixed(2))}
                </p>
              </div>
              <Award className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rango de Notas</p>
                <p className="text-sm">
                  <span className={`font-bold ${getGradeColor(data.nota_min || 0)}`}>
                    {formatValue(data.nota_min, "N/A", (v) => v.toFixed(1))}
                  </span>
                  {' - '}
                  <span className={`font-bold ${getGradeColor(data.nota_max || 0)}`}>
                    {formatValue(data.nota_max, "N/A", (v) => v.toFixed(1))}
                  </span>
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Asistencia Periodo</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatValue(data.asistencia_periodo, "Sin datos", (v) => `${(v * 100).toFixed(0)}%`)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tareas Perdidas</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatValue(data.tareas_no_entregadas, "Sin datos")}
                </p>
              </div>
              <FileX className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información adicional de entregas */}
      {(data.total_evaluaciones || data.entregas_tardias || data.tareas_no_entregadas) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Resumen de Entregas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {formatValue(data.total_evaluaciones, "Sin datos")}
                </p>
                <p className="text-sm text-gray-600">Total Evaluaciones</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {formatValue(data.entregas_tardias, "Sin datos")}
                </p>
                <p className="text-sm text-gray-600">Entregas Tardías</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {formatValue(data.tareas_no_entregadas, "Sin datos")}
                </p>
                <p className="text-sm text-gray-600">No Entregadas</p>
              </div>
            </div>
            {data.tareas_no_entregadas > 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">
                  ⚠️ El estudiante dejó de entregar {data.tareas_no_entregadas} tarea(s) en este periodo.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Distribución de tipos de evaluación */}
      {distributionData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Evaluaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer height={250}>
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
            </CardContent>
          </Card>

          {/* Promedios por tipo */}
          <Card>
            <CardHeader>
              <CardTitle>Promedios por Tipo de Evaluación</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer height={250}>
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
            </CardContent>
          </Card>
        </div>
      )}

      {/* Evolución individual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Evolución por Periodo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {evolutionData.length > 0 ? (
            <ResponsiveContainer height={200}>
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
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-2">📊 No hay datos de evolución disponibles</p>
              <p className="text-sm text-gray-400">Se necesitan al menos dos periodos con calificaciones</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comparación vs grupo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Comparación con el Grupo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer height={200}>
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
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Diferencia: <span className={`font-semibold ${
                (data.promedio_general || 0) >= (group.promedioGroup || 0) ? 'text-green-600' : 'text-red-600'
              }`}>
                {((data.promedio_general || 0) - (group.promedioGroup || 0) >= 0 ? '+' : '')}{((data.promedio_general || 0) - (group.promedioGroup || 0)).toFixed(2)} puntos
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Narrativa mejorada */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Resumen del Análisis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">📊 Rendimiento Académico</h4>
            <p className="text-blue-800">
              {fullName} obtuvo un promedio de <strong>{formatValue(data.promedio_general, "sin datos", (v) => v.toFixed(2))}</strong>, 
              mientras que el promedio del curso fue de <strong>{formatValue(group.promedioGroup, "sin datos", (v) => v.toFixed(2))}</strong>.
              {data.nota_min && data.nota_max && (
                <> Su rango de notas va desde <strong>{data.nota_min.toFixed(1)}</strong> hasta <strong>{data.nota_max.toFixed(1)}</strong>.</>
              )}
            </p>
          </div>

          {data.prediccion_riesgo?.riesgo !== undefined && (
            <div className={`p-4 border rounded-lg ${
              data.prediccion_riesgo.riesgo < 0.3 ? 'bg-green-50 border-green-200' :
              data.prediccion_riesgo.riesgo < 0.6 ? 'bg-yellow-50 border-yellow-200' :
              'bg-red-50 border-red-200'
            }`}>
              <h4 className={`font-semibold mb-2 ${getRiskColor(data.prediccion_riesgo.riesgo)}`}>
                🤖 Análisis de Riesgo IA
              </h4>
              <p className={getRiskColor(data.prediccion_riesgo.riesgo)}>
                Su riesgo IA es <strong>{(data.prediccion_riesgo.riesgo * 100).toFixed(0)}%</strong> 
                (confianza {Math.round((data.prediccion_riesgo.confianza || 0) * 100)}%), 
                lo que indica <strong>{getRiskInterpretation(data.prediccion_riesgo.riesgo)}</strong>.
              </p>
            </div>
          )}

          {data.asistencia_periodo && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">🕐 Asistencia</h4>
              <p className="text-purple-800">
                Asistencia en el periodo: <strong>{(data.asistencia_periodo * 100).toFixed(0)}%</strong>
                {data.asistencia && (
                  <> (Asistencia general: <strong>{(data.asistencia * 100).toFixed(0)}%</strong>)</>
                )}
              </p>
            </div>
          )}
          
          {/* Análisis de tendencia */}
          {evolutionData.length > 1 && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="font-semibold mb-2 text-gray-900">📈 Análisis de Tendencia:</h4>
              <p className="text-sm text-gray-700">
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
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
            <h4 className="font-semibold text-indigo-900 mb-2">💡 Recomendaciones Específicas</h4>
            <ul className="text-sm text-indigo-800 space-y-1">
              {data.tareas_no_entregadas > 0 && (
                <li>• <strong>Tareas pendientes:</strong> Dar seguimiento a las {data.tareas_no_entregadas} tarea(s) no entregadas</li>
              )}
              {data.entregas_tardias > 2 && (
                <li>• <strong>Puntualidad:</strong> Trabajar en la gestión del tiempo - {data.entregas_tardias} entregas tardías detectadas</li>
              )}
              {data.asistencia_periodo < 0.8 && (
                <li>• <strong>Asistencia:</strong> Mejorar la presencia en clases (actual: {(data.asistencia_periodo * 100).toFixed(0)}%)</li>
              )}
              {data.promedio_general < group.promedioGroup && (
                <li>• <strong>Rendimiento:</strong> Considerar apoyo adicional para alcanzar el promedio del grupo ({((group.promedioGroup - data.promedio_general) || 0).toFixed(2)} puntos de diferencia)</li>
              )}
              {data.prediccion_riesgo?.riesgo > 0.6 && (
                <li>• <strong>Intervención:</strong> Implementar estrategias de apoyo inmediato - alto riesgo detectado</li>
              )}
              {evolutionData.length > 1 && (() => {
                const trend = evolutionData[evolutionData.length - 1]?.nota - evolutionData[0]?.nota;
                if (trend > 0.2) return <li>• <strong>Fortalezas:</strong> Mantener la tendencia positiva actual</li>;
                if (trend < -0.2) return <li>• <strong>Atención:</strong> Abordar la tendencia descendente con estrategias de recuperación</li>;
                return null;
              })()}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}