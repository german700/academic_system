import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCourseStudents } from "../services/docentesService";
import "./teachers_css/TeacherCourses.css";

export default function TeacherCourses() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState("");

  useEffect(() => {
    if (courseId) {
      fetchCourseStudents(courseId)
        .then(setCourseData)
        .catch((err) => {
          console.error("Error fetching course data:", err);
          setError("Error al cargar los datos del curso");
        })
        .finally(() => setLoading(false));
    }
  }, [courseId]);

  // Función para obtener las iniciales del estudiante
  const getStudentInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) return <div className="loading-state">Cargando...</div>;
  if (error) return <div className="error-state">{error}</div>;
  if (!courseData) return <div className="no-data-state">No se encontraron datos del curso</div>;

  return (
    <div className="teacher-courses">
      {/* Header Section */}
      <div className="courses-header">
        <div className="courses-header-info">
          <h1 className="courses-header-title">{courseData.name}</h1>
          <p className="courses-header-subtitle">
            Grado: {courseData.grado?.numero} | Estudiantes: {courseData.students?.length || 0}
          </p>
        </div>
        <button 
          className="back-button" 
          onClick={() => navigate('/teachers/dashboard')}
        >
          ← Volver al Dashboard
        </button>
      </div>

      {/* Course Summary Card */}
      <div className="course-summary-card">
        <div className="course-summary-header">
          <h2 className="course-summary-title">
            📊 Resumen del Curso
          </h2>
        </div>
        <div className="course-summary-grid">
          <div className="course-info-section">
            <h4>📋 Información General</h4>
            <ul className="course-info-list">
              <li className="course-info-item">
                <strong>Nombre:</strong> {courseData.name}
              </li>
              <li className="course-info-item">
                <strong>Grado:</strong> {courseData.grado?.numero}
              </li>
              <li className="course-info-item">
                <strong>Total Estudiantes:</strong> {courseData.students?.length || 0}
              </li>
            </ul>
          </div>
          <div className="course-info-section">
            <h4>📚 Materias</h4>
            <div className="subjects-grid">
              {courseData.subjects?.length > 0 ? (
                courseData.subjects.map((subject, index) => (
                  <div key={index} className="subject-tag">
                    {subject.name}
                  </div>
                ))
              ) : (
                <p className="no-subjects">No hay materias asignadas</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Subject Selection Section */}
      <div className="subject-selection">
        <h3 className="subject-selection-title">
          🎯 Selecciona una materia
        </h3>
        {courseData.subjects?.length > 0 ? (
          <div className="subject-selection-controls">
            <select
              className="subject-select"
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
            >
              <option value="">-- Elige materia --</option>
              {courseData.subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {selectedSubject && (
              <button
                className="grades-button"
                onClick={() =>
                  navigate(
                    `/teachers/courses/${courseId}/subject/${selectedSubject}/grades`
                  )
                }
              >
                📊 Ver Notas
              </button>
            )}
          </div>
        ) : (
          <p className="no-subjects-message">
            Este curso no tiene materias asignadas.
          </p>
        )}
      </div>

      {/* Students Section */}
      <div className="students-section">
        <h3 className="students-section-title">
          👨‍🎓 Estudiantes del curso
        </h3>
        {courseData.students?.length > 0 ? (
          <ul className="students-list">
            {courseData.students
              .slice()
              .sort((a, b) => 
                a.last_name.localeCompare(b.last_name) || 
                a.first_name.localeCompare(b.first_name)
              )
              .map((student) => (
                <li key={student.id} className="student-item">
                  <button
                    className="student-link"
                    onClick={() => navigate(`/perfil-estudiante/${student.id}`)}
                  >
                    <div className="student-avatar">
                      {getStudentInitials(student.first_name, student.last_name)}
                    </div>
                    <div className="student-info">
                      <div className="student-name">
                        {student.first_name} {student.last_name}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
          </ul>
        ) : (
          <p className="no-students">
            No hay estudiantes asignados a este curso.
          </p>
        )}
      </div>
    </div>
  );
}