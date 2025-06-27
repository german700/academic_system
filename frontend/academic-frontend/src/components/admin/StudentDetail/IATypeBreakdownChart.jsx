// C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\admin\StudentDetail\IATypeBreakdownChart.jsx
import React from "react";

const IATypeBreakdownChart = ({ data }) => {
  const formattedData = Object.entries(data || {}).map(([tipo, valores]) => {
    const promedio =
      typeof valores?.promedio === "number"
        ? valores.promedio.toFixed(2)
        : "N/A";

    const evaluaciones = valores?.evaluaciones ?? 0;

    return {
      tipo,
      promedio,
      evaluaciones
    };
  });

  return (
    <div className="bg-white shadow-md rounded p-4">
      <h3 className="text-lg font-bold mb-2">Promedios por Tipo de Evaluación</h3>
      <table className="table-auto w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="py-1">Tipo</th>
            <th className="py-1">Promedio</th>
            <th className="py-1"># Evaluaciones</th>
          </tr>
        </thead>
        <tbody>
          {formattedData.map(({ tipo, promedio, evaluaciones }) => (
            <tr key={tipo} className="border-b">
              <td className="py-1">{tipo}</td>
              <td className="py-1">{promedio}</td>
              <td className="py-1">{evaluaciones}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IATypeBreakdownChart;
