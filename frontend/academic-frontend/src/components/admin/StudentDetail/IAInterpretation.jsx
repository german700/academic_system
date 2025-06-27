//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\admin\StudentDetail\IAInterpretation.jsx
import React from 'react';

const IAInterpretation = ({ data }) => {
  if (!data) return null;

  const { risk_index, trend_over_periods, evaluation_type_breakdown, subjects_at_risk, recommendations } = data;

  const riskLevel = risk_index >= 0.7 ? "alto" : risk_index >= 0.4 ? "moderado" : "bajo";

  // 1. Tendencia
  const sortedPeriods = Object.entries(trend_over_periods || {}).sort(
    ([a], [b]) => Number(a) - Number(b)
  );
  const lastPeriodNote = sortedPeriods.at(-1)?.[1];
  const secondLastNote = sortedPeriods.at(-2)?.[1];
  const trendMessage = lastPeriodNote < secondLastNote
    ? "Las notas han bajado recientemente."
    : lastPeriodNote > secondLastNote
      ? "Las notas han mejorado en el último periodo."
      : "Las notas se han mantenido estables.";

  // 2. Evaluaciones más débiles
  const lowestType = Object.entries(evaluation_type_breakdown || {}).reduce(
    (acc, [tipo, { average }]) => (average < acc.avg ? { tipo, avg: average } : acc),
    { tipo: "", avg: 5 }
  );

  return (
    <div className="my-6 p-4 bg-yellow-50 border border-yellow-300 rounded">
      <h3 className="text-lg font-semibold mb-2">🧠 Interpretación del Análisis IA</h3>
      <p className="mb-2">El sistema estima un <strong>riesgo {riskLevel}</strong> para este estudiante.</p>

      <p className="mb-2">{trendMessage}</p>

      {lowestType.tipo && (
        <p className="mb-2">
          El tipo de evaluación con menor promedio es <strong>{lowestType.tipo}</strong> ({lowestType.avg.toFixed(2)}).
        </p>
      )}

      {subjects_at_risk?.length > 0 && (
        <p className="mb-2">
          Materias con mayor riesgo actual: <strong>{subjects_at_risk.join(", ")}</strong>.
        </p>
      )}

      {recommendations?.length > 0 && (
        <p className="italic text-sm mt-3">Sugerencia del modelo: {recommendations[0]}</p>
      )}
    </div>
  );
};

export default IAInterpretation;
