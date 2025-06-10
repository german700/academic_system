//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\teachers\CourseComparison.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCourseComparison } from "../services/docentesService";
import { Card, CardHeader, CardTitle, CardContent } from "../shared/ui/card";
import { Button } from "../shared/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function CourseComparison() {
    const { courseId, subjectId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();

    useEffect(() => {
        fetchCourseComparison(courseId, subjectId)
            .then((json) => setData(json))
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [courseId, subjectId]);

    if (loading) return <div className="p-6">Cargando análisis de curso…</div>;
    if (error) return <div className="p-6 text-red-500">{error}</div>;

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Análisis de Curso</h1>
                <div className="flex gap-2">
                    <Button onClick={() => navigate(-1)}>Volver</Button>
                    <Button onClick={() => navigate("/teachers/dashboard")}>Dashboard</Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Informe IA</CardTitle>
                </CardHeader>
                <CardContent>
                    {ia ? (
                        <>
                            <p className="text-lg font-semibold">
                                {ia.interpretacion_riesgo?.emoji} Nivel de Riesgo:{" "}
                                <span className="text-green-600 font-bold">{ia.interpretacion_riesgo?.nivel}</span>
                            </p>
                            <p className="text-sm text-gray-600 italic mt-1">{ia.interpretacion_riesgo?.descripcion}</p>
                            <p className="mt-4"><strong>Recomendación:</strong> {ia.interpretacion_riesgo?.recomendacion}</p>
                            <p className="mt-4 text-sm">Riesgo estimado IA: <strong>{ia.riesgo_promedio}</strong> (confianza: {ia.confianza})</p>
                        </>
                    ) : (
                        <p className="text-gray-400">Cargando análisis IA…</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
