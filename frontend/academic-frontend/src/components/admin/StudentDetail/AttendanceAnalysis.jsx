//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\admin\StudentDetail\AttendanceAnalysis.jsx
import React from "react";

const AttendanceAnalysis = ({ attendance }) => {
  if (!attendance) return null;

  const {
    total_days,
    present_days,
    absent_days,
    attendance_rate,
    by_subject
  } = attendance;

  return (
    <div className="my-6">
      <h3 className="text-lg font-semibold mb-2">📅 Asistencia</h3>
      <p><strong>Días totales:</strong> {total_days}</p>
      <p><strong>Presentes:</strong> {present_days}</p>
      <p><strong>Ausentes:</strong> {absent_days}</p>
      <p><strong>Porcentaje general:</strong> {attendance_rate}%</p>

      <div className="mt-3">
        <h4 className="font-semibold">Por materia:</h4>
        <ul className="list-disc list-inside">
          {Object.entries(by_subject).map(([subject, rate]) => (
            <li key={subject}>
              {subject}: {rate}%
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AttendanceAnalysis;
