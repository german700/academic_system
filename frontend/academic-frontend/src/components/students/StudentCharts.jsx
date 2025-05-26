//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\students\StudentCharts.jsx
import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = {
  Bajo: "#ef4444",      // Rojo - Notas 1.0-2.9
  Básico: "#f97316",    // Naranja - Notas 3.0-3.4
  Alto: "#3b82f6",      // Azul - Notas 3.5-4.4
  Superior: "#22c55e",  // Verde - Notas 4.5-5.0
};

const StudentCharts = ({ analysis }) => {
  if (!analysis) return null;

  const {
    promedios_por_materia = [],
    resumen_por_periodo = [],
    niveles_desempeno = {},
  } = analysis;

  // Solo usar el campo 'nota' (sistema colombiano 1-5)
  const materiasChartData = promedios_por_materia.map(item => ({
    ...item,
    nota: typeof item.nota === 'number' ? item.nota : 0
  }));

  const periodosChartData = resumen_por_periodo.map(item => ({
    ...item,
    nota: typeof item.nota === 'number' ? item.nota : 0
  }));

  const nivelesData = Object.keys(niveles_desempeno)
    .filter(key => niveles_desempeno[key] > 0)
    .map((key) => ({
      name: key,
      value: niveles_desempeno[key],
    }));

  // Función para obtener color según la nota
  const getBarColor = (nota) => {
    if (nota >= 4.5) return "#22c55e"; // Superior
    if (nota >= 3.5) return "#3b82f6"; // Alto
    if (nota >= 3.0) return "#f97316"; // Básico
    return "#ef4444"; // Bajo
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Gráficos Detallados</h2>

      {/* Promedios por materia */}
      {materiasChartData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Promedios por Materia</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={materiasChartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <XAxis 
                dataKey="materia" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
                interval={0}
              />
              <YAxis 
                domain={[1, 5]} 
                tickCount={5}
                label={{ value: 'Nota (1.0 - 5.0)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value) => [`${value.toFixed(2)}`, 'Nota']}
                labelStyle={{ color: '#374151' }}
                contentStyle={{ 
                  backgroundColor: '#f9fafb', 
                  border: '1px solid #d1d5db',
                  borderRadius: '6px'
                }}
              />
              <Bar 
                dataKey="nota" 
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-xs text-gray-500 text-center">
            <p>Escala colombiana: 1.0-2.9 (Bajo) | 3.0-3.4 (Básico) | 3.5-4.4 (Alto) | 4.5-5.0 (Superior)</p>
          </div>
        </div>
      )}

      {/* Promedios por periodo */}
      {periodosChartData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Evolución por Periodo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={periodosChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <XAxis 
                dataKey="periodo"
                formatter={(value) => `P${value}`}
                label={{ value: 'Periodos Académicos', position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                domain={[1, 5]} 
                tickCount={5}
                label={{ value: 'Nota (1.0 - 5.0)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value) => [`${value.toFixed(2)}`, 'Promedio']}
                labelFormatter={(label) => `Periodo ${label}`}
                contentStyle={{ 
                  backgroundColor: '#f0fdf4', 
                  border: '1px solid #22c55e',
                  borderRadius: '6px'
                }}
              />
              <Bar 
                dataKey="nota" 
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-xs text-gray-500 text-center">
            <p>Evolución del rendimiento académico por periodo</p>
          </div>
        </div>
      )}

      {/* Niveles de desempeño */}
      {nivelesData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribución de Niveles de Desempeño</h3>
          <div className="flex flex-col lg:flex-row items-center">
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={nivelesData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={({ name, value, percent }) => 
                    `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
                  }
                  labelLine={false}
                  fontSize={12}
                >
                  {nivelesData.map((entry) => (
                    <Cell 
                      key={`cell-${entry.name}`} 
                      fill={COLORS[entry.name] || "#8884d8"} 
                    />
                  ))}
                </Pie>
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => `${value}`}
                />
                <Tooltip 
                  formatter={(value, name) => [`${value} calificaciones`, name]}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Resumen textual de niveles */}
            <div className="lg:ml-6 mt-4 lg:mt-0 min-w-[250px]">
              <h4 className="font-semibold text-gray-700 mb-4">Resumen por Nivel:</h4>
              <div className="space-y-3">
                {nivelesData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-2 rounded bg-gray-50">
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded mr-3" 
                        style={{ backgroundColor: COLORS[item.name] || "#8884d8" }}
                      ></div>
                      <div>
                        <span className="text-sm font-medium">{item.name}</span>
                        <div className="text-xs text-gray-500">
                          {item.name === 'Superior' && '(4.5 - 5.0)'}
                          {item.name === 'Alto' && '(3.5 - 4.4)'}
                          {item.name === 'Básico' && '(3.0 - 3.4)'}
                          {item.name === 'Bajo' && '(1.0 - 2.9)'}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-700">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded text-xs text-blue-700">
                <p><strong>Total de calificaciones:</strong> {nivelesData.reduce((sum, item) => sum + item.value, 0)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay datos */}
      {materiasChartData.length === 0 && periodosChartData.length === 0 && nivelesData.length === 0 && (
        <div className="bg-gray-50 p-8 rounded-lg text-center border border-gray-200">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <p className="text-gray-600 text-lg font-medium mb-2">
            No hay datos suficientes para mostrar gráficos
          </p>
          <p className="text-gray-500 text-sm">
            Los gráficos aparecerán cuando haya calificaciones registradas
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentCharts;