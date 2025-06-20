//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\teachers\StudentList.jsx
import React, { useState } from "react";
import { Input } from "../shared/ui/input";
import { Button } from "../shared/ui/button";
import StudentCard from "./StudentCard";
import PrintStudentAnalysis from "./PrintStudentAnalysis";
import { fetchStudentAnalysis } from "../services/docentesService";

export default function StudentList({ students, courseId, subjectId, period, courseName, subjectName }) {
    const [q, setQ] = useState("");
    const [showStudentPrint, setShowStudentPrint] = useState(false);
    const [selectedStudentAnalysis, setSelectedStudentAnalysis] = useState(null);
    const [loadingStudentId, setLoadingStudentId] = useState(null);

    const handlePrintStudent = async (studentId) => {
        setLoadingStudentId(studentId);
        try {
            const data = await fetchStudentAnalysis(courseId, subjectId, studentId, period);
            setSelectedStudentAnalysis(data);
            setShowStudentPrint(true);
        } catch (error) {
            console.error("Error al cargar análisis del estudiante:", error);
        } finally {
            setLoadingStudentId(null);
        }
    };

    const filtered = students.filter(s => {
        // Buscar por nombre completo
        const searchTerm = `${s.first_name} ${s.last_name}`.toLowerCase();
        return searchTerm.includes(q.toLowerCase());
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <Input
                    placeholder="Buscar estudiante..."
                    value={q}
                    onChange={e => setQ(e.target.value)}
                    className="w-1/3"
                />
                <span className="text-sm text-gray-500">
                    {filtered.length} de {students.length} estudiantes
                </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(s => (
                    <div key={s.student_id} className="relative">
                        <StudentCard
                            student={s}
                            courseId={courseId}
                            subjectId={subjectId}
                            period={period}
                            courseName={courseName}
                            subjectName={subjectName}
                        />
                        {/* Botón de impresión */}
                        <div className="mt-2 flex justify-end">
                            <Button
                                onClick={() => handlePrintStudent(s.student_id)}
                                variant="outline"
                                size="sm"
                                disabled={loadingStudentId === s.student_id}
                                className="flex items-center gap-1"
                            >
                                {loadingStudentId === s.student_id ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                                        Cargando...
                                    </>
                                ) : (
                                    <>
                                        🖨️ Imprimir
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {showStudentPrint && selectedStudentAnalysis && (
                <PrintStudentAnalysis
                    analysis={selectedStudentAnalysis}
                    metadata={{
                        courseName,
                        subjectName,
                        period,
                        teacherName: selectedStudentAnalysis.teacherName || "Nombre Docente" // si está disponible
                    }}
                />
            )}
        </div>
    );
}