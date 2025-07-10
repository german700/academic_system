import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../shared/ui/card";
import "./students_css/StudentRiskAnalysis.css"; // <- nuevo import

const StudentRiskAnalysis = () => {
  const [riesgo, setRiesgo] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/analytics/student-risk/", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setRiesgo(data));
  }, []);

  return (
    <Card className="risk-analysis-card">
      <CardContent>
        <h2 className="risk-analysis-title">Análisis de Riesgo Académico</h2>
        {riesgo ? (
          <>
            <p className="risk-analysis-percentage">
              Riesgo calculado: {(riesgo.riesgo_academico * 100).toFixed(1)}%
            </p>
            <p className="risk-analysis-level">
              Nivel estimado: <strong>{riesgo.riesgo_nivel.toUpperCase()}</strong>
            </p>
          </>
        ) : (
          <p className="risk-analysis-loading">Cargando análisis...</p>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentRiskAnalysis;
