import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  fetchAttendanceByDate,
  fetchBulkSaveAttendance
} from '../services/docentesService';
import { Card, CardContent, CardHeader, CardTitle } from '../shared/ui/card';
import { Button } from '../shared/ui/button';
import { Check, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import './teachers_css/CourseAttendance.css';

export default function CourseAttendance({ courseId: propCourseId, subjectId: propSubjectId }) {
  const params = useParams();
  const navigate = useNavigate();
  const courseId = propCourseId || params.courseId;
  const subjectId = propSubjectId || params.subjectId;

  const [date, setDate] = useState(new Date());
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Verificar si la fecha es del mes actual
  const isEditable = date.getMonth() === new Date().getMonth() && date.getFullYear() === new Date().getFullYear();

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchAttendanceByDate(courseId, subjectId, date);
      setRecords(data);
    } catch (err) {
      console.error("Error cargando asistencia", err);
      toast.error("No se pudo cargar la asistencia");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [date]);

  const toggle = (index) => {
    setRecords(prev => {
      const newRecords = [...prev];
      newRecords[index] = {
        ...newRecords[index],
        present: !newRecords[index].present
      };
      return newRecords;
    });
  };

  const save = async () => {
    try {
      setSaving(true);
      const payload = records.map(r => ({
        id: r.id,
        studentId: r.studentId,
        subjectId: subjectId,
        date: date.toLocaleDateString("en-CA"),
        present: r.present
      }));
      await fetchBulkSaveAttendance(payload);
      toast.success("Asistencia guardada con éxito");
      // Redirigir a la vista de calificaciones
      navigate(`/teachers/courses/${courseId}/subject/${subjectId}/grades`);
    } catch (err) {
      console.error("Error guardando asistencia", err);
      toast.error("Error al guardar la asistencia");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="course-attendance-container">
      <div className="attendance-card">
        <div className="attendance-card-header">
          <h1 className="attendance-card-title">Registro de Asistencia</h1>
        </div>
        <div className="attendance-card-content">
          <div className="date-selector">
            <label htmlFor="date">Fecha:</label>
            <input
              id="date"
              type="date"
              value={date.toLocaleDateString("en-CA")}
              onChange={e => {
                const [year, month, day] = e.target.value.split("-");
                setDate(new Date(year, month - 1, day)); // evita el desfase por zona horaria
              }}
              className="date-input"
            />
          </div>

          {loading ? (
            <div className="attendance-loading">
              <p className="attendance-loading-text">Cargando asistencia...</p>
            </div>
          ) : (
            <>
              <div className="attendance-table-container">
                <table className="attendance-table">
                  <thead className="attendance-table-header">
                    <tr>
                      <th>Estudiante</th>
                      <th>Asistencia</th>
                    </tr>
                  </thead>
                  <tbody className="attendance-table-body">
                    {records.map((r, i) => (
                      <tr key={r.studentId} className="attendance-table-row">
                        <td className="attendance-table-cell">
                          <span className="student-name">{r.studentName}</span>
                        </td>
                        <td className="attendance-table-cell">
                          <button
                            className={`attendance-toggle-btn ${r.present ? 'present' : 'absent'}`}
                            onClick={() => toggle(i)}
                            disabled={!isEditable}
                          >
                            {r.present ? (
                              <Check className="icon" />
                            ) : (
                              <X className="icon" />
                            )}
                            {r.present ? "Presente" : "Ausente"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="attendance-actions">
                {!isEditable && (
                  <div className="editable-warning">
                    <span className="editable-warning-icon">⚠️</span>
                    <p className="editable-warning-text">
                      Solo se puede registrar asistencia del mes actual
                    </p>
                  </div>
                )}
                <button 
                  className="attendance-save-btn"
                  onClick={save} 
                  disabled={saving || !isEditable}
                >
                  {saving ? (
                    <>
                      <div className="spinner"></div>
                      Guardando...
                    </>
                  ) : (
                    "Guardar asistencia"
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}