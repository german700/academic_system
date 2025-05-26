// C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\students\StudentAnalysis.jsx

import React, { useEffect, useState } from "react";
import { getStudentAnalysis } from "../services/analyticsService";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import StudentCharts from "./StudentCharts";

// Colores para el gráfico de pastel
const COLORS = ['#ef4444', '#f97316', '#22c55e', '#3b82f6']; // Rojo, Naranja, Verde, Azul

const StudentAnalysis = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getStudentAnalysis()
      .then(setData)
      .catch(() => setError("No se pudo cargar el análisis de IA"));
  }, []);

  if (error) return <p className="text-red-500 p-4">{error}</p>;
  if (!data) return <p className="p-4">Cargando análisis...</p>;
  if (data.mensaje) return <p className="p-4">{data.mensaje}</p>;

  const chartData = Object.entries(data.niveles_desempeno || {}).map(([nivel, value]) => ({
    name: nivel,
    value: value,
  }));

  const getGradeColor = (nota) => {
    if (nota >= 4.5) return 'text-green-600';
    if (nota >= 3.5) return 'text-blue-600';
    if (nota >= 3.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Análisis Personalizado</h2>

      {/* Informe Narrativo */}
      {data.informe_narrativo && (
        <div className="bg-gray-50 p-4 rounded mb-6 whitespace-pre-line text-gray-700">
          <h3 className="text-lg font-semibold mb-2">Informe Narrativo</h3>
          <p>{data.informe_narrativo}</p>
        </div>
      )}

      {/* Promedio General */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Promedio General</h3>
        <p className="text-3xl font-bold text-blue-600">
          {typeof data.promedio_general === 'number' ? data.promedio_general.toFixed(2) : data.promedio_general}
        </p>
        <p className="text-sm text-blue-700 mt-1">
          Escala de 1.0 a 5.0
        </p>
      </div>

      {/* Gráfico de Niveles de Desempeño */}
      {data.niveles_desempeno && Object.keys(data.niveles_desempeno).length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Niveles de Desempeño</h3>
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

            {/* Resumen de niveles */}
            <div className="lg:ml-6 mt-4 lg:mt-0">
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(data.niveles_desempeno).map(([nivel, cantidad], index) => (
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
        {data.promedios_por_materia && data.promedios_por_materia.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Promedios por Materia</h3>
            <div className="space-y-2">
              {data.promedios_por_materia.map((m, index) => (
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
        {data.resumen_por_periodo && data.resumen_por_periodo.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Resumen por Periodo</h3>
            <div className="space-y-2">
              {data.resumen_por_periodo.map((p, index) => (
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
        {/* Materias con Bajo Rendimiento */}
        {data.materias_con_bajo_rendimiento && data.materias_con_bajo_rendimiento.length > 0 && (
          <div className="bg-red-50 p-6 rounded-lg border border-red-200">
            <h3 className="text-lg font-semibold text-red-800 mb-4">
              ⚠️ Materias con Bajo Rendimiento
            </h3>
            <ul className="space-y-2">
              {data.materias_con_bajo_rendimiento.map((m, index) => (
                <li key={`bajo-${index}`} className="text-red-700 font-medium">• {m}</li>
              ))}
            </ul>
            <div className="mt-3 text-xs text-red-600">
              <p>Materias con promedio menor a 3.0</p>
            </div>
          </div>
        )}

        {/* Recomendaciones */}
        {data.recomendaciones && data.recomendaciones.length > 0 && (
          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <h3 className="text-lg font-semibold text-yellow-800 mb-4">
              💡 Recomendaciones
            </h3>
            <ul className="space-y-2">
              {data.recomendaciones.map((r, i) => (
                <li key={`rec-${i}`} className="text-yellow-700">• {r}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Componente StudentCharts */}
      {data && (
        <div className="mt-8">
          <StudentCharts analysis={data} />
        </div>
      )}
    </div>
  );
};

export default StudentAnalysis;
