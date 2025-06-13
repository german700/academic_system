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

export default function CourseAttendance({ courseId: propCourseId, subjectId: propSubjectId }) {
  const params = useParams();
  const navigate = useNavigate();
  const courseId = propCourseId || params.courseId;
  const subjectId = propSubjectId || params.subjectId;

  const [date, setDate] = useState(new Date());
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
    <Card>
      <CardHeader>
        <CardTitle>Registro de Asistencia</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <label htmlFor="date">Fecha:</label>
          <input
            id="date"
            type="date"
            value={date.toLocaleDateString("en-CA")}
            onChange={e => setDate(new Date(e.target.value))}
            className="border rounded px-2 py-1"
          />
        </div>

        {loading ? (
          <p>Cargando asistencia…</p>
        ) : (
          <>
            <table className="w-full mt-2 border">
              <thead>
                <tr>
                  <th className="text-left p-2">Estudiante</th>
                  <th className="text-center">Asistencia</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={r.studentId}>
                    <td className="p-2">{r.studentName}</td>
                    <td className="text-center">
                      <button
                        className="text-xl"
                        onClick={() => toggle(i)}
                      >
                        {r.present ? (
                          <Check className="text-green-600 inline" />
                        ) : (
                          <X className="text-red-600 inline" />
                        )}{" "}
                        {r.present ? "Presente" : "Ausente"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 text-right">
              <Button onClick={save} disabled={saving}>
                {saving ? "Guardando..." : "Guardar asistencia"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
