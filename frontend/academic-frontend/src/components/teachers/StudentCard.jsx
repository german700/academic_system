//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\teachers\StudentCard.jsx
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

    const avg = student.promedio_general.toFixed(2);
    const riskPct = (student.prediccion_riesgo.riesgo * 100).toFixed(0);

    const handleClick = () => {
        // Usar la nueva ruta más específica
        navigate(
            `/teachers/courses/${courseId}/subject/${subjectId}/students/${student.student_id}/analysis?period=${period}`
        );
    };

    return (
        <Card
            onClick={handleClick}
            className="cursor-pointer hover:shadow-lg transition"
        >
            <CardHeader>
                <h3 className="font-semibold">{fullName}</h3>
            </CardHeader>
            <CardContent className="space-y-2">
                <div>Promedio: <strong>{avg}</strong></div>
                <div className="flex items-center gap-1">
                    <span>Riesgo IA:</span>
                    <span>
                        <Badge variant={riskPct > 60 ? "destructive" : "default"}>
                            {riskPct}%
                        </Badge>
                    </span>
                </div>
                <div>Entregas tardías: {student.entregas_tardias}/{student.total_evaluaciones}</div>
            </CardContent>
        </Card>
    );
}