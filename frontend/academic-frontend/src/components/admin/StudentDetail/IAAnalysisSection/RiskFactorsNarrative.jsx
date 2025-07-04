//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\admin\StudentDetail\IAAnalysisSection\RiskFactorsNarrative.jsx
import React from "react";

const RiskFactorsNarrative = ({ factors = [], recommendations = [] }) => {
  if ((!factors || factors.length === 0) && (!recommendations || recommendations.length === 0)) {
    return <p>No se identificaron factores de riesgo ni recomendaciones por el momento.</p>;
  }

  // Mapeo simple para explicaciones básicas de factores comunes
  const explicaciones = {
    "Baja asistencia": "El estudiante presenta baja asistencia, lo cual puede afectar su comprensión y desempeño académico.",
    "Promedio bajo": "El promedio general del estudiante está por debajo del nivel esperado, lo que indica dificultades en varias materias.",
    "Entregas tardías frecuentes": "El estudiante entrega tareas fuera del plazo, lo que afecta su calificación y hábitos de estudio.",
  };

  // Construir la explicación de factores con texto
  const textoFactores = factors.length > 0
    ? factors.map((factor, i) => (
        <p key={`factor-${i}`}>
          <strong>⚠️ {factor}:</strong> {explicaciones[factor] || "Se ha identificado este factor como un posible riesgo para el estudiante."}
        </p>
      ))
    : null;

  // Construir texto continuo de recomendaciones
  const textoRecomendaciones = recommendations.length > 0
    ? (
      <p>
        <strong>Recomendaciones:</strong> {recommendations.join("; ")}.
      </p>
    )
    : null;

  return (
    <div style={{ marginTop: 16 }}>
      <h3 className="text-lg font-semibold mb-2">Factores de Riesgo y Recomendaciones</h3>
      {textoFactores}
      {textoRecomendaciones}
    </div>
  );
};

export default RiskFactorsNarrative;
