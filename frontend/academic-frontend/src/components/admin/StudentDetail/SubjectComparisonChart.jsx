//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\admin\StudentDetail\SubjectComparisonChart.jsx
import React, { useState, useMemo } from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
} from "recharts";

const SubjectComparisonChart = ({ comparisonData = [] }) => {
    // Extraer periodos únicos para el filtro (ordenados)
    const periodos = useMemo(() => {
        const uniquePeriods = new Set(comparisonData.map((item) => item.period));
        return Array.from(uniquePeriods).sort((a, b) => a - b);
    }, [comparisonData]);

    // Extraer materias únicas para filtro materia (ordenadas)
    const materias = useMemo(() => {
        const uniqueSubjects = new Set(comparisonData.map((item) => item.subject_name));
        return Array.from(uniqueSubjects).sort();
    }, [comparisonData]);

    // Estados para filtros, default null significa "Todos"
    const [periodoSeleccionado, setPeriodoSeleccionado] = useState(null); // null = todos los periodos
    const [materiaSeleccionada, setMateriaSeleccionada] = useState(null); // null = todas las materias

    // Filtrar datos según filtros seleccionados
    const datosFiltrados = useMemo(() => {
        return comparisonData.filter((item) => {
            const matchPeriodo = periodoSeleccionado === null || item.period === periodoSeleccionado;
            const matchMateria = materiaSeleccionada === null || item.subject_name === materiaSeleccionada;
            return matchPeriodo && matchMateria;
        });
    }, [comparisonData, periodoSeleccionado, materiaSeleccionada]);

    if (!comparisonData || comparisonData.length === 0) {
        return <p>No hay datos de comparación disponibles.</p>;
    }

    return (
        <div className="mt-8">
            <h2 className="text-xl font-semibold mb-2">
                📊 Comparación de Promedio por Materia
            </h2>

            <div style={{ marginBottom: 16, display: "flex", gap: 16, flexWrap: "wrap" }}>
                {/* Selector de periodos */}
                <label>
                    Periodo:{" "}
                    <select
                        value={periodoSeleccionado ?? ""}
                        onChange={(e) => setPeriodoSeleccionado(e.target.value ? Number(e.target.value) : null)}
                    >
                        <option value="">Todos los periodos</option>
                        {periodos.map((p) => (
                            <option key={p} value={p}>
                                Periodo {p}
                            </option>
                        ))}
                    </select>
                </label>

                {/* Selector de materias */}
                <label>
                    Materia:{" "}
                    <select
                        value={materiaSeleccionada ?? ""}
                        onChange={(e) => setMateriaSeleccionada(e.target.value || null)}
                    >
                        <option value="">Todas las materias</option>
                        {materias.map((m) => (
                            <option key={m} value={m}>
                                {m}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <ResponsiveContainer width="100%" height={400}>
                <BarChart
                    data={datosFiltrados}
                    margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                    barCategoryGap="20%"
                >
                    <CartesianGrid stroke="#ccc" />
                    <XAxis dataKey="subject_name" />
                    <YAxis
                        domain={[0, 5]}
                        label={{
                            value: "Promedio de Calificaciones (0 a 5)",
                            angle: -90,
                            position: "insideLeft",
                            style: { textAnchor: "middle", fontSize: 14 },
                        }}
                    />

                    <Tooltip />
                    <Legend />
                    <Bar dataKey="student_avg" fill="#8884d8" name="Estudiante" />
                    <Bar dataKey="course_avg" fill="#82ca9d" name="Curso" />
                    <Bar dataKey="grade_avg" fill="#ffc658" name="Grado" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SubjectComparisonChart;
