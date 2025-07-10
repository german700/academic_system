// src/components/admin/TeacherDetail/RiskAnalysis.jsx
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
import "./TeacherDetail_css/RiskAnalysis.css";

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

  if (loading) return <p className="loading-text">Cargando análisis de IA…</p>;

  const { narrative, delivery_compliance, risk_distribution } = data;

  return (
    <section className="risk-analysis-section">
      <h2 className="risk-analysis-title">Análisis IA del Docente</h2>

      {/* Selector de periodo */}
      <div className="period-selector">
        <label className="font-medium">Periodo:</label>
        <Select value={period.toString()} onValueChange={(val) => setPeriod(Number(val))}>
          <SelectTrigger className="period-select-trigger">
            <SelectValue placeholder="Selecciona un período" />
          </SelectTrigger>
          <SelectContent className="period-select-content">
            {[1, 2, 3, 4].map((p) => (
              <SelectItem key={p} value={p.toString()} className="period-select-item">
                Período {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Narrativa */}
      <Card className="narrative-card mb-6">
        <IAInsightNarrative narrative={narrative} />
      </Card>

      {/* Gráficas */}
      <div className="charts-grid">
        <Card className="chart-card">
          <DeliveryComplianceChart data={delivery_compliance} />
        </Card>
        <Card className="chart-card">
          <RiskDistributionChart data={risk_distribution} />
        </Card>
      </div>
    </section>
  );
};

export default RiskAnalysis;