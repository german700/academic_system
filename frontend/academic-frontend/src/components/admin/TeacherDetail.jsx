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
// ✅ NUEVAS IMPORTACIONES
import EngagementOverview from "./TeacherDetail/EngagementOverview";
import RiskAnalysis from "./TeacherDetail/RiskAnalysis";

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

    // ✅ NUEVO useEffect PARA TRAER EL ENGAGEMENT
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

    if (!docente) return <p className="p-4">Cargando...</p>;

    // 🔎 CONSOLE LOG PARA DEBUGGING
    console.log("Engagement:", engagement);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">
                {`${docente.title || ""} ${docente.first_name} ${docente.middle_name || ""} ${docente.last_name} ${docente.second_last_name || ""}`}
            </h1>

            <PersonalInfo docente={docente} />

            <SubjectList
                subjects={docente.subjects}
                onSelect={(subject) => setSelectedSubject(subject)}
                selected={selectedSubject}
            />
            {selectedSubject && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">
                        Estudiantes en {selectedSubject.name} - Curso {selectedSubject.course}
                    </h3>
                    {cargandoEstudiantes ? (
                        <p>Cargando estudiantes...</p>
                    ) : (
                        <ul className="list-disc pl-6">
                            {students.map((student) => (
                                <li key={student.id}>
                                    <Link
                                        to={`/admin/estudiantes/${student.id}`}
                                        className="text-blue-600 hover:underline"
                                    >
                                        #{student.id} - {student.first_name} {student.last_name}
                                    </Link>
                                </li>
                            ))}
                            {students.length === 0 && <li>No hay estudiantes.</li>}
                        </ul>
                    )}
                </div>
            )}

            {/* ✅ COMPONENTE ACTUALIZADO CON NUEVO ENGAGEMENT */}
            <EngagementOverview
                overview={engagement?.overview}
                narrative={engagement?.narrative}
            />

            <RiskAnalysis teacherId={teacherId} />

        </div>
    );
};

export default TeacherDetail;