//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\teachers\PeriodComparisonChart.jsx
import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "../shared/ui/card";

export default function PeriodComparisonChart({ data, courseName, subjectName }) {
  // Reconstruir array [{period: '1', avg:3.81}, …]
  const chartData = Object.entries(data).map(([period, avg]) => ({ period, avg }));

  return (
    <Card>
      <CardHeader><CardTitle>Comparativa de Periodos</CardTitle></CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mb-4">
          Comparación del promedio real de <strong>{subjectName || "Matemáticas"}</strong> en el curso <strong>{courseName}</strong> entre periodos.
        </p>
        
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <XAxis dataKey="period" />
            <YAxis domain={['dataMin', 'dataMax']} />
            <Tooltip 
              formatter={(value) => [`${value.toFixed(2)}`, 'Promedio']}
              labelFormatter={(label) => `Periodo ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="avg" 
              stroke="#4ade80" 
              strokeWidth={3}
              dot={{ fill: '#4ade80', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
        
        {/* Leyenda del gráfico */}
        <div className="mt-3 p-2 bg-gray-50 rounded border">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-green-400 rounded"></div>
              <span>Evolución del promedio</span>
            </div>
            <div className="text-gray-600">
              <span className="font-medium">Escala:</span> Promedio de 1.0 a 5.0
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}