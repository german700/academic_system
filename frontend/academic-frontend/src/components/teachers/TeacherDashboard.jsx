//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\teachers\TeacherDashboard.jsx
import React, { useEffect, useState } from "react";
import { fetchTeacherDashboard } from "../services/docentesService";
import { Card, CardContent } from "../shared/ui/card";
import { useNavigate } from "react-router-dom";

export default function TeacherDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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

    const styles = {
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '24px',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        },
        header: {
            background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
            borderRadius: '16px',
            padding: '32px',
            color: 'white',
            marginBottom: '32px',
            boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)'
        },
        headerTitle: {
            fontSize: '20px', // Reducido de 32px a 20px
            fontWeight: 'bold',
            margin: '0 0 24px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
        },
        periodCard: {
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
        },
        periodLabel: {
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.8)',
            margin: '0 0 8px 0'
        },
        periodValue: {
            fontSize: '18px',
            fontWeight: '600',
            margin: '0'
        },
        statsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px',
            marginBottom: '40px'
        },
        statCard: {
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: '1px solid #E5E7EB',
            borderLeft: '4px solid #3B82F6'
        },
        statCardGreen: {
            borderLeft: '4px solid #10B981'
        },
        statCardPurple: {
            borderLeft: '4px solid #8B5CF6'
        },
        statContent: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        statLabel: {
            fontSize: '14px',
            color: '#6B7280',
            fontWeight: '500',
            margin: '0 0 8px 0'
        },
        statValue: {
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#111827',
            margin: '0'
        },
        statIcon: {
            width: '32px',
            height: '32px',
            color: '#3B82F6'
        },
        sectionTitle: {
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#111827',
            margin: '0 0 24px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
        },
        coursesGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px'
        },
        courseCard: {
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            borderWidth: '2px',
            borderStyle: 'solid',
            borderColor: '#E5E7EB',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            position: 'relative',
            overflow: 'hidden'
        },
        courseCardHover: {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 25px rgba(59, 130, 246, 0.15)',
            borderColor: '#3B82F6'
        },
        courseTitle: {
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#111827',
            margin: '0 0 16px 0',
            transition: 'color 0.3s ease'
        },
        courseInfo: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginBottom: '16px'
        },
        courseDetail: {
            fontSize: '14px',
            color: '#6B7280',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        courseFooter: {
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid #F3F4F6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        courseAction: {
            fontSize: '12px',
            color: '#6B7280'
        },
        statusDot: {
            width: '8px',
            height: '8px',
            backgroundColor: '#10B981',
            borderRadius: '50%'
        },
        loading: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
            fontSize: '16px',
            color: '#6B7280'
        },
        error: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
            fontSize: '16px',
            color: '#DC2626'
        },
        emptyState: {
            textAlign: 'center',
            padding: '48px 24px',
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #E5E7EB'
        },
        emptyTitle: {
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827',
            margin: '16px 0 8px 0'
        },
        emptyDescription: {
            fontSize: '14px',
            color: '#6B7280',
            margin: '0'
        }
    };

    const [hoveredCard, setHoveredCard] = useState(null);

    if (loading) {
        return (
            <div style={styles.loading}>
                <div>🔄 Cargando dashboard...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.error}>
                <div>⚠️ {error}</div>
            </div>
        );
    }

    if (!data) {
        return (
            <div style={styles.loading}>
                <div>📚 No hay datos disponibles</div>
            </div>
        );
    }

    const totalStudents = data.courses?.reduce((total, course) => total + (course.student_count || 0), 0) || 0;
    const totalGrades = data.courses ? new Set(data.courses.map(course => course.grado?.numero)).size : 0;

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <h1 style={styles.headerTitle}>
                    🎓 Mi Dashboard
                </h1>

                <div style={styles.periodCard}>
                    <p style={styles.periodLabel}>📅 Periodo Actual</p>
                    <p style={styles.periodValue}>
                        {data.current_period
                            ? `${data.current_period.name} (${data.current_period.number})`
                            : "Ningún periodo activo"
                        }
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <div style={styles.statContent}>
                        <div>
                            <p style={styles.statLabel}>Total Cursos</p>
                            <p style={styles.statValue}>{data.courses?.length || 0}</p>
                        </div>
                        <div style={{ ...styles.statIcon, fontSize: '32px' }}>📚</div>
                    </div>
                </div>

                <div style={{ ...styles.statCard, ...styles.statCardGreen }}>
                    <div style={styles.statContent}>
                        <div>
                            <p style={styles.statLabel}>Total Estudiantes</p>
                            <p style={styles.statValue}>{totalStudents}</p>
                        </div>
                        <div style={{ ...styles.statIcon, fontSize: '32px', color: '#10B981' }}>👥</div>
                    </div>
                </div>

                <div style={{ ...styles.statCard, ...styles.statCardPurple }}>
                    <div style={styles.statContent}>
                        <div>
                            <p style={styles.statLabel}>Grados Activos</p>
                            <p style={styles.statValue}>{totalGrades}</p>
                        </div>
                        <div style={{ ...styles.statIcon, fontSize: '32px', color: '#8B5CF6' }}>🎓</div>
                    </div>
                </div>
            </div>

            {/* Courses */}
            <div>
                <h2 style={styles.sectionTitle}>
                    📖 Mis Cursos
                </h2>

                {data.courses && data.courses.length > 0 ? (
                    <div style={styles.coursesGrid}>
                        {data.courses.map((course) => (
                            <div
                                key={course.id}
                                style={{
                                    ...styles.courseCard,
                                    ...(hoveredCard === course.id ? styles.courseCardHover : {})
                                }}
                                onMouseEnter={() => setHoveredCard(course.id)}
                                onMouseLeave={() => setHoveredCard(null)}
                                onClick={() => navigate(`/teachers/courses/${course.id}`)}
                            >
                                <h3 style={{
                                    ...styles.courseTitle,
                                    color: hoveredCard === course.id ? '#3B82F6' : '#111827'
                                }}>
                                    {course.name}
                                </h3>

                                <div style={styles.courseInfo}>
                                    <div style={styles.courseDetail}>
                                        🎓 Grado: {course.grado || 'N/A'}
                                    </div>
                                    <div style={styles.courseDetail}>
                                        👥 {course.student_count || 0} estudiantes
                                    </div>
                                </div>

                                <div style={styles.courseFooter}>
                                    <span style={styles.courseAction}>Ver detalles del curso</span>
                                    <div style={styles.statusDot}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={styles.emptyState}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
                        <h3 style={styles.emptyTitle}>No tienes cursos asignados</h3>
                        <p style={styles.emptyDescription}>
                            Contacta al administrador para que te asigne cursos
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}