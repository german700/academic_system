//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\admin\StudentDetail\IAPeriodSummaryChart.jsx
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const IAPeriodSummaryChart = ({ data }) => {
  if (!data) return <p>No hay datos de evolución por periodo.</p>;

  const chartData = data.map(p => ({
    periodo: `P${p.periodo}`,
    nota: p.nota
  }));

  return (
    <div className="my-6">
      <h3 className="text-lg font-semibold mb-2">📈 Evolución por Periodo</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="periodo" />
          <YAxis domain={[0, 5]} />
          <Tooltip />
          <Line type="monotone" dataKey="nota" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IAPeriodSummaryChart;
