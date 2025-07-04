//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\admin\TeacherDetail\RiskAnalysis.jsx
import React, { useEffect, useState } from "react";
import { fetchTeacherIAAnalysis } from "../../services/docentesService";
import IAInsightNarrative from "./IAAnalysisSection/IAInsightNarrative";
import DeliveryComplianceChart from "./IAAnalysisSection/DeliveryComplianceChart";
import RiskDistributionChart from "./IAAnalysisSection/RiskDistributionChart";
import { Card } from "../../shared/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../shared/ui/select";

const RiskAnalysis = ({ teacherId }) => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(1);
  const [data, setData] = useState({
    narrative: "",
    delivery_compliance: {},
    risk_distribution: {},
  });

  useEffect(() => {
    setLoading(true);
    fetchTeacherIAAnalysis(teacherId, period)
      .then((json) => setData(json))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [teacherId, period]);

  if (loading) return <p>Cargando análisis de IA…</p>;

  const { narrative, delivery_compliance, risk_distribution } = data;

  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Análisis IA del Docente</h2>

      {/* Selector de periodo */}
      <div className="mb-4">
        <label className="mr-2 font-medium">Periodo:</label>
        <Select value={period.toString()} onValueChange={(val) => setPeriod(Number(val))}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Selecciona un período" />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4].map((p) => (
              <SelectItem key={p} value={p.toString()}>
                Período {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 1. Narrativa */}
      <Card className="mb-6 p-4">
        <IAInsightNarrative narrative={narrative} />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 2. Cumplimiento entregas */}
        <Card className="p-4">
          <DeliveryComplianceChart data={delivery_compliance} />
        </Card>

        {/* 3. Distribución riesgo */}
        <Card className="p-4">
          <RiskDistributionChart data={risk_distribution} />
        </Card>
      </div>
    </section>
  );
};

export default RiskAnalysis;