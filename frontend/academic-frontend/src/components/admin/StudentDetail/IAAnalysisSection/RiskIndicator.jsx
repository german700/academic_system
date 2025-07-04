//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\admin\StudentDetail\IAAnalysisSection\RiskIndicator.jsx
import React from "react";

const RiskIndicator = ({ riskIndex, confidence }) => {
  // Explicación simple del índice de riesgo, para que un administrativo lo entienda fácil
  const getRiskExplanation = (risk) => {
    if (risk >= 0.8) {
      return "El índice indica que el estudiante está en riesgo alto. Esto significa que enfrenta dificultades importantes y necesita apoyo urgente para mejorar su desempeño académico.";
    }
    if (risk >= 0.5) {
      return "El índice señala un riesgo moderado. El estudiante tiene algunas dificultades que requieren atención para evitar que empeoren.";
    }
    if (risk >= 0.2) {
      return "El índice muestra un riesgo bajo, lo que indica que el estudiante está teniendo un desempeño aceptable, aunque conviene monitorear ciertos aspectos para mantener o mejorar su situación.";
    }
    return "El índice es muy bajo, lo que significa que el estudiante está en una situación académica saludable y no hay señales de riesgo significativas.";
  };

  // Explicación sencilla de la confianza en el análisis
  const getConfidenceExplanation = (conf) => {
    if (conf >= 0.9) {
      return "La confianza en este análisis es alta, por lo que la predicción es bastante confiable.";
    }
    if (conf >= 0.7) {
      return "La confianza es moderada, por lo que el análisis es útil pero podría variar.";
    }
    return "La confianza es baja, así que se recomienda considerar otros datos antes de tomar decisiones.";
  };

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <h3>Índice de Riesgo Académico</h3>
      <p>
        <strong>{(riskIndex * 100).toFixed(1)}%</strong> de riesgo sobre un máximo de <strong>100%</strong>.
      </p>
      <p>
        Esto significa que, en una escala donde 0 es sin riesgo y 1 es riesgo máximo, el estudiante tiene un nivel de riesgo de <strong>{riskIndex.toFixed(2)}</strong>.
      </p>
      <p>{getRiskExplanation(riskIndex)}</p>

      <h4>Nivel de Confianza del Análisis</h4>
      <p>
        {(confidence * 100).toFixed(0)}% — {getConfidenceExplanation(confidence)}
      </p>
    </div>
  );
};

export default RiskIndicator;
