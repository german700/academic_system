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
import GradeInputCell from "./GradeInputCell";
import "./teachers_css/CourseGradesView.css";

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
    const [newAssignmentType, setNewAssignmentType] = useState("TAREA");
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
        return Math.round(percentage);
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

        const loadData = async () => {
            try {
                setLoading(true);
                setError("");

                // Obtener el periodo actual del dashboard
                const dashboard = await fetchTeacherDashboard();
                const currentPeriodNumber = dashboard.current_period.number;

                // Actualizar el estado con el periodo actual
                setCurrentPeriod(currentPeriodNumber);
                setPeriodLabel(dashboard.current_period.name);

                // Cargar las notas del periodo actual
                const gradesResponse = await fetchCourseSubjectGrades(courseId, subjectId, currentPeriodNumber);
                setStudents(gradesResponse.students);

                // Inicializar las notas en el estado
                const initialGrades = {};
                gradesResponse.students.forEach((student) => {
                    student.grades.forEach((g) => {
                        initialGrades[`${student.student_id}-${g.assignment_id}`] = {
                            score: g.score,
                            late_submission: g.late_submission || false
                        };
                    });
                });
                setGrades(initialGrades);

                // Cargar las actividades del periodo actual (usando currentPeriodNumber)
                const tasks = await fetchCourseSubjectAssignmentsByPeriod(courseId, subjectId, currentPeriodNumber);
                const withWeights = tasks.map(a => ({
                    ...a,
                    newWeight: decimalToPercentage(a.weight)
                }));
                setAssignments(withWeights);

            } catch (err) {
                console.error("Error loading data:", err);
                if (!handleAuthError(err)) {
                    setError("Error al cargar notas y actividades");
                }
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [courseId, subjectId, user]);

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
            const gradeData = grades[`${studentId}-${a.id}`];
            const grade = gradeData?.score;
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
                if (value && value.score !== "" && !isNaN(parseFloat(value.score))) {
                    gradesData.push({
                        student_id: parseInt(studentId),
                        assignment_id: parseInt(assignmentId),
                        score: parseFloat(value.score),
                        late_submission: !!value.late_submission
                    });
                }
            });
            console.log("Grades a enviar:", gradesData);
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
                assignment_type: newAssignmentType,
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
                const newGrades = { ...grades };
                students.forEach(student => {
                    const key = `${student.student_id}-${newAssignment.id}`;
                    if (!newGrades[key]) {
                        newGrades[key] = { score: "", late_submission: false };
                    }
                });
                setGrades(newGrades);
                setShowWeightWarning(true);
            } else {
                setAssignments(updatedAssignments);
            }

            setNewAssignmentName("");
            setNewAssignmentType("TAREA");
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

        if (total <= 0) {
            setError("No hay pesos válidos para ajustar");
            return;
        }

        // Calcular los pesos proporcionales con decimales
        const proportionalWeights = assignments.map(a => {
            const current = parseInt(a.newWeight) || 0;
            return (current / total) * 100;
        });

        // Redondear hacia abajo inicialmente
        const roundedWeights = proportionalWeights.map(weight => Math.floor(weight));

        // Calcular la diferencia para llegar a 100
        const currentSum = roundedWeights.reduce((sum, weight) => sum + weight, 0);
        const difference = 100 - currentSum;

        // Distribuir la diferencia entre los elementos con mayor parte decimal
        const decimals = proportionalWeights.map((weight, index) => ({
            index,
            decimal: weight - Math.floor(weight)
        }));

        // Ordenar por parte decimal descendente
        decimals.sort((a, b) => b.decimal - a.decimal);

        // Añadir 1 a los elementos con mayor parte decimal
        for (let i = 0; i < difference; i++) {
            const index = decimals[i].index;
            roundedWeights[index] += 1;
        }

        // Aplicar los nuevos pesos
        const adjusted = assignments.map((a, index) => ({
            ...a,
            newWeight: roundedWeights[index]
        }));

        // Verificar que la suma sea exactamente 100
        const finalSum = adjusted.reduce((sum, a) => sum + (parseInt(a.newWeight) || 0), 0);

        if (finalSum !== 100) {
            console.error("Error: La suma no es 100%", finalSum);
            setError("Error al ajustar los pesos");
            return;
        }

        // Actualizar solo el estado local
        setAssignments(adjusted);

        setSuccessMessage("Pesos ajustados automáticamente al 100%. Presiona 'Guardar Cambios' para confirmar.");
    };

    const handleSaveWeights = async () => {
        try {
            const weightsPayload = assignments.map(a => ({
                assignment_id: a.id,
                weight: percentageToDecimal(a.newWeight)
            }));

            await updateAssignmentWeights(courseId, subjectId, currentPeriod, weightsPayload);

            setSuccessMessage("Pesos actualizados correctamente");

            setTimeout(() => {
                window.location.reload();
            }, 1000);

        } catch (err) {
            if (!handleAuthError(err)) {
                setError("Error actualizando pesos");
            }
        }
    };

    if (!user || !user.token) return <div className="loading-container"><div className="loading-text">Redirigiendo...</div></div>;
    if (loading) return <div className="loading-container"><div className="loading-text">Cargando...</div></div>;

    return (
        <div className="course-grades-view">
            {/* Header */}
            <div className="grades-header">
                <h1 className="grades-header-title">Editar Notas - {periodLabel}</h1>
                <div className="grades-header-actions">
                    <button
                        className="grades-action-btn outline"
                        onClick={() => navigate(`/teachers/courses/${courseId}/subject/${subjectId}/grades`)}
                    >
                        ← Volver
                    </button>
                    <button
                        className="grades-action-btn primary"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? "Guardando..." : "💾 Guardar Cambios"}
                    </button>
                </div>
            </div>

            {/* Alerts */}
            {error && (
                <div className="error-container">
                    <div className="error-text">⚠️ {error}</div>
                </div>
            )}
            {successMessage && (
                <div className="grades-card" style={{ background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', border: '2px solid #10b981' }}>
                    <div style={{ color: '#059669', fontWeight: '600' }}>
                        ✅ {successMessage}
                    </div>
                </div>
            )}

            {showWeightWarning && (
                <div className="grades-card" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', border: '2px solid #f59e0b' }}>
                    <div style={{ color: '#d97706', fontWeight: '600' }}>
                        ⚖️ Se redistribuyeron automáticamente los pesos para mantener el 100%.
                    </div>
                </div>
            )}

            {/* Weight Progress */}
            <div className="grades-card">
                <div className="grades-card-header">
                    <h2 className="grades-card-title">Control de Pesos</h2>
                </div>
                <div className="grades-card-content">
                    <div className="weight-progress">
                        <div className="weight-progress-bar">
                            <div
                                className="weight-progress-fill"
                                style={{ width: `${totalWeight}%` }}
                            />
                        </div>
                        <div className="weight-progress-text">
                            Pesos asignados: {totalWeight}% / 100%
                            {totalWeight > 100 && (
                                <span className="weight-progress-warning">
                                    ⚠️ Excede el 100%
                                </span>
                            )}
                        </div>
                        {assignments.length > 0 && totalWeight !== 100 && (
                            <button
                                className="grades-action-btn secondary"
                                onClick={normalizeWeightsTo100}
                                disabled={saving}
                                style={{ marginTop: '12px' }}
                            >
                                {saving ? "Ajustando..." : "⚖️ Ajustar automáticamente a 100%"}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Existing Assignments */}
            {assignments.length > 0 && (
                <div className="grades-card">
                    <div className="grades-card-header">
                        <h2 className="grades-card-title">Actividades Existentes</h2>
                    </div>
                    <div className="grades-card-content">
                        <div className="search-grid">
                            {assignments.map((assignment) => (
                                <div key={assignment.id} className="grades-card" style={{ margin: '0', padding: '20px' }}>
                                    <div className="search-field">
                                        <div className="search-label">{assignment.name}</div>
                                        <div className="grade-badge outline">
                                            {ASSIGNMENT_TYPES.find(t => t.value === assignment.assignment_type)?.label || assignment.assignment_type}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                                            <span style={{ fontSize: '14px', fontWeight: '600' }}>Peso:</span>
                                            <input
                                                type="number"
                                                min="1"
                                                max="100"
                                                value={assignment.newWeight || ""}
                                                onChange={(e) => handleWeightChange(assignment.id, e.target.value)}
                                                className="search-input"
                                                style={{ width: '80px' }}
                                            />
                                            <span style={{ fontSize: '14px', fontWeight: '600' }}>%</span>
                                        </div>
                                        <button
                                            className="grades-action-btn"
                                            style={{
                                                background: 'linear-gradient(135deg, #ef4444, #f87171)',
                                                color: 'white',
                                                marginTop: '8px',
                                                width: '100%'
                                            }}
                                            onClick={() => handleDeleteAssignment(assignment.id, assignment.name)}
                                        >
                                            🗑️ Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                            <button
                                className="grades-action-btn secondary"
                                onClick={handleSaveWeights}
                            >
                                💾 Guardar Pesos
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
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

            {/* Create Assignment Form */}
            <div className="grades-card">
                <div className="grades-card-header">
                    <h2 className="grades-card-title">Crear Nueva Actividad</h2>
                </div>
                <div className="grades-card-content">
                    <div className="search-grid">
                        <div className="search-field">
                            <label className="search-label">Nombre</label>
                            <input
                                type="text"
                                value={newAssignmentName}
                                onChange={(e) => setNewAssignmentName(e.target.value)}
                                placeholder="Nombre de la actividad"
                                className="search-input"
                            />
                        </div>
                        <div className="search-field">
                            <label className="search-label">Tipo</label>
                            <select
                                value={newAssignmentType}
                                onChange={(e) => setNewAssignmentType(e.target.value)}
                                className="search-input"
                            >
                                {ASSIGNMENT_TYPES.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="search-field">
                            <label className="search-label">Peso (%)</label>
                            <input
                                type="number"
                                min="1"
                                max={safeRemaining}
                                value={newAssignmentWeight}
                                onChange={(e) => setNewAssignmentWeight(parseInt(e.target.value) || 0)}
                                className="search-input"
                            />
                            {newAssignmentWeight > remainingWeight && (
                                <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                                    ⚠️ Excede {remainingWeight}% restante
                                </div>
                            )}
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                        <button
                            className="grades-action-btn primary"
                            onClick={handleCreateAssignment}
                            disabled={!newAssignmentName || newAssignmentWeight > remainingWeight}
                        >
                            ➕ Añadir Actividad
                        </button>
                    </div>
                </div>
            </div>

            {/* Grades Table */}
            <div className="grades-card">
                <div className="grades-card-header">
                    <h2 className="grades-card-title">Notas del Periodo</h2>
                </div>
                <div className="grades-card-content">
                    <div className="grades-table-container">
                        <table className="grades-table">
                            <thead className="grades-table-header">
                                <tr className="grades-table-header-row">
                                    <th className="grades-table-header-cell">Estudiante</th>
                                    {assignments.map((a) => (
                                        <th key={a.id} className="grades-table-header-cell">
                                            <div className="assignment-header">
                                                <div className="assignment-name">{a.name}</div>
                                                <div className="assignment-weight">({a.newWeight || 0}%)</div>
                                                <div style={{ fontSize: '10px', color: '#64748b' }}>
                                                    {ASSIGNMENT_TYPES.find(t => t.value === a.assignment_type)?.label || a.assignment_type}
                                                </div>
                                            </div>
                                        </th>
                                    ))}
                                    <th className="grades-table-header-cell">Definitiva</th>
                                    <th className="grades-table-header-cell">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="grades-table-body">
                                {students.map((s) => (
                                    <tr key={s.student_id} className="grades-table-row">
                                        <td className="grades-table-cell">
                                            <div className="student-name">{s.student_name}</div>
                                        </td>
                                        {assignments.map((a) => (
                                            <td key={a.id} className="grades-table-cell">
                                                <GradeInputCell
                                                    value={grades[`${s.student_id}-${a.id}`]?.score}
                                                    late={grades[`${s.student_id}-${a.id}`]?.late_submission}
                                                    onChange={(val) => setGrades((prev) => ({
                                                        ...prev,
                                                        [`${s.student_id}-${a.id}`]: val
                                                    }))}
                                                />
                                            </td>
                                        ))}
                                        <td className="grades-table-cell">
                                            <div className="final-grade">
                                                {calculateFinal(s.student_id)}
                                            </div>
                                        </td>
                                        <td className="grades-table-cell">
                                            <span className={`status-badge ${calculateFinal(s.student_id) >= 3 ? "approved" : "failed"}`}>
                                                {calculateFinal(s.student_id) >= 3 ? "Aprobado" : "Reprobado"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Botón flotante fijo */}
            <div className="floating-save-container">
                <button
                    className="floating-save-btn"
                    onClick={handleSave}
                    disabled={saving}
                    title="Guardar cambios"
                >
                    {saving ? (
                        <>
                            <div className="spinner"></div>
                            <span>Guardando...</span>
                        </>
                    ) : (
                        <>
                            💾
                            <span>Guardar</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}