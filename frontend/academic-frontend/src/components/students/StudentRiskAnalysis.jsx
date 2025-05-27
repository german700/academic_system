import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../shared/ui/card";

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
    <Card className="p-4">
      <CardContent>
        <h2 className="text-xl font-bold">Análisis de Riesgo Académico</h2>
        {riesgo ? (
          <>
            <p>Riesgo calculado: {(riesgo.riesgo_academico * 100).toFixed(1)}%</p>
            <p>Nivel estimado: <strong>{riesgo.riesgo_nivel.toUpperCase()}</strong></p>
          </>
        ) : (
          <p>Cargando análisis...</p>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentRiskAnalysis;
