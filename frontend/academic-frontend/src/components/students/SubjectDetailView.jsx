import React, { useEffect, useState } from "react";
import { getGradesForStudentSubject } from "../services/estudiantesService";
import { Calendar, User, BookOpen, ChevronLeftCircle, TrendingUp, Calculator } from "lucide-react";

const SubjectDetailView = ({ subject, course, onBack, studentId }) => {
  const [gradesData, setGradesData] = useState({ grades: [], teacher: null }); // Agregado teacher
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGrades = async () => {
      setLoading(true);
      try {
        const data = await getGradesForStudentSubject(studentId, course.id, subject.id, period);
        setGradesData(data);
        setError("");
      } catch (err) {
        setError("Error al cargar las calificaciones.");
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [subject, course, period, studentId]);

  const getColor = (nota) => {
    if (nota >= 4.5) return "text-green-600";
    if (nota >= 3.5) return "text-blue-600";
    if (nota >= 3.0) return "text-yellow-600";
    return "text-red-600";
  };

  const getBackgroundColor = (nota) => {
    if (nota >= 4.5) return "bg-green-50";
    if (nota >= 3.5) return "bg-blue-50";
    if (nota >= 3.0) return "bg-yellow-50";
    return "bg-red-50";
  };

  // Calcular la definitiva del periodo
  const calcularDefinitiva = () => {
    if (!gradesData.grades) return null;
    
    const notasConPeso = gradesData.grades.map(item => {
      const nota = item.score;
      const peso = item.weight || 1;
      return { nota, peso };
    });

    const notasValidas = notasConPeso.filter(item => item.nota !== null);
    
    if (notasValidas.length === 0) return null;

    const sumaNotasPonderadas = notasValidas.reduce((sum, item) => sum + (item.nota * item.peso), 0);
    const sumaPesos = notasValidas.reduce((sum, item) => sum + item.peso, 0);
    
    return sumaPesos > 0 ? sumaNotasPonderadas / sumaPesos : null;
  };

  // Obtener estadísticas básicas
  const obtenerEstadisticas = () => {
    const totalActividades = gradesData.grades.length;
    const actividadesCalificadas = gradesData.grades.filter(g => g.score !== null).length;
    const actividadesPendientes = totalActividades - actividadesCalificadas;
    const actividadesTardias = gradesData.grades.filter(g => g.late_submission).length;
    
    return {
      totalActividades,
      actividadesCalificadas,
      actividadesPendientes,
      actividadesTardias,
      porcentajeCompletado: totalActividades > 0 ? Math.round((actividadesCalificadas / totalActividades) * 100) : 0
    };
  };

  const definitiva = calcularDefinitiva();
  const estadisticas = obtenerEstadisticas();

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{subject.nombre}</h2>
          <p className="text-sm text-gray-500 flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Curso: {course.nombre} ({course.grado}° grado)
          </p>
          {/* ✅ INFORMACIÓN DEL DOCENTE CON HIPERVÍNCULO */}
          {gradesData.teacher && (
            <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
              <User className="w-4 h-4" /> 
              Docente:&nbsp;
              <a 
                href={`/admin/docentes/${gradesData.teacher.id}`} 
                className="text-blue-600 hover:underline hover:text-blue-800 transition-colors"
                title={`Ver perfil de ${gradesData.teacher.nombre}`}
              >
                {gradesData.teacher.nombre} ({gradesData.teacher.codigo})
              </a>
            </p>
          )}
        </div>
        <button onClick={onBack} className="text-blue-600 hover:underline flex items-center gap-1">
          <ChevronLeftCircle className="w-5 h-5" /> Volver a materias
        </button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <label className="font-medium">Periodo:</label>
        <select
          value={period}
          onChange={(e) => setPeriod(Number(e.target.value))}
          className="border rounded px-2 py-1"
        >
          {[1, 2, 3, 4].map(p => (
            <option key={p} value={p}>Periodo {p}</option>
          ))}
        </select>
      </div>

      {/* Tarjeta de Definitiva y Estadísticas */}
      {!loading && gradesData.grades.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Definitiva */}
          <div className={`p-4 rounded-lg border-2 ${definitiva !== null ? getBackgroundColor(definitiva) : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-800">Definitiva del Periodo</h3>
            </div>
            <div className="text-center">
              {definitiva !== null ? (
                <>
                  <div className={`text-3xl font-bold ${getColor(definitiva)}`}>
                    {definitiva.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {definitiva >= 4.5 ? 'Excelente' : 
                     definitiva >= 3.5 ? 'Bueno' : 
                     definitiva >= 3.0 ? 'Aceptable' : 'Necesita Mejora'}
                  </div>
                </>
              ) : (
                <div className="text-gray-500">
                  <div className="text-2xl">—</div>
                  <div className="text-sm">Sin calificaciones</div>
                </div>
              )}
            </div>
          </div>

          {/* Estadísticas */}
          <div className="p-4 rounded-lg bg-blue-50 border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-800">Estadísticas</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total actividades:</span>
                <span className="font-medium">{estadisticas.totalActividades}</span>
              </div>
              <div className="flex justify-between">
                <span>Calificadas:</span>
                <span className="font-medium text-green-600">{estadisticas.actividadesCalificadas}</span>
              </div>
              <div className="flex justify-between">
                <span>Pendientes:</span>
                <span className="font-medium text-orange-600">{estadisticas.actividadesPendientes}</span>
              </div>
              <div className="flex justify-between">
                <span>Entregas tardías:</span>
                <span className="font-medium text-red-600">{estadisticas.actividadesTardias}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span>Progreso:</span>
                <span className="font-medium text-blue-600">{estadisticas.porcentajeCompletado}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Cargando...</span>
        </div>
      ) : gradesData.grades.length === 0 ? (
        <div className="text-center py-8">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">No hay actividades registradas para este periodo.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="border-b px-4 py-3 text-left font-medium text-gray-700">Actividad</th>
                <th className="border-b px-4 py-3 text-left font-medium text-gray-700">Tipo</th>
                <th className="border-b px-4 py-3 text-left font-medium text-gray-700">Peso</th>
                <th className="border-b px-4 py-3 text-left font-medium text-gray-700">Fecha</th>
                <th className="border-b px-4 py-3 text-center font-medium text-gray-700">Nota</th>
                <th className="border-b px-4 py-3 text-center font-medium text-gray-700">Tardía</th>
                <th className="border-b px-4 py-3 text-center font-medium text-gray-700">Estado</th>
              </tr>
            </thead>
            <tbody>
              {gradesData.grades.map((a, index) => {
                const nota = a.score;
                const fecha = new Date(a.due_date).toLocaleDateString();
                const tardia = a.late_submission;

                return (
                  <tr key={a.assignment_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border-b px-4 py-3">
                      <div className="font-medium text-gray-900">{a.assignment_name}</div>
                      {a.description && (
                        <div className="text-xs text-gray-500 mt-1">{a.description}</div>
                      )}
                    </td>
                    <td className="border-b px-4 py-3 text-gray-600">
                      {a.assignment_type || '—'}
                    </td>
                    <td className="border-b px-4 py-3 text-gray-600">
                      {((a.weight || 1) * 100).toFixed(0)}%
                    </td>
                    <td className="border-b px-4 py-3 text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {fecha}
                      </div>
                    </td>
                    <td className="border-b px-4 py-3 text-center">
                      <span className={`font-bold text-lg ${nota !== null ? getColor(nota) : 'text-gray-400'}`}>
                        {nota !== null ? nota.toFixed(1) : '—'}
                      </span>
                    </td>
                    <td className="border-b px-4 py-3 text-center">
                      {nota !== null ? (
                        tardia ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Sí
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            No
                          </span>
                        )
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="border-b px-4 py-3 text-center">
                      {nota !== null ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Calificada
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pendiente
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SubjectDetailView;