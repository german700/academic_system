//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\admin\StudentDetail\IAAnalysisSection.jsx
import React from "react";
import RiskIndicator from "./IAAnalysisSection/RiskIndicator";
// import RiskFactorsTags from "./IAAnalysisSection/RiskFactorsTags"; // eliminar
// import RecommendationsList from "./IAAnalysisSection/RecommendationsList"; // eliminar
import RiskFactorsNarrative from "./IAAnalysisSection/RiskFactorsNarrative"; // nuevo componente
import EvaluationTypeChart from "./IAAnalysisSection/EvaluationTypeChart";
import TrendChart from "./IAAnalysisSection/TrendChart";
import SubjectsAtRiskList from "./IAAnalysisSection/SubjectsAtRiskList";

const IAAnalysisSection = ({ ia }) => {
  if (!ia) return <p>No se encontró análisis basado en IA.</p>;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-2">🤖 Análisis por Inteligencia Artificial</h2>

      <p><strong>Resumen Narrativo:</strong></p>
      <p className="italic text-gray-700">{ia.summary}</p>

      <RiskIndicator riskIndex={ia.risk_index} confidence={ia.confidence} />

      <RiskFactorsNarrative
        factors={ia.risk_factors}
        recommendations={ia.recommendations}
      />

      <EvaluationTypeChart data={ia.evaluation_type_breakdown} />

      <TrendChart trendData={ia.trend_over_periods} />

      <SubjectsAtRiskList
        atRiskSubjects={ia.subjects_at_risk}
        underperforming={ia.underperforming_subjects}
      />
    </div>
  );
};

export default IAAnalysisSection;
