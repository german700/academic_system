// C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\students\MyGrades.jsx
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "../shared/ui/card";

const API_URL = 'http://localhost:8000/api/academic/students/my-grades/';

// Función para obtener encabezados con token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const MyGrades = () => {
  const [grades, setGrades] = useState([]);

  useEffect(() => {
    fetch(API_URL, {
      method: 'GET',
      headers: getAuthHeaders(),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Error al obtener calificaciones');
        return res.json();
      })
      .then((data) => setGrades(data))
      .catch((error) => console.error('Error fetching grades:', error));
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Mis Calificaciones</h1>
      {grades.length === 0 ? (
        <p>No hay calificaciones registradas.</p>
      ) : (
        grades.map((grade) => (
          <Card key={grade.id}>
            <CardContent className="space-y-2">
              <div className="text-lg font-semibold">{grade.course_name}</div>
              <div>Profesor: {grade.teacher?.first_name} {grade.teacher?.last_name}</div>
              <div>Periodo: {grade.period} | Año: {grade.year}</div>
              <div>Nota Final: <strong>{grade.value}</strong></div>
              {grade.comments && <div className="text-sm text-muted-foreground">Comentarios: {grade.comments}</div>}
              <div className="mt-2">
                <p className="font-medium">Subnotas:</p>
                <ul className="list-disc list-inside">
                  {grade.entries.map((entry) => (
                    <li key={entry.id}>
                      {entry.label}: {entry.score}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default MyGrades;
