import React, { useState, useMemo } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../shared/ui/select";
import { Card } from "../../shared/ui/card";
import { Table } from "../../shared/ui/table";
import "./TeacherDetail_css/EngagementOverview.css";

const EngagementOverview = ({ overview = [], narrative = "" }) => {
  if (!overview.length) return <p>No hay datos de compromiso disponibles.</p>;

  // 🔢 Cálculo de totales
  let totalLate = 0;
  let totalAttendanceRecords = 0;
  let totalAbsences = 0;

  overview.forEach(({ periods }) => {
    Object.values(periods).forEach(({ late_submissions, attendance_records, absences }) => {
      totalLate += late_submissions;
      totalAttendanceRecords += attendance_records;
      totalAbsences += absences;
    });
  });

  const porcentajeAsistencia =
    totalAttendanceRecords > 0
      ? Math.round(((totalAttendanceRecords - totalAbsences) / totalAttendanceRecords) * 100)
      : 0;

  const generarNarrativa = (asistencia, tardias) => {
    if (asistencia < 80 && tardias > 30) {
      return "Los estudiantes muestran bajo compromiso general.";
    } else if (asistencia > 90 && tardias < 15) {
      return "El grupo muestra alto compromiso académico.";
    } else if (asistencia >= 85 && tardias > 25) {
      return "A pesar de la buena asistencia, las entregas tardías son frecuentes.";
    } else {
      return "El grupo mantiene un nivel de compromiso moderado.";
    }
  };

  // 🧠 Narrativa dividida por curso
  const narrativaPorCurso = useMemo(() => {
    const porCurso = {};
    const frases = narrative.split(". ").filter((f) => f.trim().length > 0);
    frases.forEach((frase) => {
      const match = frase.match(/\(([^)]+)\)/); // texto entre paréntesis
      if (match) {
        const curso = match[1];
        if (!porCurso[curso]) porCurso[curso] = [];
        porCurso[curso].push(frase.trim().replace(/\.$/, "") + ".");
      }
    });
    return porCurso;
  }, [narrative]);

  const cursosDisponibles = Object.keys(narrativaPorCurso).sort();
  const [cursoSeleccionado, setCursoSeleccionado] = useState(cursosDisponibles[0] || null);

  // 🧾 Datos tabulados por curso y periodo
  const resumenPorCurso = useMemo(() => {
    const data = {};
    overview.forEach(({ subject, course, periods }) => {
      const key = `${course}`;
      if (!data[key]) data[key] = [];

      Object.entries(periods).forEach(([periodo, valores]) => {
        data[key].push({
          periodo,
          subject,
          ...valores,
        });
      });
    });
    return data;
  }, [overview]);

  // Cursos disponibles para la tabla
  const cursosTabla = Object.keys(resumenPorCurso).sort();
  const [cursoTablaSeleccionado, setCursoTablaSeleccionado] = useState(cursosTabla[0] || null);

  return (
    <section className="engagement-section">
      <h2>Resumen de Compromiso Estudiantil</h2>

      <div className="engagement-summary">
        <p><strong>Asistencia promedio:</strong> {porcentajeAsistencia}%</p>
        <p><strong>Entregas tardías:</strong> {totalLate} en total</p>
        <p className="narrative-summary">🧠 {generarNarrativa(porcentajeAsistencia, totalLate)}</p>
      </div>

      {/* 🧠 Narrativa detallada por curso */}
      {cursosDisponibles.length > 0 && (
        <Card className="narrative-card">
          <h3>Narrativa Detallada por Curso:</h3>

          <div className="select-container">
            <Select value={cursoSeleccionado} onValueChange={setCursoSeleccionado}>
              <SelectTrigger className="select-trigger">
                <SelectValue placeholder="Selecciona un curso" />
              </SelectTrigger>
              <SelectContent className="select-content">
                {cursosDisponibles.map((curso) => (
                  <SelectItem key={curso} value={curso} className="select-item">
                    {curso}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="narrative-text">
            {narrativaPorCurso[cursoSeleccionado]?.map((linea, i) => (
              <p key={i}>• {linea}</p>
            ))}
          </div>
        </Card>
      )}

      {/* 📊 Tabla resumen por curso y periodo */}
      <Card className="tabla-resumen">
        <h3>Resumen Tabulado por Curso y Periodo</h3>
        
        {/* Select para elegir el curso de la tabla */}
        <div className="select-container">
          <Select value={cursoTablaSeleccionado} onValueChange={setCursoTablaSeleccionado}>
            <SelectTrigger className="select-trigger">
              <SelectValue placeholder="Selecciona un curso" />
            </SelectTrigger>
            <SelectContent className="select-content">
              {cursosTabla.map((curso) => (
                <SelectItem key={curso} value={curso} className="select-item">
                  Curso {curso}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mostrar solo el curso seleccionado */}
        {cursoTablaSeleccionado && resumenPorCurso[cursoTablaSeleccionado] && (
          <div className="tabla-curso">
            <h4>Curso {cursoTablaSeleccionado}</h4>
            <Table>
              <thead>
                <tr>
                  <th>Periodo</th>
                  <th>Materia</th>
                  <th>Entregas Tardías</th>
                </tr>
              </thead>
              <tbody>
                {resumenPorCurso[cursoTablaSeleccionado].map((r, i) => (
                  <tr key={i}>
                    <td>{r.periodo}</td>
                    <td>{r.subject}</td>
                    <td>{r.late_submissions}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card>
    </section>
  );
};

export default EngagementOverview;