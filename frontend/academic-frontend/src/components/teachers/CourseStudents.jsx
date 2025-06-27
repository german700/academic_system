//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\teachers\CourseStudents.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCourseStudents } from "../services/docentesService";
import { Button } from "../shared/ui/button";
import { ArrowLeft, Download, BarChart3, Users } from "lucide-react";

export default function CourseStudents() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [courseName, setCourseName] = useState("");
    const [gradoNumero, setGradoNumero] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState("");

    useEffect(() => {
        fetchCourseStudents(courseId)
            .then(({ name, grado, students, subjects }) => {
                setCourseName(name);
                setGradoNumero(grado.numero);
                setStudents(students);
                setSubjects(subjects);
                if (subjects.length === 1) setSelectedSubject(subjects[0].id);
            })
            .catch((err) => {
                console.error("Error fetching students:", err);
                setError("Error al cargar los datos del curso");
            })
            .finally(() => setLoading(false));
    }, [courseId]);

    // Función para manejar la navegación a notas
    const handleNavigateToGrades = () => {
        if (!selectedSubject) {
            return alert("Selecciona materia antes de ver las notas");
        }
        navigate(
            `/teachers/courses/${courseId}/subject/${selectedSubject}/grades`
        );
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Cargando estudiantes...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <p className="text-red-600 font-semibold mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()} variant="outline">
                        Reintentar
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/teachers/courses/${courseId}`)}
                                className="text-gray-600 hover:text-gray-900 hover:bg-white/60 transition-all duration-200"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver al Curso
                            </Button>
                            <div className="h-6 w-px bg-gray-300"></div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                    <div className="p-2 bg-blue-600 rounded-lg">
                                        <Users className="h-6 w-6 text-white" />
                                    </div>
                                    {courseName}
                                </h1>
                                <p className="text-gray-600 mt-1 text-lg">
                                    Grado: {gradoNumero} • {students.length} estudiantes
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => window.open(`http://localhost:8000/api/academic/teacher/course/${courseId}/planilla-pdf/`, "_blank")}
                                className="bg-green-600 hover:bg-green-700 text-white border-green-600 shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Imprimir Planilla
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleNavigateToGrades}
                                className="bg-orange-600 hover:bg-orange-700 text-white border-orange-600 shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                <BarChart3 className="h-4 w-4 mr-2" />
                                Ver Notas
                            </Button>
                        </div>
                    </div>

                    {/* Selector de Materia - Añadido */}
                    <div className="mb-6">
                        <label htmlFor="subject-select" className="block text-sm font-medium text-gray-700 mb-2">
                            Seleccionar Materia:
                        </label>
                        <select
                            id="subject-select"
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <select
                                id="subject-select"
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">-- Selecciona una materia --</option>
                                {subjects.map((subject) => (
                                    <option key={subject.id} value={subject.id}>
                                        {subject.name}
                                    </option>
                                ))}
                            </select>
                            {/* Añade más materias según tu sistema */}
                        </select>
                    </div>
                </div>

                {/* Students Table */}
                <div className="bg-white/80 backdrop-blur rounded-xl shadow-lg border-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                    <th className="px-6 py-4 text-left font-semibold">Apellidos</th>
                                    <th className="px-6 py-4 text-left font-semibold">Nombres</th>
                                    <th className="px-6 py-4 text-left font-semibold">ID Estudiante</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {students
                                    .sort((a, b) =>
                                        a.last_name.localeCompare(b.last_name) ||
                                        a.first_name.localeCompare(b.first_name)
                                    )
                                    .map((student, index) => (
                                        <tr
                                            key={student.id}
                                            className={`hover:bg-blue-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'
                                                }`}
                                        >
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {student.last_name}
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">
                                                {student.first_name}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 font-mono">
                                                {student.student_id || 'N/A'}
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>

                    {students.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">👥</div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                No hay estudiantes registrados
                            </h3>
                            <p className="text-gray-500">
                                Este curso aún no tiene estudiantes asignados
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}