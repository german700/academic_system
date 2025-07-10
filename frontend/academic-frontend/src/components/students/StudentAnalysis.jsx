// C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\students\StudentAnalysis.jsx

import React, { useEffect, useState } from "react";
import { getStudentFullAnalysis } from "../services/analyticsService";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import StudentCharts from "./StudentCharts";
import { AlertCircle, TrendingUp, TrendingDown, Brain, Target, BookOpen, Award, AlertTriangle, User, Calendar, BarChart3 } from 'lucide-react';
import "./students_css/StudentAnalysis.css";
import ReactMarkdown from "react-markdown";

// Colores para el gráfico de pastel
const COLORS = ['#ef4444', '#f97316', '#22c55e', '#3b82f6']; // Rojo, Naranja, Verde, Azul

const StudentAnalysis = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudentFullAnalysis()
      .then(setData)
      .catch(() => setError("No se pudo cargar el análisis de IA"))
      .finally(() => setLoading(false));
  }, []);

  const getRiskColor = (nivel) => {
    switch (nivel?.toLowerCase()) {
      case 'alto': return 'bg-red-100 text-red-800 border-red-200';
      case 'medio': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'bajo': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskIcon = (nivel) => {
    switch (nivel?.toLowerCase()) {
      case 'alto': return <AlertTriangle className="w-5 h-5" />;
      case 'medio': return <AlertCircle className="w-5 h-5" />;
      case 'bajo': return <Award className="w-5 h-5" />;
      default: return <BarChart3 className="w-5 h-5" />;
    }
  };

  const getGradeColor = (nota) => {
    if (nota >= 4.5) return 'text-green-600';
    if (nota >= 3.5) return 'text-blue-600';
    if (nota >= 3.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Función para obtener el color del disclaimer según riesgo y cantidad de materias
  const getDisclaimerColor = (materiasRiesgo, nivelRiesgo) => {
    const cantidadMaterias = materiasRiesgo?.length || 0;

    // Si hay riesgo alto, siempre rojo
    if (nivelRiesgo?.toLowerCase() === 'alto') {
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        title: 'text-red-800',
        text: 'text-red-700',
        icon: '🚨'
      };
    }

    // Si hay riesgo medio, naranja
    if (nivelRiesgo?.toLowerCase() === 'medio') {
      return {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        title: 'text-orange-800',
        text: 'text-orange-700',
        icon: '⚠️'
      };
    }

    // Para riesgo bajo, el color depende de la cantidad de materias
    if (cantidadMaterias >= 3) {
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        title: 'text-yellow-800',
        text: 'text-yellow-700',
        icon: '📊'
      };
    } else if (cantidadMaterias === 2) {
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        title: 'text-blue-800',
        text: 'text-blue-700',
        icon: '📌'
      };
    } else {
      return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        title: 'text-green-800',
        text: 'text-green-700',
        icon: '💡'
      };
    }
  };

  // Función para generar el mensaje dinámico - VERSIÓN CORREGIDA
  const getDisclaimerMessage = (materiasRiesgo, nivelRiesgo) => {
    const cantidadMaterias = materiasRiesgo?.length || 0;
    const materiasTexto = materiasRiesgo.join(', ');

    if (nivelRiesgo?.toLowerCase() === 'alto') {
      return `El modelo de IA detecta señales de alerta en ${materiasTexto}. Aunque tienen notas aprobatorias, el algoritmo identifica patrones que requieren atención preventiva.`;
    }

    if (nivelRiesgo?.toLowerCase() === 'medio') {
      return `Se detecta un desempeño relativamente menor en ${materiasTexto} comparado con otras materias. Aunque las notas son buenas, se sugiere mantener atención.`;
    }

    if (cantidadMaterias >= 3) {
      return `Se identificaron múltiples materias (${materiasTexto}) con desempeño relativamente menor según el análisis de IA. Las notas son buenas, pero se sugiere un plan de mejora preventivo.`;
    } else if (cantidadMaterias === 2) {
      return `Las materias ${materiasTexto} presentan un desempeño relativamente inferior según el análisis de IA. Aunque las notas son buenas, se recomienda mantener atención preventiva.`;
    } else {
      return `La materia ${materiasTexto} presenta el desempeño más bajo según el análisis de IA. Aunque la nota es buena, se sugiere atención preventiva para mantener la excelencia.`;
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="ml-4 text-gray-600">Cargando análisis de IA...</p>
    </div>
  );

  if (error) return <p className="text-red-500 p-4 bg-red-50 rounded">{error}</p>;
  if (!data) return <p className="p-4">No hay datos disponibles</p>;

  // Extraer datos del análisis y predicción
  const analysisData = data.analisis_rendimiento || {};
  const riskData = data.prediccion_riesgo || {};
  const studentInfo = data.estudiante || {};

  if (analysisData.mensaje) return <p className="p-4">{analysisData.mensaje}</p>;

  const chartData = Object.entries(analysisData.niveles_desempeno || {}).map(([nivel, value]) => ({
    name: nivel,
    value: value,
  }));

  // Verificar si hay disclaimer activo - VERSIÓN CORREGIDA
  const hasDisclaimerActive = riskData?.materias_con_riesgo && 
    riskData.materias_con_riesgo.length > 0 && 
    riskData.materias_con_riesgo.some(materiaRiesgo => {
      // Buscar la materia en promedios_por_materia para verificar su nota real
      const materiaData = analysisData.promedios_por_materia?.find(m => 
        m.materia.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() === 
        materiaRiesgo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()
      );
      
      // Si la materia tiene nota >= 3.0, entonces es un "falso positivo" y debe mostrarse el disclaimer
      return materiaData && materiaData.nota >= 3.0;
    });

  // También actualiza la condición para mostrar "Materias con Bajo Rendimiento"
  // Solo mostrar si realmente hay materias con nota < 3.0
  const materiasRealmenteBajas = analysisData.materias_con_bajo_rendimiento?.filter(materiaBaja => {
    const materiaData = analysisData.promedios_por_materia?.find(m => 
      m.materia.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() === 
      materiaBaja.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()
    );
    return materiaData && materiaData.nota < 3.0;
  }) || [];

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      {/* Header con información del estudiante */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <User className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Análisis Personalizado con IA</h1>
              <p className="text-gray-600">{studentInfo.nombre || 'Estudiante'}</p>
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-1" />
            {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Tarjeta de Predicción de Riesgo IA */}
      {riskData && Object.keys(riskData).length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-blue-500">
          <div className="flex items-center mb-4">
            <Brain className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-800">Predicción de Riesgo Académico (IA)</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Nivel de Riesgo */}
            {riskData.nivel_riesgo && (
              <div className={`p-4 rounded-lg border-2 ${getRiskColor(riskData.nivel_riesgo)}`}>
                <div className="flex items-center mb-2">
                  {getRiskIcon(riskData.nivel_riesgo)}
                  <span className="ml-2 font-semibold">Nivel de Riesgo</span>
                </div>
                <p className="text-2xl font-bold">{riskData.nivel_riesgo}</p>
              </div>
            )}

            {/* Probabilidad */}
            {riskData.probabilidad_riesgo && (
              <div className="bg-purple-50 border-2 border-purple-200 text-purple-800 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Target className="w-5 h-5" />
                  <span className="ml-2 font-semibold">Probabilidad</span>
                </div>
                <p className="text-2xl font-bold">{(riskData.probabilidad_riesgo * 100).toFixed(1)}%</p>
              </div>
            )}

            {/* Confianza del Modelo */}
            {riskData.confianza_modelo && (
              <div className="bg-indigo-50 border-2 border-indigo-200 text-indigo-800 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <BarChart3 className="w-5 h-5" />
                  <span className="ml-2 font-semibold">Confianza IA</span>
                </div>
                <p className="text-2xl font-bold">{(riskData.confianza_modelo * 100).toFixed(1)}%</p>
              </div>
            )}
          </div>

          {/* Factores de Riesgo */}
          {riskData.factores_riesgo && riskData.factores_riesgo.length > 0 && (
            <div className="mt-4 bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2">⚠️ Factores de Riesgo Identificados:</h4>
              <ul className="list-disc list-inside text-orange-700">
                {riskData.factores_riesgo.map((factor, index) => (
                  <li key={index}>{factor}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Recomendaciones IA */}
          {riskData.recomendaciones_ia && riskData.recomendaciones_ia.length > 0 && (
            <div className="mt-4 bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">🤖 Recomendaciones de la IA:</h4>
              <ul className="list-disc list-inside text-green-700">
                {riskData.recomendaciones_ia.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Informe Narrativo */}
      {analysisData.informe_narrativo && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">📋 Informe Narrativo</h3>
          <div className="prose max-w-none bg-gray-50 p-4 rounded-lg">
            <ReactMarkdown>{analysisData.informe_narrativo}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Promedio General */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-2">📊 Promedio General</h3>
        <p className="text-4xl font-bold">
          {typeof analysisData.promedio_general === 'number' ? analysisData.promedio_general.toFixed(2) : analysisData.promedio_general}
        </p>
        <p className="text-blue-100 mt-1">Escala de 1.0 a 5.0</p>
      </div>

      {/* Gráfico de Niveles de Desempeño */}
      {analysisData.niveles_desempeno && Object.keys(analysisData.niveles_desempeno).length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">📈 Niveles de Desempeño</h3>
          <div className="flex flex-col lg:flex-row items-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  dataKey="value"
                  isAnimationActive={true}
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>

            <div className="lg:ml-6 mt-4 lg:mt-0">
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(analysisData.niveles_desempeno).map(([nivel, cantidad], index) => (
                  <div key={nivel} className="flex items-center">
                    <div
                      className="w-4 h-4 rounded mr-2"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-sm">
                      <strong>{nivel}:</strong> {cantidad} calificaciones
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Layout de dos columnas para el resto del contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Promedios por Materia */}
        {analysisData.promedios_por_materia && analysisData.promedios_por_materia.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">📚 Promedios por Materia</h3>
            <div className="space-y-2">
              {analysisData.promedios_por_materia.map((m, index) => (
                <div key={`${m.materia}-${index}`} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium">{m.materia}</span>
                  <span className={`font-bold text-lg ${getGradeColor(m.nota)}`}>
                    {typeof m.nota === 'number' ? m.nota.toFixed(2) : m.nota}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-xs text-gray-500">
              <p>Escala: 1.0-2.9 (Bajo) | 3.0-3.4 (Básico) | 3.5-4.4 (Alto) | 4.5-5.0 (Superior)</p>
            </div>
          </div>
        )}

        {/* Resumen por Periodo */}
        {analysisData.resumen_por_periodo && analysisData.resumen_por_periodo.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">📅 Resumen por Periodo</h3>
            <div className="space-y-2">
              {analysisData.resumen_por_periodo.map((p, index) => (
                <div key={`periodo-${p.periodo}-${index}`} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium">Periodo {p.periodo}</span>
                  <span className={`font-bold text-lg ${getGradeColor(p.nota)}`}>
                    {typeof p.nota === 'number' ? p.nota.toFixed(2) : p.nota}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-xs text-gray-500">
              <p>Escala: 1.0-2.9 (Bajo) | 3.0-3.4 (Básico) | 3.5-4.4 (Alto) | 4.5-5.0 (Superior)</p>
            </div>
          </div>
        )}
      </div>

      {/* Alertas y Recomendaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Materias con Bajo Rendimiento - VERSIÓN CORREGIDA */}
        {materiasRealmenteBajas.length > 0 && (
          <div className="bg-red-50 p-6 rounded-lg border border-red-200">
            <h3 className="text-lg font-semibold text-red-800 mb-4">
              ⚠️ Materias con Bajo Rendimiento
            </h3>
            <ul className="space-y-2">
              {materiasRealmenteBajas.map((m, index) => (
                <li key={`bajo-${index}`} className="text-red-700 font-medium">{m}</li>
              ))}
            </ul>
            <div className="mt-3 text-xs text-red-600">
              <p>Materias con promedio menor a 3.0</p>
            </div>
          </div>
        )}

        {/* Disclaimer dinámico si hay riesgo IA pero notas no son realmente bajas */}
        {hasDisclaimerActive && (() => {
          const disclaimerColor = getDisclaimerColor(riskData.materias_con_riesgo, riskData.nivel_riesgo);
          const disclaimerMessage = getDisclaimerMessage(riskData.materias_con_riesgo, riskData.nivel_riesgo);

          return (
            <div className={`p-4 rounded-lg border ${disclaimerColor.bg} ${disclaimerColor.border}`}>
              <h3 className={`text-sm font-semibold mb-1 ${disclaimerColor.title}`}>
                {disclaimerColor.icon} Nota del sistema:
              </h3>
              <p className={`text-sm ${disclaimerColor.text}`}>
                {disclaimerMessage}
              </p>
            </div>
          );
        })()}

        {/* Recomendaciones */}
        {analysisData.recomendaciones && analysisData.recomendaciones.length > 0 && (
          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <h3 className="text-lg font-semibold text-yellow-800 mb-4">
              💡 Recomendaciones
            </h3>
            <ul className="space-y-2">
              {analysisData.recomendaciones.map((r, i) => (
                <li key={`rec-${i}`} className="text-yellow-700">{r}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Componente StudentCharts */}
      {analysisData && (
        <div className="mt-8">
          <StudentCharts analysis={analysisData} />
        </div>
      )}
    </div>
  );
};

export default StudentAnalysis;