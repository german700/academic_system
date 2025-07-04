//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\admin\StudentDetail\IAAnalysisSection\EvaluationTypeChart.jsx
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const EvaluationTypeChart = ({ data }) => {
  if (!data) return null;

  const chartData = Object.entries(data).map(([type, stats]) => ({
    type,
    average: stats.average || 0
  }));

  return (
    <div>
      <h3>Promedio por Tipo de Evaluación</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData}>
          <XAxis dataKey="type" />
          <YAxis domain={[0, 5]} />
          <Tooltip />
          <Bar dataKey="average" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EvaluationTypeChart;
