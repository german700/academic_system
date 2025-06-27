//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\admin\StudentDetail\IAAnalysisOverview.jsx
import React from 'react';

const IAAnalysisOverview = ({ analysis }) => {
  const { prediccion_riesgo } = analysis;
  if (!prediccion_riesgo) return null;

  const { riesgo, confianza, mensaje } = prediccion_riesgo;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Resumen de IA</h3>
      <p>Riesgo estimado: <strong>{(riesgo * 100).toFixed(1)}%</strong></p>
      <p>Confianza del modelo: <strong>{(confianza * 100).toFixed(1)}%</strong></p>
      <p>Mensaje: {mensaje}</p>
    </div>
  );
};

export default IAAnalysisOverview;
