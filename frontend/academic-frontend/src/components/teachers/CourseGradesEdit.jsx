//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\teachers\CourseGradesEdit.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Card, CardHeader, CardContent, CardTitle } from "../shared/ui/card";
import { Button } from "../shared/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../shared/ui/table";
import { Input } from "../shared/ui/input";
import { Alert, AlertDescription } from "../shared/ui/alert";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "../shared/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../shared/ui/alert-dialog";
import {
    fetchCourseSubjectGrades,
    fetchCourseSubjectAssignmentsByPeriod,
    updateGrades,
    createAssignment,
    deleteAssignment,
    fetchTeacherDashboard,
    updateAssignmentWeights
} from "../services/docentesService";

// Constante para los tipos de actividades
const ASSIGNMENT_TYPES = [
    { value: "TAREA", label: "Tarea" },
    { value: "EXAMEN", label: "Examen" },
    { value: "QUIZ", label: "Quiz" },
    { value: "PROYECTO", label: "Proyecto" },
    { value: "PARTICIPACION", label: "Participación" },
    { value: "LABORATORIO", label: "Laboratorio" },
    { value: "ENSAYO", label: "Ensayo" },
    { value: "PRESENTACION", label: "Presentación" },
    { value: "OTRO", label: "Otro" }
];

export default function CourseGradesEdit() {
    const { courseId, subjectId } = useParams();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [students, setStudents] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [newAssignmentName, setNewAssignmentName] = useState("");
    const [newAssignmentType, setNewAssignmentType] = useState("TAREA"); // Estado para el tipo
    const [newAssignmentWeight, setNewAssignmentWeight] = useState(1);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState();
    const [successMessage, setSuccessMessage] = useState("");
    const [grades, setGrades] = useState({});
    const [currentPeriod, setCurrentPeriod] = useState("1");
    const [periodLabel, setPeriodLabel] = useState("");
    const [showWeightWarning, setShowWeightWarning] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [assignmentToDelete, setAssignmentToDelete] = useState(null);

    // Función para convertir decimal a porcentaje entero
    const decimalToPercentage = (decimal) => {
        const percentage = (parseFloat(decimal) || 0) * 100;
        return Math.round(percentage); // Redondear para evitar decimales
    };

    // Función para convertir porcentaje a decimal
    const percentageToDecimal = (percentage) => {
        return (parseFloat(percentage) || 0) / 100;
    };

    const totalWeight = assignments.reduce(
        (sum, a) => sum + (parseInt(a.newWeight) || 0),
        0);
    const remainingWeight = 100 - totalWeight;
    const safeRemaining = Number.isFinite(remainingWeight) ? remainingWeight : 100;

    const handleAuthError = (error) => {
        if (error.message.includes("401") || error.message.includes("token")) {
            logout();
            navigate("/login");
            return true;
        }
        return false;
    };

    useEffect(() => {
        if (!user || !user.token) {
            navigate("/login");
            return;
        }

        setLoading(true);
        setError("");

        fetchTeacherDashboard()
            .then((d) => {
                setCurrentPeriod(d.current_period.number);
                setPeriodLabel(d.current_period.name);
                return fetchCourseSubjectGrades(courseId, subjectId, d.current_period.number);
            })
            .then((res) => {
                setStudents(res.students);
                const initialGrades = {};
                res.students.forEach((student) => {
                    student.grades.forEach((g) => {
                        initialGrades[`${student.student_id}-${g.assignment_id}`] = g.score;
                    });
                });
                setGrades(initialGrades);
                return fetchCourseSubjectAssignmentsByPeriod(courseId, subjectId, currentPeriod);
            })
            .then(tasks => {
                const withWeights = tasks.map(a => ({
                    ...a,
                    newWeight: decimalToPercentage(a.weight) // Convertir a porcentaje entero
                }));
                setAssignments(withWeights);
            })
            .catch((err) => {
                if (!handleAuthError(err)) setError("Error al cargar notas y actividades");
            })
            .finally(() => setLoading(false));
    }, [courseId, subjectId, user]);

    const handleGradeChange = (studentId, assignmentId, value) => {
        const key = `${studentId}-${assignmentId}`;
        const num = parseFloat(value);
        if (value === "" || (num >= 1 && num <= 5)) {
            setGrades((prev) => ({ ...prev, [key]: value === "" ? "" : num }));
        }
    };

    const handleWeightChange = (assignmentId, value) => {
        const updated = assignments.map(item =>
            item.id === assignmentId ?
                { ...item, newWeight: value === "" ? 0 : parseInt(value) || 0 } :
                item
        );
        setAssignments(updated);
    };

    const calculateFinal = (studentId) => {
        let total = 0;
        let weightSum = 0;
        for (const a of assignments) {
            const grade = grades[`${studentId}-${a.id}`];
            const weight = parseInt(a.newWeight) || 0;
            if (!isNaN(grade) && weight > 0) {
                total += grade * weight;
                weightSum += weight;
            }
        }
        return weightSum > 0 ? (total / weightSum).toFixed(2) : "0.00";
    };

    const handleSave = async () => {
        setSaving(true);
        setError("");
        setSuccessMessage("");

        try {
            const weightsPayload = assignments.map(a => ({
                assignment_id: a.id,
                weight: percentageToDecimal(a.newWeight)
            }));

            if (weightsPayload.length > 0) {
                await updateAssignmentWeights(courseId, subjectId, currentPeriod, weightsPayload);
            }

            const gradesData = [];
            Object.entries(grades).forEach(([key, value]) => {
                const [studentId, assignmentId] = key.split("-");
                if (value !== "" && !isNaN(value)) {
                    gradesData.push({
                        student_id: parseInt(studentId),
                        assignment_id: parseInt(assignmentId),
                        score: parseFloat(value)
                    });
                }
            });

            if (gradesData.length > 0) {
                await updateGrades(courseId, subjectId, gradesData, currentPeriod);
            }

            setSuccessMessage("Pesos y notas guardados correctamente");

            setTimeout(() => {
                window.location.reload();
            }, 1500);

        } catch (err) {
            console.error("Error en handleSave:", err);
            if (!handleAuthError(err)) {
                setError(`Error al guardar cambios: ${err.message}`);
            }
        } finally {
            setSaving(false);
        }
    };

    const handleCreateAssignment = async () => {
        if (!newAssignmentName.trim() || newAssignmentWeight <= 0 || newAssignmentWeight > remainingWeight) return;

        try {
            const resp = await createAssignment(courseId, subjectId, currentPeriod, {
                name: newAssignmentName,
                assignment_type: newAssignmentType, // Usar el tipo seleccionado
                weight: percentageToDecimal(newAssignmentWeight)
            });

            const newAssignment = {
                ...(resp.assignment || resp),
                newWeight: parseInt(newAssignmentWeight) || 0
            };
            const updatedAssignments = [...assignments, newAssignment];

            const totalActual = updatedAssignments.reduce((sum, a) => sum + (parseInt(a.newWeight) || 0), 0);

            if (totalActual > 0) {
                const factor = 100 / totalActual;
                const adjusted = updatedAssignments.map(a => ({
                    ...a,
                    weight: Math.round((parseInt(a.newWeight) || 0) * factor),
                    newWeight: Math.round((parseInt(a.newWeight) || 0) * factor)
                }));

                setAssignments(adjusted);
                setShowWeightWarning(true);
            } else {
                setAssignments(updatedAssignments);
            }

            setNewAssignmentName("");
            setNewAssignmentType("TAREA"); // Resetear el tipo
            setNewAssignmentWeight(1);
            setSuccessMessage("Actividad creada y pesos ajustados");
        } catch (err) {
            if (!handleAuthError(err)) setError("Error creando actividad");
        }
    };

    const handleDeleteAssignment = (assignmentId, name) => {
        setAssignmentToDelete({ id: assignmentId, name });
        setDeleteDialogOpen(true);
    };

    const confirmDeleteAssignment = async () => {
        if (!assignmentToDelete) return;

        try {
            await deleteAssignment(assignmentToDelete.id);

            const refreshed = await fetchCourseSubjectAssignmentsByPeriod(courseId, subjectId, currentPeriod);
            const withWeights = refreshed.map(a => ({
                ...a,
                newWeight: decimalToPercentage(a.weight)
            }));
            setAssignments(withWeights);

            const updatedGrades = { ...grades };
            Object.keys(updatedGrades).forEach(key => {
                if (key.endsWith(`-${assignmentToDelete.id}`)) {
                    delete updatedGrades[key];
                }
            });
            setGrades(updatedGrades);

            setSuccessMessage(`Actividad "${assignmentToDelete.name}" eliminada correctamente.`);
            setDeleteDialogOpen(false);
            setAssignmentToDelete(null);
        } catch (err) {
            if (!handleAuthError(err)) {
                setError("Error eliminando la actividad.");
            }
            setDeleteDialogOpen(false);
            setAssignmentToDelete(null);
        }
    };

    const normalizeWeightsTo100 = () => {
        const total = assignments.reduce(
            (sum, a) => sum + (parseInt(a.newWeight) || 0),
            0
        );

        if (total <= 0) return;

        const adjusted = assignments.map(a => {
            const current = parseInt(a.newWeight) || 0;
            return {
                ...a,
                newWeight: Math.round((current / total) * 100)
            };
        });
        setAssignments(adjusted);
    };

    // SOLUCIÓN PROBLEMA 1: Función corregida para guardar pesos específicos
    const handleSaveWeights = async () => {
        try {
            const weightsPayload = assignments.map(a => ({
                assignment_id: a.id,
                weight: percentageToDecimal(a.newWeight) // Usar newWeight directamente
            }));

            await updateAssignmentWeights(courseId, subjectId, currentPeriod, weightsPayload);

            setSuccessMessage("Pesos actualizados correctamente");

            // Recargar la página para reflejar los cambios
            setTimeout(() => {
                window.location.reload();
            }, 1000);

        } catch (err) {
            if (!handleAuthError(err)) {
                setError("Error actualizando pesos");
            }
        }
    };

    if (!user || !user.token) return <p>Redirigiendo...</p>;
    if (loading) return <p>Cargando...</p>;

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl">Editar Notas</h1>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            {successMessage && (
                <Alert>
                    <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
            )}

            {showWeightWarning && (
                <Alert>
                    <AlertDescription>
                        ⚖️ Se redistribuyeron automáticamente los pesos para mantener el 100%.
                    </AlertDescription>
                </Alert>
            )}

            {assignments.length > 0 && totalWeight !== 100 && (
                <div className="flex items-center gap-2">
                    <p className="text-sm text-red-600">
                        Los pesos no suman 100% ({totalWeight}%)
                    </p>
                    <Button variant="secondary" onClick={normalizeWeightsTo100}>
                        Ajustar automáticamente a 100%
                    </Button>
                </div>
            )}

            <div className="w-full bg-gray-200 h-2 rounded">
                <div className="h-2 bg-green-500 rounded" style={{ width: `${totalWeight}%` }} />
            </div>
            <p className="text-sm">Pesos asignados: {totalWeight}% / 100%</p>

            {assignments.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Actividades Existentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {assignments.map((assignment) => (
                                <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium">{assignment.name}</span>
                                            <span className="text-sm text-gray-500">
                                                {ASSIGNMENT_TYPES.find(t => t.value === assignment.assignment_type)?.label || assignment.assignment_type}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600">Peso:</span>
                                            <Input
                                                type="number"
                                                min="1"
                                                max="100"
                                                value={assignment.newWeight || ""}
                                                onChange={(e) => handleWeightChange(assignment.id, e.target.value)}
                                                className="w-20"
                                            />
                                            <span className="text-sm text-gray-600">%</span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDeleteAssignment(assignment.id, assignment.name)}
                                        className="bg-red-500 hover:bg-red-600 text-white"
                                    >
                                        🗑️ Eliminar
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex justify-end">
                            <Button onClick={handleSaveWeights}>Guardar Pesos</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar actividad?</AlertDialogTitle>
                        <AlertDialogDescription>
                            ¿Estás seguro de que quieres eliminar la actividad "{assignmentToDelete?.name}"?
                            Esta acción no se puede deshacer y se perderán todas las notas asociadas.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteAssignment}>
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Card>
                <CardHeader>
                    <CardTitle>Gestionar Actividades</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nombre</label>
                        <Input
                            value={newAssignmentName}
                            onChange={(e) => setNewAssignmentName(e.target.value)}
                            placeholder="Nombre de la actividad"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Tipo</label>
                        <select
                            value={newAssignmentType}
                            onChange={(e) => setNewAssignmentType(e.target.value)}
                            className="border rounded p-2 h-10 min-w-[120px]"
                        >
                            {ASSIGNMENT_TYPES.map(opt => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Peso (%)</label>
                        <Input
                            type="number"
                            min="1"
                            max={safeRemaining}
                            value={newAssignmentWeight}
                            onChange={(e) => setNewAssignmentWeight(parseInt(e.target.value) || 0)}
                        />
                    </div>
                    {newAssignmentWeight > remainingWeight && (
                        <p className="text-red-600 text-sm">Excede {remainingWeight}% restante</p>
                    )}
                    <Button
                        onClick={handleCreateAssignment}
                        disabled={!newAssignmentName || newAssignmentWeight > remainingWeight}
                    >
                        Añadir
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Notas del Periodo</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Estudiante</TableHead>
                                    {assignments.map((a) => (
                                        <TableHead key={a.id}>
                                            <div className="flex flex-col items-center">
                                                <div className="flex items-center gap-1">
                                                    <span>{a.name}</span>
                                                    <span className="text-xs text-gray-500">({a.newWeight || 0}%)</span>
                                                </div>
                                                <span className="text-xs text-gray-400">
                                                    {ASSIGNMENT_TYPES.find(t => t.value === a.assignment_type)?.label || a.assignment_type}
                                                </span>
                                            </div>
                                        </TableHead>
                                    ))}
                                    <TableHead>Definitiva</TableHead>
                                    <TableHead>Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map((s) => (
                                    <TableRow key={s.student_id}>
                                        <TableCell>{s.student_name}</TableCell>
                                        {assignments.map((a) => (
                                            <TableCell key={a.id} className="text-center">
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    max="5"
                                                    step="0.1"
                                                    value={grades[`${s.student_id}-${a.id}`] || ""}
                                                    onChange={(e) => handleGradeChange(s.student_id, a.id, e.target.value)}
                                                    className="w-16 text-center"
                                                />
                                            </TableCell>
                                        ))}
                                        <TableCell className="text-center font-semibold">{calculateFinal(s.student_id)}</TableCell>
                                        <TableCell className="text-center">
                                            <span
                                                className={`px-2 py-1 rounded text-xs ${calculateFinal(s.student_id) >= 3 ? "bg-green-100" : "bg-red-100"
                                                    }`}
                                            >
                                                {calculateFinal(s.student_id) >= 3 ? "Aprobado" : "Reprobado"}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => navigate(`/teachers/courses/${courseId}/subject/${subjectId}/grades`)}>
                    Cancelar
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? "Guardando..." : "Guardar Cambios"}
                </Button>
            </div>
        </div>
    );
}