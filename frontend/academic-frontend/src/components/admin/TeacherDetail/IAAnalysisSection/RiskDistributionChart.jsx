import React, { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../../shared/ui/select";
import { Card } from "../../../shared/ui/card";
import { Badge } from "../../../shared/ui/badge";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";
import "./IAAnalysisSection_css/RiskDistributionChart.css";

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

const RiskDistributionChart = ({ data }) => {
  const cursos = Object.keys(data);
  const [curso, setCurso] = useState(cursos[0]);

  if (!cursos.length) {
    return (
      <div className="risk-chart-container">
        <div className="risk-header">
          <h3 className="risk-title">Distribución de Riesgo</h3>
        </div>
        <div className="flex items-center justify-center h-48 text-gray-500">
          No hay datos disponibles
        </div>
      </div>
    );
  }

  const dist = data[curso] || { low: 0, medium: 0, high: 0 };
  const total = dist.low + dist.medium + dist.high;
  const pieData = [
    { name: 'Bajo', value: dist.low, color: COLORS[0] },
    { name: 'Medio', value: dist.medium, color: COLORS[1] },
    { name: 'Alto', value: dist.high, color: COLORS[2] },
  ].filter(item => item.value > 0);

  return (
    <div className="risk-chart-container">
      <div className="risk-header">
        <h3 className="risk-title">Distribución de Riesgo</h3>
        <div className="flex items-center gap-2">
          <span style={{ 
            fontSize: 'var(--text-sm)', 
            color: 'var(--text-secondary)' 
          }}>
            Curso:
          </span>
          <Select value={curso} onValueChange={setCurso}>
            <SelectTrigger className="risk-select-trigger">
              <SelectValue placeholder="Selecciona un curso" />
            </SelectTrigger>
            <SelectContent className="risk-select-content">
              {cursos.map((c) => (
                <SelectItem key={c} value={c} className="risk-select-item">
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="risk-summary">
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{dist.low}</div>
          <div className="text-sm text-gray-600">Riesgo Bajo</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold text-yellow-600">{dist.medium}</div>
          <div className="text-sm text-gray-600">Riesgo Medio</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold text-red-600">{dist.high}</div>
          <div className="text-sm text-gray-600">Riesgo Alto</div>
        </Card>
      </div>

      <Card className="risk-chart-card">
        <div className="relative">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                label={({ name, value, percent }) =>
                  `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                }
                labelLine={false}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value, entry) => (
                  <span className="text-sm font-medium" style={{ color: entry.color }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="risk-chart-center">
            <div className="risk-chart-total">
              <div className="count">{total}</div>
              <div className="label">Total</div>
            </div>
          </div>
        </div>
      </Card>

      <div className="risk-badges">
        {pieData.map((item, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="px-3 py-1"
            style={{
              backgroundColor: `${item.color}20`,
              color: item.color,
              border: `1px solid ${item.color}30`
            }}
          >
            {item.name}: {((item.value / total) * 100).toFixed(1)}%
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default RiskDistributionChart;