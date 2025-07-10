//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\admin\TeacherDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    obtenerDocentePorId,
    fetchCourseStudentsByTeacherId, 
    obtenerGrados,
    obtenerResumenEngagementDocente, 
} from "../services/docentesService";
import PersonalInfo from "./TeacherDetail/PersonalInfo";
import SubjectList from "./TeacherDetail/SubjectList";
import EngagementOverview from "./TeacherDetail/EngagementOverview";
import RiskAnalysis from "./TeacherDetail/RiskAnalysis";
import "./admin_css/TeacherDetail.css";

const TeacherDetail = () => {
    const { teacherId } = useParams();
    const [docente, setDocente] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [students, setStudents] = useState([]);
    const [periodo, setPeriodo] = useState("1");
    const [cargandoEstudiantes, setCargandoEstudiantes] = useState(false);
    const [engagement, setEngagement] = useState(null);

    useEffect(() => {
        const fetchDetalle = async () => {
            try {
                const data = await obtenerDocentePorId(teacherId);
                setDocente(data);
            } catch (error) {
                console.error("Error al obtener detalle del docente:", error);
            }
        };
        fetchDetalle();
    }, [teacherId]);

    useEffect(() => {
        const fetchEngagement = async () => {
            try {
                const data = await obtenerResumenEngagementDocente(teacherId);
                setEngagement(data);
            } catch (err) {
                console.error("Error al cargar resumen de compromiso:", err);
            }
        };
        fetchEngagement();
    }, [teacherId]);

    useEffect(() => {
        const fetchEstudiantes = async () => {
            if (!selectedSubject || !selectedSubject.course_id) return;
            setCargandoEstudiantes(true);
            try {
                const estudiantes = await fetchCourseStudentsByTeacherId(teacherId, selectedSubject.course_id);
                setStudents(estudiantes?.students || []);
            } catch (error) {
                console.error("Error al obtener estudiantes:", error);
                setStudents([]);
            } finally {
                setCargandoEstudiantes(false);
            }
        };
        fetchEstudiantes();
    }, [selectedSubject, periodo, teacherId]);

    if (!docente) return <p className="loading-text">Cargando...</p>;

    return (
        <div className="teacher-detail-container">
            <h1 className="teacher-name">
                {`${docente.title || ""} ${docente.first_name} ${docente.middle_name || ""} ${docente.last_name} ${docente.second_last_name || ""}`}
            </h1>

            <div className="card-section">
                <PersonalInfo docente={docente} />
            </div>

            <div className="card-section">
                <SubjectList
                    subjects={docente.subjects}
                    onSelect={(subject) => setSelectedSubject(subject)}
                    selected={selectedSubject}
                />
            </div>

            {selectedSubject && (
                <div className="card-section mt-6">
                    <div className="section-header">
                        <h3 className="section-heading mb-2">
                            Estudiantes en {selectedSubject.name} - Curso {selectedSubject.course}
                        </h3>
                        
                        <div className="select-group">
                            <label className="select-label" htmlFor="periodo-select">
                                Período
                            </label>
                            <div className="select-container compact">
                                <select
                                    id="periodo-select"
                                    className="custom-select"
                                    value={periodo}
                                    onChange={(e) => setPeriodo(e.target.value)}
                                >
                                    <option value="1">Primer Período</option>
                                    <option value="2">Segundo Período</option>
                                    <option value="3">Tercer Período</option>
                                    <option value="4">Cuarto Período</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {cargandoEstudiantes ? (
                        <p className="loading-text">Cargando estudiantes...</p>
                    ) : (
                        <ul className="students-list">
                            {students.map((student) => (
                                <li key={student.id}>
                                    <Link
                                        to={`/admin/estudiantes/${student.id}`}
                                        className="student-link"
                                    >
                                        #{student.id} - {student.first_name} {student.last_name}
                                    </Link>
                                </li>
                            ))}
                            {students.length === 0 && <li className="empty-state">No hay estudiantes.</li>}
                        </ul>
                    )}
                </div>
            )}

            <div className="analysis-section">
                <EngagementOverview
                    className="card-section"
                    overview={engagement?.overview}
                    narrative={engagement?.narrative}
                />

                <RiskAnalysis 
                    className="card-section"
                    teacherId={teacherId} 
                />
            </div>
        </div>
    );
};

export default TeacherDetail;