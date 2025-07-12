import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchCourseSubjectGrades,
  fetchCourseSubjectAssignmentsByPeriod,
  fetchCourseMetadata,
  fetchTeacherDashboard,
} from "../services/docentesService";

import {
  Card,
  CardHeader,
  CardContent,
  CardTitle
} from "../shared/ui/card";
import { Button } from "../shared/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from "../shared/ui/table";
import { Badge } from "../shared/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "../shared/ui/select";
import { Input } from "../shared/ui/input";
import { Search, BarChart3, Printer } from "lucide-react";
import PrintGrades from "./PrintGrades";

import "./teachers_css/CourseGradesView.css"; // Importación del CSS modularizado

export default function CourseGradesView() {
  const { courseId, subjectId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [period, setPeriod] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();

  const [showSearch, setShowSearch] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterLast, setFilterLast] = useState("");
  const [filterCode, setFilterCode] = useState("");
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [metadata, setMetadata] = useState({});

  const periods = [
    { value: "1", label: "Primer Periodo" },
    { value: "2", label: "Segundo Periodo" },
    { value: "3", label: "Tercer Periodo" },
    { value: "4", label: "Cuarto Periodo" },
  ];

  const decimalToPercentage = (decimal) => {
    const percentage = (parseFloat(decimal) || 0) * 100;
    return Math.round(percentage);
  };

  const mapAssignmentsWithPercentages = (assigns) => {
    return assigns.map((a) => ({
      ...a,
      weightPercentage: decimalToPercentage(a.weight),
    }));
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        let effectivePeriod = period;

        if (!effectivePeriod) {
          const dashboard = await fetchTeacherDashboard();
          effectivePeriod = dashboard.current_period.number.toString();
          setPeriod(effectivePeriod);
        }

        const [gradesRes, assigns, meta] = await Promise.all([
          fetchCourseSubjectGrades(courseId, subjectId, effectivePeriod),
          fetchCourseSubjectAssignmentsByPeriod(courseId, subjectId, effectivePeriod),
          fetchCourseMetadata(courseId, subjectId, effectivePeriod),
        ]);

        setStudents(gradesRes.students);
        setMetadata(meta);
        setAssignments(mapAssignmentsWithPercentages(assigns));
        setError(null);
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("Error al cargar los datos del curso");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [courseId, subjectId, period]);

  const handleOpenPrintModal = async () => {
    try {
      const meta = await fetchCourseMetadata(courseId, subjectId, period);
      setMetadata(meta);
      setShowPrintModal(true);
    } catch {
      setShowPrintModal(true);
    }
  };

  const assignmentCols = assignments.map((a) => ({
    id: a.id,
    name: a.name,
    weightPercentage: a.weightPercentage,
  }));

  const totalWeight = assignments.reduce(
    (sum, a) => sum + (a.weightPercentage || 0),
    0
  );

  const filteredStudents = students.filter((s) => {
    const [first, ...rest] = s.student_name.split(" ");
    const last = rest.join(" ");
    return (
      (!filterName || first.toLowerCase().includes(filterName.toLowerCase())) &&
      (!filterLast || last.toLowerCase().includes(filterLast.toLowerCase())) &&
      (!filterCode || s.student_id.toString().includes(filterCode))
    );
  });

  const calculateFinal = (studentGrades) => {
    let total = 0;
    let weightSum = 0;

    for (const assignment of assignments) {
      const grade = studentGrades.find((g) => g.assignment_id === assignment.id);
      const weight = assignment.weightPercentage || 0;

      if (grade && !isNaN(grade.score) && weight > 0) {
        total += grade.score * weight;
        weightSum += weight;
      }
    }

    return weightSum > 0 ? (total / weightSum).toFixed(2) : "0.00";
  };

  const selectedPeriodLabel = periods.find((p) => p.value === period)?.label;

  if (loading) {
    return <div className="loading-container"><p className="loading-text">Cargando notas…</p></div>;
  }

  if (error) {
    return <div className="error-container"><p className="error-text">{error}</p></div>;
  }

  return (
    <div className="course-grades-view">
      {/* Header */}
      <div className="grades-header">
        <h1 className="grades-header-title">Notas del Curso</h1>
        <div className="grades-header-actions">
          <button className="grades-action-btn outline" onClick={() => navigate(-1)}>Volver</button>
          <button className="grades-action-btn primary" onClick={() => navigate(`/teachers/courses/${courseId}/subject/${subjectId}/edit`)}>✏️ Editar Notas</button>
          <button className="grades-action-btn secondary" onClick={() => navigate(`/teachers/courses/${courseId}/subject/${subjectId}/attendance`)}>📋 Registrar Asistencia</button>
          <button className="grades-action-btn analysis" onClick={() => navigate(`/teachers/courses/${courseId}/subject/${subjectId}/analysis`)}>
            <BarChart3 size={16} /> Análisis de IA
          </button>
          <button className="grades-action-btn outline" onClick={handleOpenPrintModal}>
            <Printer size={16} /> Imprimir
          </button>
          <button className="grades-action-btn outline" onClick={() => setShowSearch(prev => !prev)}>
            <Search size={16} /> Buscar alumno
          </button>
        </div>
      </div>

      {showPrintModal && (
        <PrintGrades
          students={filteredStudents}
          assignments={assignments}
          period={selectedPeriodLabel}
          courseId={courseId}
          subjectId={subjectId}
          metadata={metadata}
          onClose={() => setShowPrintModal(false)}
        />
      )}

      {showSearch && (
        <div className="search-section grades-card">
          <div className="grades-card-header">
            <h2 className="grades-card-title">Búsqueda de estudiantes</h2>
          </div>
          <div className="grades-card-content">
            <div className="search-grid">
              <div className="search-field">
                <label className="search-label">Nombre</label>
                <input
                  className="search-input"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  placeholder="Nombre"
                />
              </div>
              <div className="search-field">
                <label className="search-label">Apellido</label>
                <input
                  className="search-input"
                  value={filterLast}
                  onChange={(e) => setFilterLast(e.target.value)}
                  placeholder="Apellido"
                />
              </div>
              <div className="search-field">
                <label className="search-label">Código</label>
                <input
                  className="search-input"
                  value={filterCode}
                  onChange={(e) => setFilterCode(e.target.value)}
                  placeholder="Código"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Periodo */}
      <div className="grades-card">
        <div className="grades-card-header">
          <h2 className="grades-card-title">Periodo</h2>
        </div>
        <div className="grades-card-content period-selector">
          <select
            className="period-select"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option disabled>Selecciona un periodo</option>
            {periods.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Barra de progreso */}
      {assignments.length > 0 && (
        <div className="grades-card weight-progress">
          <div className="grades-card-header">
            <h2 className="grades-card-title">Distribución de Pesos</h2>
          </div>
          <div className="grades-card-content">
            <div className="weight-progress-bar">
              <div
                className="weight-progress-fill"
                style={{ width: `${Math.min(totalWeight, 100)}%` }}
              ></div>
            </div>
            <p className="weight-progress-text">
              Pesos asignados: {totalWeight}% / 100%
              {totalWeight !== 100 && (
                <span className="weight-progress-warning">
                  (Los pesos no suman 100%)
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Tabla de notas */}
      <div className="grades-card grades-table-container">
        <div className="grades-card-header">
          <h2 className="grades-card-title">Notas del Periodo</h2>
        </div>
        <div className="grades-card-content">
          <table className="grades-table">
            <thead className="grades-table-header">
              <tr className="grades-table-header-row">
                <th className="grades-table-header-cell">Estudiante</th>
                {assignmentCols.map(col => (
                  <th key={col.id} className="grades-table-header-cell">
                    <div className="assignment-header">
                      <span className="assignment-name">{col.name}</span>
                      <span className="assignment-weight">({col.weightPercentage}%)</span>
                    </div>
                  </th>
                ))}
                <th className="grades-table-header-cell">Definitiva</th>
                <th className="grades-table-header-cell">Estado</th>
              </tr>
            </thead>
            <tbody className="grades-table-body">
              {filteredStudents.map(student => {
                const definitiva = parseFloat(calculateFinal(student.grades));
                return (
                  <tr key={student.student_id} className="grades-table-row">
                    <td className="grades-table-cell student-name">{student.student_name}</td>
                    {assignmentCols.map(col => {
                      const nota = student.grades.find(g => g.assignment_id === col.id);
                      return (
                        <td key={col.id} className="grades-table-cell">
                          <span className="grade-badge outline">
                            {nota ? nota.score.toFixed(1) : "—"}
                          </span>
                        </td>
                      );
                    })}
                    <td className="grades-table-cell final-grade">
                      {definitiva.toFixed(2)}
                    </td>
                    <td className="grades-table-cell">
                      <span className={`status-badge ${definitiva >= 3 ? "approved" : "failed"}`}>
                        {definitiva >= 3 ? "Aprobado" : "Reprobado"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
