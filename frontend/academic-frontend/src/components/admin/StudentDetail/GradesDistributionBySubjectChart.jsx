//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\admin\StudentDetail\GradesDistributionBySubjectChart.jsx
import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const GradesDistributionBySubjectChart = ({ activities = [] }) => {
  // Extraemos lista de materias y periodos disponibles
  const materias = useMemo(() => {
    const setM = new Set(activities.map((a) => a.subject).filter(Boolean));
    return Array.from(setM).sort();
  }, [activities]);

  const periodos = useMemo(() => {
    const setP = new Set(
      activities
        .map((a) => a.period)
        .filter((p) => p != null)
        .map((p) => p.toString())
    );
    return Array.from(setP)
      .map((p) => parseInt(p, 10))
      .sort((a, b) => a - b)
      .map((p) => p.toString());
  }, [activities]);

  // Estados de selección
  const [selectedMateria, setSelectedMateria] = useState(materias[0] || "");
  const [selectedPeriodo, setSelectedPeriodo] = useState(periodos[0] || "");

  // Filtramos actividades según la selección
  const data = useMemo(() => {
    return activities
      .filter(
        (a) =>
          a.subject === selectedMateria &&
          a.period?.toString() === selectedPeriodo
      )
      .map((a) => ({
        name: a.name,
        score: a.score ?? 0,
      }));
  }, [activities, selectedMateria, selectedPeriodo]);

  return (
    <div className="my-6">
      <h3 className="text-lg font-semibold mb-2">
        📊 Notas de {selectedMateria || "…"} en Periodo {selectedPeriodo || "…"}
      </h3>

      <div className="flex gap-4 mb-4 items-center">
        <div>
          <label className="block text-sm font-medium">Materia</label>
          <select
            className="mt-1 block w-full border rounded p-1"
            value={selectedMateria}
            onChange={(e) => setSelectedMateria(e.target.value)}
          >
            {materias.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Periodo</label>
          <select
            className="mt-1 block w-full border rounded p-1"
            value={selectedPeriodo}
            onChange={(e) => setSelectedPeriodo(e.target.value)}
          >
            {periodos.map((p) => (
              <option key={p} value={p}>
                Periodo {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-30} textAnchor="end" height={60}/>
            <YAxis allowDecimals={false} domain={[0, 5]} />
            <Tooltip />
            <Bar dataKey="score" name="Nota" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-gray-500">No hay actividades para esta selección.</p>
      )}
    </div>
  );
};

export default GradesDistributionBySubjectChart;
