import React, { useState } from "react";
import { Input } from "../shared/ui/input";
import StudentCard from "./StudentCard";

export default function StudentList({ students, courseId, subjectId, period, courseName, subjectName }) {
    const [q, setQ] = useState("");

    const filtered = students.filter(s => {
        // Buscar por nombre completo
        const searchTerm = `${s.first_name} ${s.last_name}`.toLowerCase();
        return searchTerm.includes(q.toLowerCase());
    });

    return (
        <div className="teacher-dashboard">
            {/* Header con información del curso */}
            <div className="dashboard-header">
                <div className="dashboard-header-title">
                    Lista de Estudiantes
                </div>
                <div className="period-card">
                    <div className="period-label">Curso</div>
                    <div className="period-value">{courseName} - {subjectName}</div>
                </div>
            </div>

            {/* Sección de búsqueda y estadísticas */}
            <div className="analysis-card">
                <div className="analysis-card-header">
                    <div className="analysis-card-title">
                        Buscar Estudiantes
                    </div>
                </div>

                <div className="period-selector-section">
                    <Input
                        placeholder="Buscar estudiante..."
                        value={q}
                        onChange={e => setQ(e.target.value)}
                        className="period-select"
                        style={{ width: '300px' }}
                    />
                    <div className="analysis-description">
                        {filtered.length} de {students.length} estudiantes
                    </div>
                </div>
            </div>

            {/* Grid de estudiantes */}
            <div className="section-title">
                Estudiantes ({filtered.length})
            </div>

            {filtered.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-title">
                        {q ? "No se encontraron estudiantes" : "No hay estudiantes"}
                    </div>
                    <div className="empty-description">
                        {q ? `No hay estudiantes que coincidan con "${q}"` : "No hay estudiantes registrados en este curso."}
                    </div>
                </div>
            ) : (
                <div className="courses-grid">
                    {filtered.map(s => (
                        <StudentCard
                            key={s.student_id}
                            student={s}
                            courseId={courseId}
                            subjectId={subjectId}
                            period={period}
                            courseName={courseName}
                            subjectName={subjectName}
                        />

                    ))}
                </div>
            )}
        </div>
    );
}