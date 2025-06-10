// C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\teachers\CourseComparisonChart.jsx
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function CourseComparisonChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-gray-500">Sin datos comparativos</p>;
  }

  // Reprocesar si data viene como chart_data o real_vs_ia
  const formatted = data.map(d => ({
    course: d.course,
    promedio_real: d.average ?? d.promedio_real ?? null,
    riesgo_ia: d.riesgo_ia ?? null,
  }));

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formatted}>
          <XAxis dataKey="course" angle={-25} textAnchor="end" height={50} />
          <YAxis
            yAxisId="left"
            domain={[1, 5]}
            tick={{ fontSize: 12 }}
            label={{ value: 'Promedio Real', angle: -90, position: 'insideLeft' }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 1]}
            tick={{ fontSize: 12 }}
            label={{ value: 'Riesgo IA', angle: 90, position: 'insideRight' }}
          />
          <Tooltip />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="promedio_real"
            fill="#4CAF50"
            name="Promedio Real"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            yAxisId="right"
            dataKey="riesgo_ia"
            fill="#F44336"
            name="Riesgo IA"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
