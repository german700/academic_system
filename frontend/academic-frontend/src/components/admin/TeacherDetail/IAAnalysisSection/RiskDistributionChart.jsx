//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\admin\TeacherDetail\IAAnalysisSection.jsx\RiskDistributionChart.jsx+
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

const COLORS = ['#10b981', '#f59e0b', '#ef4444']; // verde, amarillo, rojo más vibrantes

const RiskDistributionChart = ({ data }) => {
  const cursos = Object.keys(data);
  const [curso, setCurso] = useState(cursos[0]);

  if (!cursos.length) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Distribución de Riesgo
          </h3>
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
    { name: 'Bajo', value: dist.low, color: '#10b981' },
    { name: 'Medio', value: dist.medium, color: '#f59e0b' },
    { name: 'Alto', value: dist.high, color: '#ef4444' },
  ].filter(item => item.value > 0); // Solo mostrar valores que existen

  return (
    <div className="space-y-4">
      {/* Header con título y selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Distribución de Riesgo
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Curso:</span>
          <Select value={curso} onValueChange={(val) => setCurso(val)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecciona un curso" />
            </SelectTrigger>
            <SelectContent>
              {cursos.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-3 gap-3">
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

      {/* Gráfico de dona */}
      <Card className="p-4">
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
          
          {/* Indicador central */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Badges con porcentajes */}
      <div className="flex flex-wrap gap-2 justify-center">
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