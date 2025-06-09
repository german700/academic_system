// C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\teachers\CourseGrades.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchCourseSubjectGrades,
  fetchCreateGradeEntry,
  fetchUpdateGradeEntry,
  fetchStudentSubjectAnalysis // ← Importar la función nueva
} from "../services/docentesService";
import { Card, CardContent, CardHeader, CardTitle } from "../shared/ui/card";
import { Button } from "../shared/ui/button";
import { Badge } from "../shared/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../shared/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../shared/ui/table";
import { Dialog, DialogContent, DialogTrigger } from "../shared/ui/dialog";
import StudentChart from "./StudentChart"; // ← Importar el componente de gráfico

export default function CourseGrades() {
  const { courseId, subjectId } = useParams();
  const navigate = useNavigate();

  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [selectedPeriod, setSelectedPeriod] = useState("1");
  const [editing, setEditing] = useState(false);
  const [entriesByStudent, setEntriesByStudent] = useState({}); // { studentId: [{entryId, assignmentId, weight, score}] }
  const [definitivas, setDefinitivas] = useState({});           // { studentId: definitiva }
  
  // ← NUEVO: Estado para análisis IA
  const [analyses, setAnalyses] = useState({}); // { [studentId]: { analysis, chart_data } }

  // Periodos fijos (podrías obtenerlos de tu API)
  const periods = [
    { value: "1", label: "Primer Período" },
    { value: "2", label: "Segundo Período" },
    { value: "3", label: "Tercer Período" },
    { value: "4", label: "Cuarto Período" }
  ];

  useEffect(() => {
    loadGrades();
  }, [selectedPeriod]);

  // ← NUEVO: useEffect para cargar análisis IA
  useEffect(() => {
    if (!grades || grades.length === 0 || !subjectId) return;

    // Limpiar análisis previos
    setAnalyses({});

    // Cargar análisis para cada estudiante
    grades.forEach((g) => {
      fetchStudentSubjectAnalysis(g.student.id, subjectId)
        .then((data) => {
          setAnalyses((prev) => ({
            ...prev,
            [g.student.id]: data
          }));
        })
        .catch((error) => {
          console.error(`Error al analizar estudiante ${g.student.id}:`, error);
        });
    });
  }, [grades, subjectId]);

  const loadGrades = async () => {
    setLoading(true);
    try {
      const data = await fetchCourseSubjectGrades(courseId, subjectId, selectedPeriod);
      setGrades(data);

      // Inicializa entriesByStudent y definitivas usando g.entries
      const byStud = {};
      data.forEach((g) => {
        byStud[g.student.id] = g.entries.map(e => ({
          entryId: e.entryId,
          assignmentId: e.assignmentId,
          weight: e.weight,
          score: e.score
        }));
        computeDefinitiva(g.student.id, byStud[g.student.id]);
      });
      setEntriesByStudent(byStud);
    } catch (err) {
      setError("No se pudieron cargar las notas.");
    } finally {
      setLoading(false);
    }
  };

  const computeDefinitiva = (studentId, entries) => {
    const totalWeight = entries.reduce((s, e) => s + Number(e.weight), 0);
    const sum = entries.reduce((s, e) => s + Number(e.score) * Number(e.weight), 0);
    const def = totalWeight > 0 ? (sum / totalWeight).toFixed(2) : "";
    setDefinitivas((prev) => ({ ...prev, [studentId]: def }));
  };

  const handleEntryChange = (studentId, idx, field, value) => {
    setEntriesByStudent((prev) => {
      const arr = [...prev[studentId]];
      arr[idx] = { ...arr[idx], [field]: value };
      computeDefinitiva(studentId, arr);
      return { ...prev, [studentId]: arr };
    });
  };

  const handleSave = async () => {
    // Por cada student y cada entry, hacemos POST (nueva) o PATCH (existente)
    for (const [studentId, entries] of Object.entries(entriesByStudent)) {
      for (const e of entries) {
        const payload = {
          assignment: e.assignmentId,
          student: Number(studentId),
          score: Number(e.score),
          weight: Number(e.weight)
        };

        if (e.entryId) {
          await fetchUpdateGradeEntry(e.entryId, { score: payload.score });
        } else {
          await fetchCreateGradeEntry(payload);
        }
      }
    }
    setEditing(false);
    await loadGrades();
  };

  if (loading) return <div className="p-6">Cargando notas...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Notas del Curso</h1>
          <p className="text-gray-600">
            Curso {courseId} – Materia {subjectId} – {periods.find(p => p.value===selectedPeriod)?.label}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate(-1)}>Volver</Button>
          <Button onClick={() => navigate("/teachers/dashboard")}>Dashboard</Button>
          <Dialog open={editing} onOpenChange={setEditing}>
            <DialogTrigger asChild>
              <Button variant="outline">Editar Notas</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <h3 className="text-lg font-semibold mb-4">Editar Notas</h3>
              <div className="space-y-4">
                {grades.map((g) => (
                  <div key={g.student.id} className="grid grid-cols-4 gap-2 items-center">
                    <span>{g.student.name}</span>
                    {entriesByStudent[g.student.id]?.map((ent, idx) => (
                      <input
                        key={idx}
                        type="number"
                        value={ent.score}
                        step="0.1"
                        onChange={(e) =>
                          handleEntryChange(g.student.id, idx, "score", e.target.value)
                        }
                        className="border p-1 rounded w-20"
                      />
                    ))}
                    <span className="ml-4">
                      Definitiva: {definitivas[g.student.id] || "—"}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditing(false)}>Cancelar</Button>
                <Button onClick={handleSave}>Guardar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Selector de Período */}
      <Card>
        <CardHeader>
          <CardTitle>Período</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periods.map((p) => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Tabla de Notas */}
      <Card>
        <CardHeader>
          <CardTitle>Notas del Período</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante & Análisis IA</TableHead>
                <TableHead className="text-center">Notas</TableHead>
                <TableHead className="text-center">Definitiva</TableHead>
                <TableHead className="text-center">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grades.map((g) => (
                <TableRow key={g.student.id}>
                  {/* ← MODIFICADO: Celda con análisis IA */}
                  <TableCell>
                    <div className="space-y-2">
                      <div className="font-medium">{g.student.name}</div>
                      
                      {/* Análisis IA */}
                      {analyses[g.student.id] ? (
                        <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                          <p className="text-xs italic text-gray-600 mb-2">
                            📊 {analyses[g.student.id].analysis}
                          </p>
                          {analyses[g.student.id].chart_data && (
                            <StudentChart data={analyses[g.student.id].chart_data} />
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic">
                          🔄 Cargando análisis…
                        </p>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    {entriesByStudent[g.student.id]?.map((ent, i) => (
                      <Badge key={i} className="mx-1">{ent.score}</Badge>
                    ))}
                  </TableCell>
                  <TableCell className="text-center">
                    {definitivas[g.student.id] || "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      variant={definitivas[g.student.id] >= 3 ? "default" : "destructive"}
                    >
                      {definitivas[g.student.id] >= 3 ? "Aprobado" : "Reprobado"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}