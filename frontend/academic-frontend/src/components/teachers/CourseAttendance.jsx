//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\teachers\CourseAttendance.jsx
import React, { useEffect, useState } from 'react';
import { fetchAttendanceByDate, fetchCreateAttendance, fetchUpdateAttendance } from '../services/docentesService';
import { Card, CardContent, CardHeader, CardTitle } from '../shared/ui/card';
import { Button } from '../shared/ui/button';

export default function CourseAttendance({ courseId, subjectId }) {
  const [date, setDate] = useState(new Date());
  const [records, setRecords] = useState([]);

  useEffect(() => load(), [date]);
  const load = async () => {
    const data = await fetchAttendanceByDate(courseId, subjectId, date);
    setRecords(data);
  };

  const toggle = async (rec) => {
    if (rec.id) await fetchUpdateAttendance(rec.id, { present: !rec.present });
    else await fetchCreateAttendance({ student: rec.studentId, subject: subjectId, date, present: !rec.present });
    load();
  };

  return (
    <Card>
      <CardHeader><CardTitle>Asistencia</CardTitle></CardHeader>
      <CardContent>
        <input type="date" value={date.toISOString().slice(0,10)} onChange={e => setDate(new Date(e.target.value))} />
        <table className="w-full mt-4">
          <thead><tr><th>Estudiante</th><th>Presente</th></tr></thead>
          <tbody>
            {records.map(r => (
              <tr key={r.studentId}>
                <td>{r.studentName}</td>
                <td>
                  <input type="checkbox" checked={r.present} onChange={() => toggle(r)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
