//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\admin\StudentDetail\IAAnalysisSection\TrendChart.jsx
import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const TrendChart = ({ trendData }) => {
  console.log("Este es el trend ", trendData);
  
  // Validación de datos
  if (!trendData || Object.keys(trendData).length === 0) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
        <h3>Tendencia del Promedio por Periodo</h3>
        <p>No hay datos disponibles para mostrar la tendencia.</p>
      </div>
    );
  }

  // Conversión explícita a números
  const data = Object.entries(trendData).map(([period, avg]) => ({
    period,
    average: Number(avg) // Conversión explícita a número
  }));

  console.log("Datos procesados para el gráfico:", data);

  return (
    <div>
      <h3>Tendencia del Promedio por Periodo</h3>
      {/* Contenedor padre con tamaño visible garantizado */}
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
            {/* Eje X con formato personalizado */}
            <XAxis 
              dataKey="period" 
              tickFormatter={(tick) => `Periodo ${tick}`}
            />
            {/* Eje Y con dominio apropiado para promedios académicos */}
            <YAxis 
              domain={[0, 5]} 
              tickFormatter={(value) => value.toFixed(1)}
            />
            {/* Tooltip mejorado */}
            <Tooltip 
              formatter={(value) => [value.toFixed(2), 'Promedio']}
              labelFormatter={(label) => `Periodo ${label}`}
            />
            {/* Línea con mayor visibilidad */}
            <Line 
              type="monotone" 
              dataKey="average" 
              stroke="#82ca9d" 
              strokeWidth={3}
              dot={{ fill: "#82ca9d", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "#82ca9d", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendChart;