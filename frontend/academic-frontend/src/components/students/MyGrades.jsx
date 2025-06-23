// C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\students\MyGrades.jsx
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../shared/ui/card";
import { fetchMisNotasPorMateria } from "../services/estudiantesService";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const MyGrades = () => {
  const [gradesData, setGradesData] = useState({ assignments: [], grades: [] });
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [currentPeriod, setCurrentPeriod] = useState(null);
  const [cursoId, setCursoId] = useState(null);
  const [materias, setMaterias] = useState([]);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar perfil y periodo actual al inicializar
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        // Cargar periodo actual
        const periodoRes = await fetch('http://localhost:8000/api/academic/periodo-actual/', {
          headers: getAuthHeaders()
        });
        const period = await periodoRes.json();
        setCurrentPeriod(period.number);
        setSelectedPeriod(period.number);

        // Cargar perfil del estudiante
        const perfilRes = await fetch("http://localhost:8000/api/academic/students/11/profile_detailed/", {
          headers: getAuthHeaders(),
        });
        const perfil = await perfilRes.json();

        if (perfil.curso?.id) {
          setCursoId(perfil.curso.id);
          setMaterias(perfil.materias || []);
          if (perfil.materias && perfil.materias.length > 0) {
            setMateriaSeleccionada(perfil.materias[0].id);
          }
        }

      } catch (err) {
        console.error('Error cargando datos iniciales:', err);
        setError('Error al cargar los datos iniciales');
      }
    };

    cargarDatosIniciales();
  }, []);

  // Cargar notas cuando cambie curso, materia o periodo
  useEffect(() => {
    const cargarNotas = async () => {
      if (cursoId && materiaSeleccionada && selectedPeriod) {
        setLoading(true);
        setError(null);
        try {
          const data = await fetchMisNotasPorMateria(cursoId, materiaSeleccionada, selectedPeriod);
          setGradesData(data);
        } catch (error) {
          console.error("Error cargando notas:", error);
          setError('Error al cargar las calificaciones');
          setGradesData({ assignments: [], grades: [] });
        } finally {
          setLoading(false);
        }
      }
    };

    cargarNotas();
  }, [cursoId, materiaSeleccionada, selectedPeriod]);

  // Obtener la materia seleccionada para mostrar su nombre
  const materiaActual = materias.find(m => m.id === materiaSeleccionada);

  // Calcular promedio de notas
  const calcularPromedio = () => {
    if (!gradesData.grades || gradesData.grades.length === 0) return 0;
    const suma = gradesData.grades.reduce((acc, grade) => acc + (grade.score || 0), 0);
    return (suma / gradesData.grades.length).toFixed(2);
  };

  return (
    <div className="p-6 space-y-4">
      {/* Header con controles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Mis Calificaciones</h1>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Selector de materia */}
          <div className="flex items-center gap-2">
            <label className="font-medium">Materia:</label>
            <select
              className="border rounded px-2 py-1 min-w-[150px]"
              value={materiaSeleccionada || ""}
              onChange={(e) => setMateriaSeleccionada(parseInt(e.target.value))}
              disabled={loading || materias.length === 0}
            >
              <option value="">Seleccionar materia</option>
              {materias.map((materia) => (
                <option key={materia.id} value={materia.id}>
                  {materia.name}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de periodo */}
          <div className="flex items-center gap-2">
            <label className="font-medium">Periodo:</label>
            <select
              className="border rounded px-2 py-1"
              value={selectedPeriod || ""}
              onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
              disabled={loading}
            >
              {[1, 2, 3, 4].map((num) => (
                <option key={num} value={num}>
                  Periodo {num} {num === currentPeriod ? "(Actual)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Mostrar errores */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Mostrar loading */}
      {loading && (
        <div className="text-center py-4">
          <p>Cargando calificaciones...</p>
        </div>
      )}

      {/* Contenido principal */}
      {!loading && !error && materiaSeleccionada && (
        <>
          {gradesData.assignments.length === 0 ? (
            <p className="text-gray-600">
              No hay actividades registradas para {materiaActual?.name} en el periodo {selectedPeriod}.
            </p>
          ) : (
            <Card>
              <CardContent>
                <div className="mb-4">
                  <h2 className="text-xl font-semibold mb-2">
                    {materiaActual?.name} - Periodo {selectedPeriod}
                  </h2>
                  <p className="text-lg">
                    <span className="font-medium">Promedio: </span>
                    <strong className="text-blue-600">{calcularPromedio()}</strong>
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border text-sm text-left">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border px-3 py-2">Actividad</th>
                        <th className="border px-3 py-2">Tipo</th>
                        <th className="border px-3 py-2">Fecha Límite</th>
                        <th className="border px-3 py-2">Nota</th>
                        <th className="border px-3 py-2">Entrega Tardía</th>
                        <th className="border px-3 py-2">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gradesData.assignments.map((assignment) => {
                        const nota = gradesData.grades.find(g => g.assignment_id === assignment.id);
                        const fechaLimite = new Date(assignment.due_date).toLocaleDateString();

                        return (
                          <tr key={assignment.id} className="hover:bg-gray-50">
                            <td className="border px-3 py-2 font-medium">
                              {assignment.name}
                            </td>
                            <td className="border px-3 py-2">
                              {assignment.assignment_type || 'N/A'}
                            </td>
                            <td className="border px-3 py-2">
                              {fechaLimite}
                            </td>
                            <td className="border px-3 py-2">
                              {nota ? (
                                <span className={`font-bold ${nota.score >= 7 ? 'text-green-600' :
                                    nota.score >= 5 ? 'text-yellow-600' : 'text-red-600'
                                  }`}>
                                  {nota.score}
                                </span>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className="border px-3 py-2">
                              {nota?.late_submission ? (
                                <span className="text-red-600">Sí</span>
                              ) : nota ? (
                                <span className="text-green-600">No</span>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className="border px-3 py-2">
                              {nota ? (
                                <span className="text-green-600 font-medium">Calificada</span>
                              ) : (
                                <span className="text-gray-500">Pendiente</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mostrar comentarios si existen */}
                {gradesData.grades.some(g => g.comments) && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Comentarios:</h3>
                    {gradesData.grades
                      .filter(g => g.comments)
                      .map((grade) => {
                        const assignment = gradesData.assignments.find(a => a.id === grade.assignment_id);
                        return (
                          <div key={grade.id} className="mb-2 p-2 bg-gray-50 rounded">
                            <p className="font-medium text-sm">{assignment?.name}:</p>
                            <p className="text-sm text-gray-700">{grade.comments}</p>
                          </div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Mensaje cuando no hay materia seleccionada */}
      {!loading && !materiaSeleccionada && materias.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Selecciona una materia para ver las calificaciones</p>
        </div>
      )}

      {/* Mensaje cuando no hay materias */}
      {!loading && materias.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No tienes materias asignadas en tu curso actual</p>
        </div>
      )}
    </div>
  );
};

export default MyGrades;