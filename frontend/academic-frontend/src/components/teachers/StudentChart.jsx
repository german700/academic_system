//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\teachers\StudentChart.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const StudentChart = ({ data }) => {
  // Validar que tenemos datos
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="text-xs text-gray-400 italic p-2 bg-gray-50 rounded">
        📈 Sin datos para gráfico
      </div>
    );
  }

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-lg text-xs">
          <p className="font-medium">{`${label}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-24 mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 5,
            left: 5,
            bottom: 5,
          }}
        >
          <XAxis 
            dataKey="label" 
            tick={{ fontSize: 8 }}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={20}
          />
          <YAxis 
            domain={[1, 5]} 
            tick={{ fontSize: 8 }}
            width={20}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="score" 
            fill="#3B82F6" 
            radius={[1, 1, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StudentChart;