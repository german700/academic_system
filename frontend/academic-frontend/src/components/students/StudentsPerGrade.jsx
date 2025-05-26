//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\students\StudentsPerGrade.jsx
import React, { useEffect, useState } from 'react';
import { getStudentsPerGrade } from '../services/analyticsService';

const StudentsPerGrade = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getStudentsPerGrade();
        setData(result);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Cantidad de estudiantes por grado</h2>
      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2 text-left">Grado</th>
            <th className="border px-4 py-2 text-left">Cantidad de Estudiantes</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="border-t">
              <td className="px-4 py-2">{item.grado}</td>
              <td className="px-4 py-2">{item.cantidad_estudiantes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentsPerGrade;