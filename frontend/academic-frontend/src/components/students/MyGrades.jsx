// C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\students\MyGrades.jsx
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../shared/ui/card";
import { fetchMisNotasPorMateria } from "../services/estudiantesService";
import "./students_css/MyGrades.css";

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

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        const periodoRes = await fetch("http://localhost:8000/api/academic/periodo-actual/", {
          headers: getAuthHeaders(),
        });
        const period = await periodoRes.json();
        setCurrentPeriod(period.number);
        setSelectedPeriod(period.number);

        const perfilRes = await fetch(
          "http://localhost:8000/api/academic/students/11/profile_detailed/",
          {
            headers: getAuthHeaders(),
          }
        );
        const perfil = await perfilRes.json();

        if (perfil.curso?.id) {
          setCursoId(perfil.curso.id);
          setMaterias(perfil.materias || []);
          if (perfil.materias?.length > 0) {
            setMateriaSeleccionada(perfil.materias[0].id);
          }
        }
      } catch (err) {
        console.error("Error cargando datos iniciales:", err);
        setError("Error al cargar los datos iniciales");
      }
    };

    cargarDatosIniciales();
  }, []);

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
          setError("Error al cargar las calificaciones");
          setGradesData({ assignments: [], grades: [] });
        } finally {
          setLoading(false);
        }
      }
    };

    cargarNotas();
  }, [cursoId, materiaSeleccionada, selectedPeriod]);

  const materiaActual = materias.find((m) => m.id === materiaSeleccionada);

  const calcularPromedio = () => {
    if (!gradesData.grades || gradesData.grades.length === 0) return 0;
    const suma = gradesData.grades.reduce((acc, grade) => acc + (grade.score || 0), 0);
    return (suma / gradesData.grades.length).toFixed(2);
  };

  return (
    <div className="mygrades-container">
      <div className="mygrades-header">
        <h1 className="text-2xl font-bold">Mis Calificaciones</h1>

        <div className="select-group">
          <div className="select-group">
            <label className="font-medium">Materia:</label>
            <select
              className="select-input"
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

          <div className="select-group">
            <label className="font-medium">Periodo:</label>
            <select
              className="select-input"
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

      {error && <div className="error-message">{error}</div>}

      {loading && <div className="loading-message">Cargando calificaciones...</div>}

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
                  <table className="table-grades">
                    <thead>
                      <tr>
                        <th>Actividad</th>
                        <th>Tipo</th>
                        <th>Fecha Límite</th>
                        <th>Nota</th>
                        <th>Entrega Tardía</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gradesData.assignments.map((assignment) => {
                        const nota = gradesData.grades.find((g) => g.assignment_id === assignment.id);
                        const fechaLimite = new Date(assignment.due_date).toLocaleDateString();

                        return (
                          <tr key={assignment.id} className="table-row">
                            <td>{assignment.name}</td>
                            <td>{assignment.assignment_type || "N/A"}</td>
                            <td>{fechaLimite}</td>
                            <td>
                              {nota ? (
                                <span
                                  className={
                                    nota.score >= 7
                                      ? "grade-green"
                                      : nota.score >= 5
                                      ? "grade-yellow"
                                      : "grade-red"
                                  }
                                >
                                  {nota.score}
                                </span>
                              ) : (
                                <span className="grade-pending">—</span>
                              )}
                            </td>
                            <td>
                              {nota?.late_submission ? (
                                <span className="grade-red">Sí</span>
                              ) : nota ? (
                                <span className="grade-green">No</span>
                              ) : (
                                <span className="grade-pending">—</span>
                              )}
                            </td>
                            <td>
                              {nota ? (
                                <span className="grade-green grade-status">Calificada</span>
                              ) : (
                                <span className="grade-pending grade-status">Pendiente</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {gradesData.grades.some((g) => g.comments) && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Comentarios:</h3>
                    {gradesData.grades
                      .filter((g) => g.comments)
                      .map((grade) => {
                        const assignment = gradesData.assignments.find((a) => a.id === grade.assignment_id);
                        return (
                          <div key={grade.id} className="comment-box">
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

      {!loading && !materiaSeleccionada && materias.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Selecciona una materia para ver las calificaciones</p>
        </div>
      )}

      {!loading && materias.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No tienes materias asignadas en tu curso actual</p>
        </div>
      )}
    </div>
  );
};

export default MyGrades;
