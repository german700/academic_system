//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\admin\StudentDetail\StudentAttendance.jsx
import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../shared/ui/table";

const StudentAttendance = ({ attendance }) => {

    if (!attendance) {
        return <p>No hay datos de asistencia disponibles.</p>;
    }

    const { total_days, present_days, absent_days, attendance_rate, by_subject } = attendance;

    return (
        <div className="mt-8">
            <h2 className="text-xl font-semibold mb-2">🗓 Registro de Asistencia</h2>
            <p>Días Totales: {total_days}</p>
            <p>Días Asistidos: {present_days}</p>
            <p>Días Ausentes: {absent_days}</p>
            <p>Porcentaje de Asistencia General: {attendance_rate}%</p>

            <h3 className="text-lg font-semibold mt-4 mb-2">Asistencia por Materia</h3>
            {by_subject && Object.keys(by_subject).length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Materia</TableHead>
                            <TableHead>Asistencia (%)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Object.entries(by_subject).map(([subject, percent], index) => (
                            <TableRow key={index}>
                                <TableCell>{subject}</TableCell>
                                <TableCell>{percent}%</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <p>No hay datos por materia.</p>
            )}
        </div>
    );
};

export default StudentAttendance;
