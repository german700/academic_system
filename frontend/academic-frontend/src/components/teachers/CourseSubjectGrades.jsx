//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\teachers\CourseSubjectGrades.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCourseSubjectGrades } from "../services/docentesService";
import {
  Card, CardContent, CardHeader, CardTitle
} from "../shared/ui/card";
import { Button } from "../shared/ui/button";
import { Badge } from "../shared/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "../shared/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "../shared/ui/table";

export default function CourseSubjectGrades() {
  const { courseId, subjectId } = useParams();
  const navigate = useNavigate();
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("1");

  // Periodos de ejemplo
  const periods = [
    { value: "1", label: "Primer Período" },
    { value: "2", label: "Segundo Período" },
    { value: "3", label: "Tercer Período" },
    { value: "4", label: "Cuarto Período" }
  ];

  useEffect(() => {
    console.log("Mounted CourseSubjectGrades", { courseId, subjectId, selectedPeriod });
    loadGrades();
  }, [courseId, subjectId, selectedPeriod]);

  async function loadGrades() {
    try {
      setLoading(true);
      const data = await fetchCourseSubjectGrades(courseId, subjectId, selectedPeriod);
      console.log("Fetched grades:", data);
      setGrades(data);
    } catch (e) {
      console.error(e);
      setError("Error al cargar las notas");
    } finally {
      setLoading(false);
    }
  }

  if (loading)   return <div className="p-6">Cargando notas...</div>;
  if (error)     return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notas del Curso</h1>
          <p className="text-gray-600">
            Curso {courseId} – Materia {subjectId}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate(-1)}>Volver</Button>
          <Button onClick={() => navigate("/teachers/dashboard")}>Dashboard</Button>
        </div>
      </div>

      {/* Selector de periodo */}
      <Card>
        <CardHeader><CardTitle>Seleccionar Período</CardTitle></CardHeader>
        <CardContent className="flex gap-2 items-center">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48"><SelectValue/></SelectTrigger>
            <SelectContent>
              {periods.map(p => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={loadGrades}>🔄 Actualizar</Button>
        </CardContent>
      </Card>

      {/* Tabla de notas */}
      <Card>
        <CardHeader><CardTitle>Notas – {periods.find(p=>p.value===selectedPeriod)?.label}</CardTitle></CardHeader>
        <CardContent>
          {grades.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay notas para este período.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estudiante</TableHead>
                  <TableHead className="text-center">Notas</TableHead>
                  <TableHead className="text-center">Promedio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grades.map((g,i) => (
                  <TableRow key={i}>
                    <TableCell>{g.student.name}</TableCell>
                    <TableCell className="text-center">
                      {g.notas.length 
                        ? g.notas.join(", ")
                        : "–"}
                    </TableCell>
                    <TableCell className="text-center">
                      {g.promedio ?? "–"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}