//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\teachers\CourseGradesView.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCourseSubjectGrades, fetchCourseSubjectAssignmentsByPeriod, fetchCourseMetadata, fetchTeacherDashboard } from "../services/docentesService";
import { Card, CardHeader, CardContent, CardTitle } from "../shared/ui/card";
import { Button } from "../shared/ui/button";

import {
    Table, TableHeader, TableRow, TableHead, TableBody, TableCell
} from "../shared/ui/table";
import { Badge } from "../shared/ui/badge";
import {
    Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from "../shared/ui/select";
import { Input } from "../shared/ui/input";
import { Search, BarChart3, Printer } from "lucide-react";
import PrintGrades from "./PrintGrades";


export default function CourseGradesView() {
    const { courseId, subjectId } = useParams();
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [period, setPeriod] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();

    // Search controls
    const [showSearch, setShowSearch] = useState(false);
    const [filterName, setFilterName] = useState("");
    const [filterLast, setFilterLast] = useState("");
    const [filterCode, setFilterCode] = useState("");

    // Print modal control
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [metadata, setMetadata] = useState({});

    const periods = [
        { value: "1", label: "Primer Periodo" },
        { value: "2", label: "Segundo Periodo" },
        { value: "3", label: "Tercer Periodo" },
        { value: "4", label: "Cuarto Periodo" }
    ];

    // Función para convertir decimal a porcentaje entero
    const decimalToPercentage = (decimal) => {
        const percentage = (parseFloat(decimal) || 0) * 100;
        return Math.round(percentage);
    };

    // Función para mapear assignments con porcentajes
    const mapAssignmentsWithPercentages = (assigns) => {
        return assigns.map(a => ({
            ...a,
            weightPercentage: decimalToPercentage(a.weight)
        }));
    };

    // ✅ useEffect unificado para manejar la carga de datos
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                let effectivePeriod = period;
                
                // Si no hay periodo seleccionado, obtener el periodo actual
                if (!effectivePeriod) {
                    const dashboard = await fetchTeacherDashboard();
                    effectivePeriod = dashboard.current_period.number.toString();
                    setPeriod(effectivePeriod);
                }
                
                // Cargar datos del periodo
                const [gradesRes, assigns, meta] = await Promise.all([
                    fetchCourseSubjectGrades(courseId, subjectId, effectivePeriod),
                    fetchCourseSubjectAssignmentsByPeriod(courseId, subjectId, effectivePeriod),
                    fetchCourseMetadata(courseId, subjectId, effectivePeriod)
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

    // ✅ Función para abrir el modal con metadatos actualizados
    const handleOpenPrintModal = async () => {
        try {
            const meta = await fetchCourseMetadata(courseId, subjectId, period);
            setMetadata(meta);
            console.log("Abriendo impresión con metadatos:", meta);
            setShowPrintModal(true);
        } catch (error) {
            console.warn("Error cargando metadatos para impresión:", error);
            setShowPrintModal(true);
        }
    };

    if (loading) return <p>Cargando notas…</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    // Columns fixed by assignments
    const assignmentCols = assignments.map(a => ({
        id: a.id,
        name: a.name,
        weightPercentage: a.weightPercentage
    }));

    // Calcular el peso total para mostrar la barra de progreso
    const totalWeight = assignments.reduce(
        (sum, a) => sum + (a.weightPercentage || 0),
        0
    );

    // ✅ Filtered students - BUG CORREGIDO
    const filteredStudents = students.filter(s => {
        const [first, ...rest] = s.student_name.split(' ');
        const last = rest.join(' ');
        return (
            (!filterName || first.toLowerCase().includes(filterName.toLowerCase())) &&
            (!filterLast || last.toLowerCase().includes(filterLast.toLowerCase())) && 
            (!filterCode || s.student_id.toString().includes(filterCode))
        );
    });

    // Calcular definitiva con pesos
    const calculateFinal = (studentGrades) => {
        let total = 0;
        let weightSum = 0;

        for (const assignment of assignments) {
            const grade = studentGrades.find(g => g.assignment_id === assignment.id);
            const weight = assignment.weightPercentage || 0;

            if (grade && !isNaN(grade.score) && weight > 0) {
                total += grade.score * weight;
                weightSum += weight;
            }
        }

        return weightSum > 0 ? (total / weightSum).toFixed(2) : "0.00";
    };

    // Get selected period label
    const selectedPeriodLabel = periods.find(p => p.value === period)?.label;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Notas del Curso</h1>
                <div className="flex flex-wrap gap-2">
                    <Button onClick={() => navigate(-1)}>Volver</Button>
                    <Button onClick={() => navigate(`/teachers/courses/${courseId}/subject/${subjectId}/edit`)}>
                        ✏️ Editar Notas
                    </Button>
                    <Button onClick={() => navigate(`/teachers/courses/${courseId}/subject/${subjectId}/attendance`)}>
                        📋 Registrar Asistencia
                    </Button>
                    <Button
                        onClick={() => navigate(`/teachers/courses/${courseId}/subject/${subjectId}/analysis`)}
                        className="flex items-center gap-1"
                        variant="secondary"
                    >
                        <BarChart3 size={16} /> Análisis de IA
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleOpenPrintModal}
                        className="flex items-center gap-1"
                    >
                        <Printer size={16} /> Imprimir
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setShowSearch(prev => !prev)}
                        className="flex items-center gap-1"
                    >
                        <Search size={16} /> Buscar alumno
                    </Button>
                </div>
            </div>

            {/* ✅ Print Modal */}
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

            {/* Search fields */}
            {showSearch && (
                <Card>
                    <CardHeader><CardTitle>Búsqueda de estudiantes</CardTitle></CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium">Nombre</label>
                                <Input
                                    value={filterName}
                                    onChange={e => setFilterName(e.target.value)}
                                    placeholder="Nombre"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Apellido</label>
                                <Input
                                    value={filterLast}
                                    onChange={e => setFilterLast(e.target.value)}
                                    placeholder="Apellido"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Código</label>
                                <Input
                                    value={filterCode}
                                    onChange={e => setFilterCode(e.target.value)}
                                    placeholder="Código"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Period selector */}
            <Card>
                <CardHeader><CardTitle>Periodo</CardTitle></CardHeader>
                <CardContent>
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Selecciona un periodo">
                                {selectedPeriodLabel}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {periods.map(p => (
                                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* Barra de progreso de pesos */}
            {assignments.length > 0 && (
                <Card>
                    <CardHeader><CardTitle>Distribución de Pesos</CardTitle></CardHeader>
                    <CardContent>
                        <div className="w-full bg-gray-200 h-2 rounded mb-2">
                            <div
                                className="h-2 bg-green-500 rounded"
                                style={{ width: `${Math.min(totalWeight, 100)}%` }}
                            />
                        </div>
                        <p className="text-sm">
                            Pesos asignados: {totalWeight}% / 100%
                            {totalWeight !== 100 && (
                                <span className="text-red-600 ml-2">
                                    (Los pesos no suman 100%)
                                </span>
                            )}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Table */}
            <Card>
                <CardHeader><CardTitle>Notas del Periodo</CardTitle></CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Estudiante</TableHead>
                                    {assignmentCols.map(col => (
                                        <TableHead key={col.id} className="text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="flex items-center gap-1">
                                                    <span>{col.name}</span>
                                                    <span className="text-xs text-gray-500">
                                                        ({col.weightPercentage || 0}%)
                                                    </span>
                                                </div>
                                            </div>
                                        </TableHead>
                                    ))}
                                    <TableHead className="text-center">Definitiva</TableHead>
                                    <TableHead className="text-center">Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStudents.map(student => {
                                    const definitiva = parseFloat(calculateFinal(student.grades));
                                    return (
                                        <TableRow key={student.student_id}>
                                            <TableCell>{student.student_name}</TableCell>
                                            {assignmentCols.map(col => {
                                                const nota = student.grades.find(g => g.assignment_id === col.id);
                                                return (
                                                    <TableCell key={col.id} className="text-center">
                                                        <Badge variant="outline">
                                                            {nota ? nota.score.toFixed(1) : "—"}
                                                        </Badge>
                                                    </TableCell>
                                                );
                                            })}
                                            <TableCell className="text-center font-semibold">
                                                {definitiva.toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={definitiva >= 3 ? "default" : "destructive"}>
                                                    {definitiva >= 3 ? "Aprobado" : "Reprobado"}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}