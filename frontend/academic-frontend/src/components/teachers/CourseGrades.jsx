//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\teachers\CourseGrades.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    fetchCourseSubjectGrades,
    fetchCreateGradeEntry,
    fetchUpdateGradeEntry,
    fetchDeleteGradeEntry,
    fetchStudentSubjectAnalysis,
    fetchCourseStudents,
    fetchCourseComparison,
    fetchCourseSubjectAssignments
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
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "../shared/ui/dialog";
import { Input } from "../shared/ui/input";
import { Label } from "../shared/ui/label";
import StudentChart from "./StudentChart";
import CourseComparisonChart from './CourseComparisonChart';

// Nuevo servicio para crear asignaciones
export const createAssignment = async (courseId, subjectId, payload) => {
    const res = await fetch(
        `${process.env.REACT_APP_TEACHER_API}/course/${courseId}/subject/${subjectId}/assignments/`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Asume que tienes una función getAuthHeaders()
                ...getAuthHeaders()
            },
            body: JSON.stringify(payload)
        }
    );
    if (!res.ok) throw new Error("Error creando actividad");
    return res.json();
};

// Función helper para headers de autenticación (ajusta según tu implementación)
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function CourseGrades() {
    const { courseId, subjectId } = useParams();
    const navigate = useNavigate();

    const [grades, setGrades] = useState([]);
    const [comparison, setComparison] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    const [selectedPeriod, setSelectedPeriod] = useState("1");
    const [editing, setEditing] = useState(false);
    const [editingAssignments, setEditingAssignments] = useState(false);
    const [entriesByStudent, setEntriesByStudent] = useState({});
    const [definitivas, setDefinitivas] = useState({});
    const [analyses, setAnalyses] = useState({});
    const [students, setStudents] = useState([]);
    const [assignments, setAssignments] = useState([]);
    
    // Estados para crear nueva asignación
    const [newAssignment, setNewAssignment] = useState({
        name: '',
        type: 'exam',
        weight: 1
    });

    const periods = [
        { value: "1", label: "Primer Período" },
        { value: "2", label: "Segundo Período" },
        { value: "3", label: "Tercer Período" },
        { value: "4", label: "Cuarto Período" }
    ];

    const assignmentTypes = [
        { value: 'exam', label: 'Examen' },
        { value: 'quiz', label: 'Quiz' },
        { value: 'homework', label: 'Tarea' },
        { value: 'project', label: 'Proyecto' },
        { value: 'participation', label: 'Participación' }
    ];

    useEffect(() => {
        loadGrades();
    }, [selectedPeriod]);

    useEffect(() => {
        const loadStudents = async () => {
            try {
                const { students: stu } = await fetchCourseStudents(courseId);
                setStudents(stu);
            } catch (err) {
                console.error("Error al cargar estudiantes:", err);
            }
        };
        if (courseId) loadStudents();
    }, [courseId]);

    useEffect(() => {
        fetchCourseComparison(courseId, subjectId)
            .then(setComparison)
            .catch(() => {/* silenciar fallo */ });
    }, [courseId, subjectId]);

    useEffect(() => {
        const loadAssignments = async () => {
            try {
                const data = await fetchCourseSubjectAssignments(courseId, subjectId);
                setAssignments(data);
            } catch (err) {
                console.error("Error cargando actividades:", err);
            }
        };
        if (courseId && subjectId) loadAssignments();
    }, [courseId, subjectId]);

    useEffect(() => {
        if (!students || students.length === 0 || !subjectId) return;

        setAnalyses({});

        const fetchAllAnalyses = async () => {
            try {
                const results = await Promise.all(
                    students.map(async (student) => {
                        const analysis = await fetchStudentSubjectAnalysis(student.id, subjectId);
                        return { studentId: student.id, analysis };
                    })
                );

                const analysisByStudent = {};
                results.forEach(({ studentId, analysis }) => {
                    analysisByStudent[studentId] = analysis;
                });

                setAnalyses(analysisByStudent);
            } catch (err) {
                console.error("Error al cargar análisis IA", err);
            }
        };

        fetchAllAnalyses();
    }, [students, subjectId]);

    const loadGrades = async () => {
        setLoading(true);
        try {
            const data = await fetchCourseSubjectGrades(courseId, subjectId, selectedPeriod);
            setGrades(data);

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

    const handleEntryChange = async (studentId, idx, field, value) => {
        setEntriesByStudent((prev) => {
            const arr = [...(prev[studentId] || [])];
            arr[idx] = { ...arr[idx], [field]: value };
            computeDefinitiva(studentId, arr);
            return { ...prev, [studentId]: arr };
        });

        // Solo auto-guardar si NO estamos en modo edición (para compatibilidad con modo inline anterior)
        if (!editing) {
            if (field === 'score') {
                const entry = entriesByStudent[studentId][idx];
                const payload = {
                    assignment: entry.assignmentId,
                    student: Number(studentId),
                    score: Number(value),
                    weight: Number(entry.weight)
                };

                try {
                    if (entry.entryId) {
                        await fetchUpdateGradeEntry(entry.entryId, { score: payload.score });
                    } else {
                        const newEntry = await fetchCreateGradeEntry(payload);
                        setEntriesByStudent(prev => {
                            const arr = [...(prev[studentId] || [])];
                            arr[idx] = { ...arr[idx], entryId: newEntry.id };
                            return { ...prev, [studentId]: arr };
                        });
                    }
                } catch (err) {
                    console.error("Error guardando calificación:", err);
                }
            }

            if (field === 'assignmentId') {
                const entry = entriesByStudent[studentId][idx];
                const payload = {
                    assignment: Number(value),
                    student: Number(studentId),
                    score: Number(entry.score),
                    weight: Number(entry.weight)
                };

                try {
                    if (entry.entryId) {
                        await fetchUpdateGradeEntry(entry.entryId, { assignment: payload.assignment });
                    } else if (payload.assignment && payload.score) {
                        const newEntry = await fetchCreateGradeEntry(payload);
                        setEntriesByStudent(prev => {
                            const arr = [...(prev[studentId] || [])];
                            arr[idx] = { ...arr[idx], entryId: newEntry.id };
                            return { ...prev, [studentId]: arr };
                        });
                    }
                } catch (err) {
                    console.error("Error guardando actividad:", err);
                }
            }
        }
    };

    const handleDeleteEntry = async (studentId, entryId, idx) => {
        try {
            if (entryId) {
                await fetchDeleteGradeEntry(entryId);
            }

            setEntriesByStudent(prev => {
                const arr = [...(prev[studentId] || [])];
                arr.splice(idx, 1);
                computeDefinitiva(studentId, arr);
                return { ...prev, [studentId]: arr };
            });
        } catch (err) {
            console.error("Error eliminando calificación:", err);
        }
    };

    const handleAddEntry = (studentId) => {
        setEntriesByStudent(prev => ({
            ...prev,
            [studentId]: [
                ...(prev[studentId] || []),
                {
                    entryId: null,
                    assignmentId: assignments[0]?.id || "",
                    score: 0,
                    weight: 1
                }
            ]
        }));
    };

    const handleSave = async () => {
        try {
            for (const [studentId, entries] of Object.entries(entriesByStudent)) {
                for (const e of entries) {
                    const payload = {
                        assignment: e.assignmentId,
                        student: Number(studentId),
                        score: Number(e.score),
                        weight: Number(e.weight)
                    };

                    if (e.entryId) {
                        await fetchUpdateGradeEntry(e.entryId, { score: payload.score, weight: payload.weight });
                    } else if (payload.assignment && payload.score >= 0) {
                        const newEntry = await fetchCreateGradeEntry(payload);
                        // Actualizar el estado con el nuevo ID
                        setEntriesByStudent(prev => {
                            const arr = [...(prev[studentId] || [])];
                            const idx = arr.findIndex(entry => 
                                entry.assignmentId === e.assignmentId && 
                                entry.score === e.score && 
                                !entry.entryId
                            );
                            if (idx !== -1) {
                                arr[idx] = { ...arr[idx], entryId: newEntry.id };
                            }
                            return { ...prev, [studentId]: arr };
                        });
                    }
                }
            }
            setEditing(false);
            await loadGrades();
        } catch (err) {
            console.error("Error guardando cambios:", err);
            alert("Error al guardar algunos cambios. Revisa la consola para más detalles.");
        }
    };

    const handleCreateAssignment = async () => {
        try {
            await createAssignment(courseId, subjectId, newAssignment);
            // Recargar asignaciones
            const data = await fetchCourseSubjectAssignments(courseId, subjectId);
            setAssignments(data);
            // Limpiar formulario
            setNewAssignment({ name: '', type: 'exam', weight: 1 });
            setEditingAssignments(false);
        } catch (err) {
            console.error("Error creando asignación:", err);
            alert("Error al crear la asignación");
        }
    };

    const renderGradesCell = (studentId, entries) => {
        if (editing) {
            // Modo edición: mostrar inputs y controles
            return (
                <div className="flex flex-col items-center gap-2">
                    {entries?.map((ent, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg min-w-max">
                            <select
                                value={ent.assignmentId || ""}
                                onChange={(e) => handleEntryChange(studentId, idx, "assignmentId", Number(e.target.value))}
                                className="text-xs border rounded px-2 py-1 bg-white min-w-[100px]"
                            >
                                <option value="">Seleccionar...</option>
                                {assignments.map((a) => (
                                    <option key={a.id} value={a.id}>
                                        {a.name}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="number"
                                value={ent.score}
                                step="0.1"
                                min="0"
                                max="5"
                                onChange={(e) => handleEntryChange(studentId, idx, "score", e.target.value)}
                                className="w-16 text-xs border rounded px-2 py-1 text-center bg-white"
                                placeholder="Nota"
                            />

                            <input
                                type="number"
                                value={ent.weight}
                                step="0.1"
                                min="0.1"
                                max="10"
                                onChange={(e) => handleEntryChange(studentId, idx, "weight", e.target.value)}
                                className="w-14 text-xs border rounded px-1 py-1 text-center bg-white"
                                title="Peso de la nota"
                                placeholder="Peso"
                            />

                            <button
                                onClick={() => handleDeleteEntry(studentId, ent.entryId, idx)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                                title="Eliminar calificación"
                            >
                                🗑
                            </button>
                        </div>
                    ))}

                    <button
                        onClick={() => handleAddEntry(studentId)}
                        className="text-green-600 hover:text-green-800 hover:bg-green-50 text-xs flex items-center justify-center space-x-1 w-full mt-2 p-2 border border-dashed border-green-300 rounded transition-colors"
                        title="Añadir nueva calificación"
                    >
                        <span>➕</span>
                        <span>Añadir nota</span>
                    </button>
                </div>
            );
        } else {
            // Modo solo lectura: mostrar badges
            return (
                <div className="flex flex-wrap gap-1 justify-center">
                    {entries?.map((ent, idx) => {
                        const assignment = assignments.find(a => a.id === ent.assignmentId);
                        return (
                            <Badge 
                                key={idx} 
                                variant={ent.score >= 3 ? "default" : "destructive"}
                                className="text-xs"
                                title={`${assignment?.name || 'Sin asignar'} - Peso: ${ent.weight}`}
                            >
                                {assignment?.name?.substring(0, 3) || '???'}: {ent.score}
                            </Badge>
                        );
                    })}
                    {(!entries || entries.length === 0) && (
                        <span className="text-xs text-gray-400 italic">Sin calificaciones</span>
                    )}
                </div>
            );
        }
    };

    if (loading) return <div className="p-6">Cargando notas...</div>;
    if (error) return <div className="p-6 text-red-500">{error}</div>;

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Notas del Curso</h1>
                    <p className="text-gray-600">
                        Curso {courseId} – Materia {subjectId} – {periods.find(p => p.value === selectedPeriod)?.label}
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button onClick={() => navigate(-1)}>Volver</Button>
                    <Button onClick={() => navigate("/teachers/dashboard")}>Dashboard</Button>
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/teachers/courses/${courseId}/subject/${subjectId}/comparison`)}
                    >
                        🔍 Análisis de Curso
                    </Button>
                    
                    {/* Modal para gestionar actividades */}
                    <Dialog open={editingAssignments} onOpenChange={setEditingAssignments}>
                        <DialogTrigger>
                            <Button variant="outline">📝 Gestionar Actividades</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Gestionar Actividades</DialogTitle>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                                {/* Lista de actividades existentes */}
                                <div>
                                    <h4 className="font-medium mb-2">Actividades Existentes:</h4>
                                    <div className="space-y-2">
                                        {assignments.map((assignment) => (
                                            <div key={assignment.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                                <span className="font-medium">{assignment.name}</span>
                                                <div className="flex gap-2 text-sm text-gray-600">
                                                    <Badge variant="outline">{assignment.type}</Badge>
                                                    <span>Peso: {assignment.weight}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Formulario para nueva actividad */}
                                <div className="border-t pt-4">
                                    <h4 className="font-medium mb-3">Crear Nueva Actividad:</h4>
                                    <div className="grid grid-cols-1 gap-3">
                                        <div>
                                            <Label htmlFor="assignment-name">Nombre de la Actividad</Label>
                                            <Input
                                                id="assignment-name"
                                                value={newAssignment.name}
                                                onChange={(e) => setNewAssignment(prev => ({ ...prev, name: e.target.value }))}
                                                placeholder="Ej: Examen Parcial 1"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <Label htmlFor="assignment-type">Tipo</Label>
                                                <Select
                                                    value={newAssignment.type}
                                                    onValueChange={(value) => setNewAssignment(prev => ({ ...prev, type: value }))}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {assignmentTypes.map((type) => (
                                                            <SelectItem key={type.value} value={type.value}>
                                                                {type.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="assignment-weight">Peso</Label>
                                                <Input
                                                    id="assignment-weight"
                                                    type="number"
                                                    step="0.1"
                                                    min="0.1"
                                                    max="10"
                                                    value={newAssignment.weight}
                                                    onChange={(e) => setNewAssignment(prev => ({ ...prev, weight: Number(e.target.value) }))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <Button variant="outline" onClick={() => setEditingAssignments(false)}>
                                    Cancelar
                                </Button>
                                <Button 
                                    onClick={handleCreateAssignment}
                                    disabled={!newAssignment.name.trim()}
                                >
                                    ➕ Crear Actividad
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Modal para editar notas */}
                    <Dialog open={editing} onOpenChange={setEditing}>
                        <DialogTrigger>
                            <Button variant="outline">📝 Editar Notas</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Editar Notas - {periods.find(p => p.value === selectedPeriod)?.label}</DialogTitle>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Estudiante</TableHead>
                                            <TableHead>Calificaciones</TableHead>
                                            <TableHead>Definitiva</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {students.map((stu) => {
                                            const entries = entriesByStudent[stu.id] || [];
                                            const finalGrade = definitivas[stu.id];

                                            return (
                                                <TableRow key={stu.id}>
                                                    <TableCell className="font-medium">
                                                        {stu.first_name} {stu.last_name}
                                                    </TableCell>
                                                    <TableCell>
                                                        {renderGradesCell(stu.id, entries)}
                                                    </TableCell>
                                                    <TableCell className="text-center font-semibold">
                                                        {finalGrade || "—"}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <Button variant="outline" onClick={() => setEditing(false)}>
                                    Cancelar
                                </Button>
                                <Button onClick={handleSave}>
                                    💾 Guardar Cambios
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

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

            {/* Sección de Comparativo IA */}
            <Card>
                <CardHeader>
                    <CardTitle>Comparativo IA</CardTitle>
                </CardHeader>
                <CardContent>
                    {comparison ? (
                        <>
                            <p className="text-sm italic text-gray-600 mb-2">📈 {comparison.comparison_text}</p>
                            <CourseComparisonChart data={comparison.chart_data} />
                        </>
                    ) : (
                        <p className="text-sm text-gray-400">Cargando comparativo…</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>
                        Notas del Período 
                        {editing && <Badge className="ml-2" variant="secondary">Modo Edición</Badge>}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Estudiante & Análisis IA</TableHead>
                                <TableHead className="text-center">Calificaciones</TableHead>
                                <TableHead className="text-center">Definitiva</TableHead>
                                <TableHead className="text-center">Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.map((stu) => {
                                const entries = entriesByStudent[stu.id] || [];
                                const finalGrade = definitivas[stu.id];
                                const analysis = analyses[stu.id];

                                return (
                                    <TableRow key={stu.id}>
                                        <TableCell>
                                            <div className="space-y-2">
                                                <div className="font-medium">{stu.first_name} {stu.last_name}</div>
                                                {analysis ? (
                                                    <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                                                        <p className="text-xs italic text-gray-600 mb-2">
                                                            📊 {analysis.analysis}
                                                        </p>
                                                        {analysis.chart_data && <StudentChart data={analysis.chart_data} />}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-gray-400 italic">🔄 Cargando análisis…</p>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-center">
                                            {renderGradesCell(stu.id, entries)}
                                        </TableCell>

                                        <TableCell className="text-center">
                                            <div className="font-semibold text-lg">
                                                {finalGrade || "—"}
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-center">
                                            <Badge variant={finalGrade >= 3 ? "default" : "destructive"}>
                                                {finalGrade >= 3 ? "Aprobado" : "Reprobado"}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}