//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\students\StudentsPerGrade.jsx
import React, { useEffect, useState } from 'react';
import { getStudentsPerGrade } from '../services/analyticsService';
import './students_css/StudentsPerGrade.css'; // <- Nuevo import

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
    <div className="students-per-grade-container">
      <h2 className="students-per-grade-title">Cantidad de estudiantes por grado</h2>
      <table className="students-per-grade-table">
        <thead>
          <tr>
            <th>Grado</th>
            <th>Cantidad de Estudiantes</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.grado}</td>
              <td>{item.cantidad_estudiantes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentsPerGrade;
