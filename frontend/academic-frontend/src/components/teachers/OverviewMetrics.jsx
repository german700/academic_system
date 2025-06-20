//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\teachers\OverviewMetrics.jsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../shared/ui/card";

export default function OverviewMetrics({ realAverage, iaAverage, totalStudents }) {
  // Convertir iaAverage en % y clasificar
  const pct = Math.round(iaAverage * 100);
  let iaStatus;
  
  if (iaAverage <= 0.2) {
    iaStatus = { icon: "🌟", text: "Riesgo Mínimo", color: "text-green-600" };
  } else if (iaAverage <= 0.4) {
    iaStatus = { icon: "✅", text: "Riesgo Bajo", color: "text-green-400" };
  } else if (iaAverage <= 0.6) {
    iaStatus = { icon: "⚠️", text: "Riesgo Moderado", color: "text-yellow-600" };
  } else if (iaAverage <= 0.8) {
    iaStatus = { icon: "🔶", text: "Riesgo Alto", color: "text-orange-600" };
  } else {
    iaStatus = { icon: "🚨", text: "Riesgo Crítico", color: "text-red-600" };
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        Promedios del curso en este periodo
      </p>
      
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle>Promedio Real</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{realAverage}</p>
            <p className="text-xs text-gray-500 mt-1">Calificaciones reales</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader><CardTitle>Promedio IA</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{`${pct}%`}</p>
            {/* Mostrar porcentaje */}
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xl">{iaStatus.icon}</span>
              <p className={`text-sm font-medium ${iaStatus.color}`}>
                {iaStatus.text}
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Esto representa la probabilidad promedio de riesgo según IA.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader><CardTitle>Estudiantes Analizados</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalStudents}</p>
            <p className="text-xs text-gray-500 mt-1">Con datos disponibles</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}