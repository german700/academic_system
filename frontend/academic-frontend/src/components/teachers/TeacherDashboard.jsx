import React, { useEffect, useState } from "react";
import { fetchTeacherDashboard } from "../services/docentesService";
import { Card, CardContent } from "../shared/ui/card";
import { useNavigate } from "react-router-dom";
import './teachers_css/TeacherDashboard.css';

export default function TeacherDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hoveredCard, setHoveredCard] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTeacherDashboard()
            .then(setData)
            .catch((err) => {
                console.error("Error fetching dashboard:", err);
                setError("Error al cargar el dashboard");
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="loading">
                <div>🔄 Cargando dashboard...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error">
                <div>⚠️ {error}</div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="loading">
                <div>📚 No hay datos disponibles</div>
            </div>
        );
    }

    const totalStudents = data.courses?.reduce((total, course) => total + (course.student_count || 0), 0) || 0;
    const totalGrades = data.courses ? new Set(data.courses.map(course => course.grado?.numero)).size : 0;

    return (
        <div className="teacher-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <h1 className="dashboard-header-title">
                    🎓 Mi Dashboard
                </h1>
                <div className="period-card">
                    <p className="period-label">📅 Periodo Actual</p>
                    <p className="period-value">
                        {data.current_period
                            ? `${data.current_period.name} (${data.current_period.number})`
                            : "Ningún periodo activo"
                        }
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-content">
                        <div>
                            <p className="stat-label">Total Cursos</p>
                            <p className="stat-value">{data.courses?.length || 0}</p>
                        </div>
                        <div className="stat-icon">📚</div>
                    </div>
                </div>
                
                <div className="stat-card green">
                    <div className="stat-content">
                        <div>
                            <p className="stat-label">Total Estudiantes</p>
                            <p className="stat-value">{totalStudents}</p>
                        </div>
                        <div className="stat-icon">👥</div>
                    </div>
                </div>
                
                <div className="stat-card purple">
                    <div className="stat-content">
                        <div>
                            <p className="stat-label">Grados Activos</p>
                            <p className="stat-value">{totalGrades}</p>
                        </div>
                        <div className="stat-icon">🎓</div>
                    </div>
                </div>
            </div>

            {/* Courses */}
            <div>
                <h2 className="section-title">
                    📖 Mis Cursos
                </h2>
                
                {data.courses && data.courses.length > 0 ? (
                    <div className="courses-grid">
                        {data.courses.map((course) => (
                            <div
                                key={course.id}
                                className="course-card"
                                onMouseEnter={() => setHoveredCard(course.id)}
                                onMouseLeave={() => setHoveredCard(null)}
                                onClick={() => navigate(`/teachers/courses/${course.id}`)}
                            >
                                <h3 className="course-title">
                                    {course.name}
                                </h3>
                                
                                <div className="course-info">
                                    <div className="course-detail">
                                        🎓 Grado: {course.grado || 'N/A'}
                                    </div>
                                    <div className="course-detail">
                                        👥 {course.student_count || 0} estudiantes
                                    </div>
                                </div>
                                
                                <div className="course-footer">
                                    <span className="course-action">Ver detalles del curso</span>
                                    <div className="status-dot"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
                        <h3 className="empty-title">No tienes cursos asignados</h3>
                        <p className="empty-description">
                            Contacta al administrador para que te asigne cursos
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}