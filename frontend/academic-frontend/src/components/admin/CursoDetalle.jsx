import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obtenerCurso } from "../services/cursosService";
import { obtenerMateriasPorCurso, asignarDocenteAMateria } from "../services/materiasService";
import { obtenerDocentes } from "../services/docentesService";

const CursoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [curso, setCurso] = useState(null);
  const [materias, setMaterias] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [asignaciones, setAsignaciones] = useState({});
  const [modoEdicion, setModoEdicion] = useState({}); // Estado para manejar la edición por materia

  useEffect(() => {
    cargarCurso();
    cargarMaterias();
    cargarDocentes();
  }, []);

  // Cargar la información del curso, incluyendo estudiantes y materias
  const cargarCurso = async () => {
    try {
      const data = await obtenerCurso(id);
      console.log("Curso cargado:", data);
      setCurso(data);
    } catch (error) {
      console.error("Error al cargar curso:", error);
    }
  };

  // Cargar las materias asignadas al curso
  const cargarMaterias = async () => {
    try {
      const data = await obtenerMateriasPorCurso(id);
      console.log("Materias cargadas:", data);
      setMaterias(data);
    } catch (error) {
      console.error("Error al cargar materias:", error);
    }
  };

  // Cargar la lista de docentes
  const cargarDocentes = async () => {
    try {
      const data = await obtenerDocentes();
      console.log("Docentes cargados:", data);
      setDocentes(data);
    } catch (error) {
      console.error("Error al cargar docentes:", error);
    }
  };

  // Manejar la selección de docente en el combo box
  const manejarCambioDocente = (e, materiaId) => {
    setAsignaciones({ ...asignaciones, [materiaId]: e.target.value });
  };

  // Guardar la asignación de docente a una materia
  const manejarAsignacionDocente = async (materia) => {
    const docenteId = asignaciones[materia.id];
    if (!docenteId) return;
  
    try {
      await asignarDocenteAMateria(materia.id, docenteId); // Asignar docente a la materia
      console.log(`Docente ${docenteId} asignado a ${materia.subject.name}`);
  
      // Refrescar la información del curso y las materias para actualizar la UI
      await cargarCurso();  
      await cargarMaterias();
    } catch (error) {
      console.error("Error al asignar docente:", error);
    }
  };

  if (!curso) return <div className="p-6 text-center">Cargando curso...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{curso.name} - {curso.grado?.numero}° {curso.grado?.categoria}</h1>
      <button onClick={() => navigate(-1)} className="p-2 bg-gray-500 text-white mb-4">Volver</button>

      {/* Tabla de Estudiantes */}
      <h2 className="text-xl font-bold mt-4">Estudiantes</h2>
      <table className="min-w-full bg-white border mt-2">
        <thead>
          <tr>
            <th className="border px-4 py-2">Código</th>
            <th className="border px-4 py-2">Nombre</th>
          </tr>
        </thead>
        <tbody>
          {curso.students?.length > 0 ? (
            curso.students.map((est) => (
              <tr key={est.id}>
                <td className="border px-4 py-2">{est.student_id}</td>
                <td className="border px-4 py-2">{est.first_name} {est.last_name}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2" className="text-center p-4">No hay estudiantes en este curso.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Tabla de Materias */}
      <h2 className="text-xl font-bold mt-6">Materias</h2>
      <table className="min-w-full bg-white border mt-2">
        <thead>
          <tr>
            <th className="border px-4 py-2">Materia</th>
            <th className="border px-4 py-2">Docente</th>
            <th className="border px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {curso.course_subjects?.length > 0 ? (
            curso.course_subjects.map((materia) => (
              <tr key={materia.id}>
                <td className="border px-4 py-2">{materia.subject.name}</td>
                <td className="border px-4 py-2">
                  {materia.teacher ? `${materia.teacher.first_name} ${materia.teacher.last_name}` : "Sin docente"}
                </td>
                <td className="border px-4 py-2 flex">
                  {modoEdicion[materia.id] ? (
                    <>
                      <select
                        className="border p-2 mr-2"
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
                        className="p-2 bg-green-500 text-white"
                      >
                        Guardar
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setModoEdicion({ ...modoEdicion, [materia.id]: true })}
                      className="p-2 bg-blue-500 text-white"
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