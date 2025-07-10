// C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\admin\CursoDetalle.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obtenerCurso } from "../services/cursosService";
import { obtenerMateriasPorCurso, asignarDocenteAMateria } from "../services/materiasService";
import { obtenerDocentes } from "../services/docentesService";
import "./admin_css/CursoDetalle.css";

const CursoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [curso, setCurso] = useState(null);
  const [materias, setMaterias] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [asignaciones, setAsignaciones] = useState({});
  const [modoEdicion, setModoEdicion] = useState({});

  useEffect(() => {
    cargarCurso();
    cargarMaterias();
    cargarDocentes();
  }, []);

  const cargarCurso = async () => {
    try {
      const data = await obtenerCurso(id);
      setCurso(data);
    } catch (error) {
      console.error("Error al cargar curso:", error);
    }
  };

  const cargarMaterias = async () => {
    try {
      const data = await obtenerMateriasPorCurso(id);
      setMaterias(data);
    } catch (error) {
      console.error("Error al cargar materias:", error);
    }
  };

  const cargarDocentes = async () => {
    try {
      const data = await obtenerDocentes();
      setDocentes(data);
    } catch (error) {
      console.error("Error al cargar docentes:", error);
    }
  };

  const manejarCambioDocente = (e, materiaId) => {
    setAsignaciones({ ...asignaciones, [materiaId]: e.target.value });
  };

  const manejarAsignacionDocente = async (materia) => {
    const docenteId = asignaciones[materia.id];
    if (!docenteId) return;

    try {
      await asignarDocenteAMateria(materia.id, docenteId);
      await cargarCurso();
      await cargarMaterias();
    } catch (error) {
      console.error("Error al asignar docente:", error);
    }
  };

  if (!curso) return <div className="p-6 text-center">Cargando curso...</div>;

  return (
    <div className="cursodetalle-container">
      <h1 className="cursodetalle-title">
        {curso.name} - {curso.grado?.numero}° {curso.grado?.categoria}
      </h1>
      <button onClick={() => navigate(-1)} className="cursodetalle-btn cursodetalle-btn-volver mb-4">
        Volver
      </button>

      <h2 className="cursodetalle-subtitle">Estudiantes</h2>
      <table className="cursodetalle-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
          </tr>
        </thead>
        <tbody>
          {curso.students?.length > 0 ? (
            curso.students.map((est) => (
              <tr key={est.id}>
                <td>{est.student_id}</td>
                <td>{est.first_name} {est.last_name}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2" className="text-center p-4">No hay estudiantes en este curso.</td>
            </tr>
          )}
        </tbody>
      </table>

      <h2 className="cursodetalle-subtitle">Materias</h2>
      <table className="cursodetalle-table">
        <thead>
          <tr>
            <th>Materia</th>
            <th>Docente</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {curso.course_subjects?.length > 0 ? (
            curso.course_subjects.map((materia) => (
              <tr key={materia.id}>
                <td>{materia.subject.name}</td>
                <td>
                  {materia.teacher ? `${materia.teacher.first_name} ${materia.teacher.last_name}` : "Sin docente"}
                </td>
                <td>
                  {modoEdicion[materia.id] ? (
                    <>
                      <select
                        className="cursodetalle-select"
                        onChange={(e) => manejarCambioDocente(e, materia.id)}
                      >
                        <option value="">Seleccionar docente</option>
                        {docentes.map((doc) => (
                          <option key={doc.id} value={doc.id}>
                            {doc.first_name} {doc.last_name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => manejarAsignacionDocente(materia)}
                        className="cursodetalle-btn cursodetalle-btn-guardar"
                      >
                        Guardar
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setModoEdicion({ ...modoEdicion, [materia.id]: true })}
                      className="cursodetalle-btn cursodetalle-btn-editar"
                    >
                      Editar
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center p-4">No hay materias asignadas.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CursoDetalle;
