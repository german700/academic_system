//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\admin\StudentDetail\StudentGradesTable.jsx
import React, { useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../shared/ui/table";

const StudentGradesTable = ({ gradesData }) => {
  if (!gradesData || !gradesData.activities) return <p>No hay datos de calificaciones.</p>;

  const { activities, average_by_period } = gradesData;

  const periodos = useMemo(() => {
    if (!average_by_period) return [];
    return Object.keys(average_by_period)
      .map((p) => Number(p))
      .filter((p) => average_by_period[p] > 0)
      .sort((a, b) => a - b);
  }, [average_by_period]);

  const materias = useMemo(() => {
    const setMaterias = new Set(activities.map((a) => a.subject).filter(Boolean));
    return Array.from(setMaterias).sort();
  }, [activities]);

  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(
    periodos.length > 0 ? periodos[0] : null
  );
  const [materiaSeleccionada, setMateriaSeleccionada] = useState("");

  const actividadesFiltradas = useMemo(() => {
    return activities.filter((act) => {
      const coincidePeriodo = periodoSeleccionado === null || act.period === periodoSeleccionado;
      const coincideMateria = !materiaSeleccionada || act.subject === materiaSeleccionada;
      return coincidePeriodo && coincideMateria;
    });
  }, [activities, periodoSeleccionado, materiaSeleccionada]);

  const actividadesAgrupadas = useMemo(() => {
    return actividadesFiltradas.reduce((acc, act) => {
      const key = act.period || "Sin periodo";
      if (!acc[key]) acc[key] = [];
      acc[key].push(act);
      return acc;
    }, {});
  }, [actividadesFiltradas]);

  const actividadesNoCalificadas = useMemo(() => {
    const nombres = new Set();
    actividadesFiltradas.forEach((act) => {
      if (act.score === null || act.score === undefined) {
        nombres.add(act.name + "*");
      }
    });
    return Array.from(nombres);
  }, [actividadesFiltradas]);

  const headStyle = { minWidth: 120, paddingLeft: 12, paddingRight: 12 };
  const cellStyle = { minWidth: 120, paddingLeft: 12, paddingRight: 12 };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">📘 Calificaciones por Periodo y Materia</h2>

      <div className="flex gap-4 mb-4">
        <div>
          <label htmlFor="periodo-select" className="mr-2">Periodo:</label>
          <select
            id="periodo-select"
            value={periodoSeleccionado ?? ""}
            onChange={(e) => setPeriodoSeleccionado(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Todos los periodos</option>
            {periodos.map((p) => (
              <option key={p} value={p}>Periodo {p}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="materia-select" className="mr-2">Materia:</label>
          <select
            id="materia-select"
            value={materiaSeleccionada}
            onChange={(e) => setMateriaSeleccionada(e.target.value)}
          >
            <option value="">Todas las materias</option>
            {materias.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {Object.entries(actividadesAgrupadas).map(([period, actividades]) => (
        <div key={period} className="mb-6">
          <h3 className="text-lg font-medium mb-2">🗓 Periodo: {period}</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={headStyle}>Asignación</TableHead>
                <TableHead style={headStyle}>Materia</TableHead>
                <TableHead style={headStyle}>Tipo</TableHead>
                <TableHead style={headStyle}>Fecha Entrega</TableHead>
                <TableHead style={headStyle}>Entrega Tardía</TableHead>
                <TableHead style={headStyle}>Peso (%)</TableHead>
                <TableHead style={headStyle}>Calificación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {actividades.map((act) => {
                const sinCalificar = act.score === null || act.score === undefined;
                return (
                  <TableRow key={act.id}>
                    <TableCell style={cellStyle}>
                      {act.name}
                      {sinCalificar ? "*" : ""}
                    </TableCell>
                    <TableCell style={cellStyle}>{act.subject}</TableCell>
                    <TableCell style={cellStyle}>{act.type}</TableCell>
                    <TableCell style={cellStyle}>{act.due_date || "-"}</TableCell>
                    <TableCell style={cellStyle}>{act.late ? "Sí" : "No"}</TableCell>
                    <TableCell style={cellStyle}>
                      {typeof act.weight === "number" ? `${(act.weight * 100).toFixed(2)}%` : "-"}
                    </TableCell>
                    <TableCell style={cellStyle}>
                      {sinCalificar ? "📌" : act.score.toFixed(2)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ))}

      {actividadesNoCalificadas.length > 0 && (
        <div className="mt-4 text-sm italic text-yellow-800">
          {actividadesNoCalificadas.map((nombre, idx) => (
            <p key={idx}>⚠️ La asignación <strong>{nombre}</strong> no ha sido calificada todavía.</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentGradesTable;
