import React from "react";
import { Card, CardHeader, CardContent } from "../shared/ui/card";
import { useNavigate } from "react-router-dom";
import { Badge } from "../shared/ui/badge";

export default function StudentCard({ student, courseId, subjectId, period, courseName, subjectName }) {
    const navigate = useNavigate();

    // Usar nombre completo - eliminamos el fallback a email
    const fullName = student.first_name && student.last_name
        ? `${student.first_name} ${student.last_name}`
        : (student.student_email?.split("@")[0] || "Estudiante sin nombre");

    // ✅ Validación para promedio_general
    const avg = student.promedio_general !== null && student.promedio_general !== undefined
        ? student.promedio_general.toFixed(2)
        : "Sin datos";

    // ✅ Validación para prediccion_riesgo
    const riskPct = student.prediccion_riesgo?.riesgo !== null && student.prediccion_riesgo?.riesgo !== undefined
        ? (student.prediccion_riesgo.riesgo * 100).toFixed(0)
        : "N/A";

    const handleClick = () => {
        // Solo navegar si el estudiante tiene datos
        if (student.promedio_general !== null && student.promedio_general !== undefined) {
            navigate(
                `/teachers/courses/${courseId}/subject/${subjectId}/students/${student.student_id}/analysis?period=${period}`
            );
        }
    };

    // ✅ Determinar si el estudiante tiene datos
    const hasData = student.promedio_general !== null && student.promedio_general !== undefined;

    return (
        <Card
            onClick={handleClick}
            className={`transition ${hasData ? 'cursor-pointer hover:shadow-lg' : 'cursor-not-allowed opacity-75'}`}
        >
            <CardHeader>
                <h3 className="font-semibold">{fullName}</h3>
                {!hasData && (
                    <Badge variant="outline" className="w-fit">
                        Sin evaluaciones
                    </Badge>
                )}
            </CardHeader>
            <CardContent className="space-y-2">
                <div>Promedio: <strong>{avg}</strong></div>
                <div className="flex items-center gap-1">
                    <span>Riesgo IA:</span>
                    <span>
                        <Badge variant={
                            riskPct === "N/A" ? "outline" : 
                            (parseInt(riskPct) > 60 ? "destructive" : "default")
                        }>
                            {riskPct === "N/A" ? "N/A" : `${riskPct}%`}
                        </Badge>
                    </span>
                </div>
                <div>
                    Entregas tardías: {student.entregas_tardias || 0}/{student.total_evaluaciones || 0}
                </div>
                
                {/* ✅ Disclaimer para estudiantes sin datos */}
                {!hasData && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-xs text-yellow-700">
                            ⚠️ Aún no hay suficientes notas para generar estadísticas
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}