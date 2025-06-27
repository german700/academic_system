//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\admin\StudentDetail\IAAnalysisContainer.jsx
import React from 'react';
import IAAnalysisOverview from './IAAnalysisOverview';
import IARecommendation   from './IARecommendation';
import IAPeriodSummaryChart    from './IAPeriodSummaryChart';
import IATypeBreakdownChart    from './IATypeBreakdownChart';
import IAInterpretation        from './IAInterpretation';
import StudentGlobalIAAnalysis from "./StudentGlobalIAAnalysis";
import GradesDistributionBySubjectChart from "./GradesDistributionBySubjectChart";
import IAFullJsonDump          from './IAFullJsonDump';

const IAAnalysisContainer = ({ ia_analysis, grades_summary, student }) => {
  // ahora chequeamos los nuevos campos
  if (!ia_analysis || typeof ia_analysis.risk_index === 'undefined') {
    return <p>No hay análisis IA disponible.</p>;
  }

  const {
    risk_index,
    confidence,
    subjects_at_risk,
    recommendations,
    trend_over_periods,
    evaluation_type_breakdown
  } = ia_analysis;

  // 1) overview
  const overview = {
    prediccion_riesgo: {
      riesgo: risk_index,
      confianza: confidence,
      mensaje: recommendations[0] || "Sin mensaje principal"
    }
  };

  // 2) datos para gráfica de periodos
  const periodData = Object.entries(trend_over_periods || {}).map(
    ([p, n]) => ({ periodo: `Periodo ${p}`, nota: n })
  );

  // 3) datos para breakdown por tipo
  const typeData = Object.fromEntries(
    Object.entries(evaluation_type_breakdown || {}).map(([tipo, info]) => [
      tipo,
      { promedio: info.average, evaluaciones: info.count }
    ])
  );

  return (
    <div className="mt-4 grid gap-6">
      {/* 1. Résumé */}
      <IAAnalysisOverview analysis={overview} />

      {/* 2. Interpretación */}
      <IAInterpretation data={ia_analysis} />

      {/* 3. Recomendaciones */}
      <IARecommendation data={{
        risk_index,
        confidence,
        subjects_at_risk,
        recommendations
      }} />

      {/* 4. Evolución */}
      <IAPeriodSummaryChart data={periodData} />

      {/* 5. Breakdown */}
      <IATypeBreakdownChart data={typeData} />

      {/* 6. Comparativa global */}
      <StudentGlobalIAAnalysis studentId={student.id} />

      {/* 7. Debug JSON */}
      <IAFullJsonDump data={ia_analysis} />

      {/* 8. Distribución por materia */}
      {grades_summary?.activities && (
        <GradesDistributionBySubjectChart activities={grades_summary.activities} />
      )}
    </div>
  );
};

export default IAAnalysisContainer;