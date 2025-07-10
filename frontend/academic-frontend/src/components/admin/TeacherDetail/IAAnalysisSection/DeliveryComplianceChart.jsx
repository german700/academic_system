import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card } from "../../../shared/ui/card";
import { Badge } from "../../../shared/ui/badge";
import "./IAAnalysisSection_css/DeliveryComplianceChart.css";

const DeliveryComplianceChart = ({ data }) => {
  const chartData = Object.entries(data).map(([course, pct]) => ({
    course, 
    pct: pct || 0,
    color: getComplianceColor(pct || 0)
  }));

  function getComplianceColor(pct) {
    if (pct >= 90) return '#10b981';
    if (pct >= 70) return '#f59e0b';
    if (pct >= 50) return '#ef4444';
    return '#6b7280';
  }

  function getComplianceStatus(pct) {
    if (pct >= 90) return { text: 'Excelente', variant: 'default' };
    if (pct >= 70) return { text: 'Bueno', variant: 'secondary' };
    if (pct >= 50) return { text: 'Necesita mejora', variant: 'destructive' };
    return { text: 'Crítico', variant: 'destructive' };
  }

  const totalCourses = chartData.length;
  const averageCompliance = totalCourses > 0 
    ? (chartData.reduce((sum, item) => sum + item.pct, 0) / totalCourses).toFixed(1)
    : 0;
  const bestPerformance = Math.max(...chartData.map(item => item.pct));
  const worstPerformance = Math.min(...chartData.map(item => item.pct));

  if (!totalCourses) {
    return (
      <div className="delivery-chart-container">
        <div className="delivery-header">
          <h3 className="delivery-title">Cumplimiento de Entregas</h3>
        </div>
        <div className="flex items-center justify-center h-48 text-gray-500">
          No hay datos de entregas disponibles
        </div>
      </div>
    );
  }

  return (
    <div className="delivery-chart-container">
      <div className="delivery-header">
        <h3 className="delivery-title">Cumplimiento de Entregas</h3>
        <Badge variant="outline" className="text-sm">
          {totalCourses} {totalCourses === 1 ? 'Curso' : 'Cursos'}
        </Badge>
      </div>

      <div className="delivery-summary">
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">{averageCompliance}%</div>
          <div className="text-sm text-gray-600">Promedio</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{bestPerformance}%</div>
          <div className="text-sm text-gray-600">Mejor</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold text-red-600">{worstPerformance}%</div>
          <div className="text-sm text-gray-600">Menor</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold text-gray-900">{totalCourses}</div>
          <div className="text-sm text-gray-600">Cursos</div>
        </Card>
      </div>

      <Card className="delivery-chart-card">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis 
              dataKey="course" 
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
              fontSize={12}
            />
            <YAxis 
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              formatter={(value) => [`${value}%`, 'Cumplimiento']}
              labelFormatter={(label) => `Curso: ${label}`}
              contentStyle={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
            <Bar dataKey="pct" name="% Cumplimiento" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="course-list">
        <h4 className="font-medium text-gray-900 mb-2">Detalle por Curso</h4>
        <div className="space-y-2">
          {chartData
            .sort((a, b) => b.pct - a.pct)
            .map((item, index) => {
              const status = getComplianceStatus(item.pct);
              return (
                <Card key={index} className="course-item">
                  <div className="course-info">
                    <div className="course-label">
                      <div className="course-dot" style={{ backgroundColor: item.color }} />
                      <span>{item.course}</span>
                    </div>
                    <div className="course-stats">
                      <span className="text-lg font-semibold text-gray-900">{item.pct}%</span>
                      <Badge variant={status.variant} className="text-xs">
                        {status.text}
                      </Badge>
                    </div>
                  </div>
                  <div className="course-bar">
                    <div
                      className="course-bar-fill"
                      style={{
                        width: `${item.pct}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </Card>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default DeliveryComplianceChart;
