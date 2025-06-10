//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\teachers\CourseAnalysis.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCourseComparison } from "../services/docentesService";
import { Card, CardHeader, CardTitle, CardContent } from "../shared/ui/card";
import { Button } from "../shared/ui/button";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

export default function CourseAnalysis() {
  const { courseId, subjectId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();

  useEffect(() => {
    fetchCourseComparison(courseId, subjectId)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [courseId, subjectId]);

  if (loading) return <div className="p-6">Cargando análisis de IA…</div>;
  if (error)   return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Análisis IA del Curso</h1>
        <Button onClick={() => navigate(-1)}>Volver</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Informe IA</CardTitle></CardHeader>
        <CardContent>
          <p>{data.ia_course_analysis}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Comparativo Real vs Riesgo IA</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.ia_course_chart} margin={{ top:5, right:20, left:5, bottom:20 }}>
                <XAxis dataKey="label" angle={-45} textAnchor="end" height={40} />
                <YAxis domain={[0,5]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="avg" name="Promedio real" />
                <Bar dataKey="risk" name="Riesgo IA" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
