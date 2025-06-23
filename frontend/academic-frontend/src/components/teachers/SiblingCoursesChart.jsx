//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\teachers\SiblingCoursesChart.jsx
import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, Cell
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "../shared/ui/card";

export default function SiblingCoursesChart({ data, currentCourseId, currentCourseName = null }) {
  // 📍 Paso 2: Protección interna extra - Validación temprana
  if (currentCourseId == null) {
    return (
      <div className="text-red-500 font-semibold p-4 border border-red-300 rounded-lg bg-red-50">
        ⚠️ No se pudo determinar el curso actual para la comparación.
      </div>
    );
  }

  // Validación adicional de datos
  if (!data || data.length === 0) {
    return (
      <div className="text-yellow-600 font-semibold p-4 border border-yellow-300 rounded-lg bg-yellow-50">
        ℹ️ No hay datos de cursos hermanos disponibles para comparar.
      </div>
    );
  }

  const formattedData = data.map(c => ({
    name: c.courseName || `Curso ${c.courseId}`,
    average: c.average,
    isCurrent: c.courseId === parseInt(currentCourseId),
    courseId: c.courseId
  }));

  // ✅ Usar el nombre que venga por props, o el del array, o fallback
  const currentCourseData = formattedData.find(c => c.isCurrent);
  const currentName = currentCourseName || currentCourseData?.name || `Curso ${currentCourseId}`;

  const sorted = [...data].sort((a, b) => b.average - a.average);
  const ranking = sorted.findIndex(c => c.courseId === parseInt(currentCourseId)) + 1;
  console.log("Imprimiendo:", { currentCourseId, data });
  console.log("currentCourseId:", currentCourseId, typeof currentCourseId);

  const currentCourse = data.find(c => String(c.courseId) === String(currentCourseId));
  const realAverage = currentCourse?.average != null ? currentCourse.average.toFixed(2) : "N/A";

  // Validación adicional: verificar si el curso actual existe en los datos
  if (!currentCourse) {
    return (
      <div className="text-orange-600 font-semibold p-4 border border-orange-300 rounded-lg bg-orange-50">
        ⚠️ El curso actual no se encontró en los datos de comparación.
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Comparación con Cursos Hermanos</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ width: "100%", height: 340 }}>
            <ResponsiveContainer>
              <BarChart
                data={formattedData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <XAxis
                  dataKey="name"
                  label={{ value: 'Cursos Hermanos', position: 'insideBottom', offset: -5 }}
                />
                <YAxis
                  domain={[1, 5]}
                  label={{ value: 'Nota', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip formatter={(val) => `${val.toFixed(2)} / 5`} />
                <Bar dataKey="average" isAnimationActive={false}>
                  <LabelList
                    dataKey="average"
                    position="top"
                    formatter={(v) => v.toFixed(2)}
                  />
                  {formattedData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.courseId === parseInt(currentCourseId) ? "#f97316" : "#60a5fa"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-4" style={{ fontSize: "0.85rem" }}>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f97316' }}></div>
              <span className="font-medium">Curso actual</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#60a5fa' }}></div>
              <span className="font-medium">Cursos hermanos</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interpretación</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            El curso <strong>{currentName}</strong> tiene un promedio de <strong>{realAverage}</strong> en este periodo.
            Está en la posición <strong>#{ranking}</strong> de {data.length} cursos en el mismo grado enseñando la misma materia.
          </p>
          {ranking === 1 && (
            <p className="text-green-600 mt-2">
              🏆 ¡Es el curso con mejor desempeño!
            </p>
          )}
          {ranking === data.length && (
            <p className="text-red-600 mt-2">
              ⚠️ Este curso tiene el rendimiento más bajo entre sus pares.
            </p>
          )}
        </CardContent>
      </Card>
    </>
  );
}