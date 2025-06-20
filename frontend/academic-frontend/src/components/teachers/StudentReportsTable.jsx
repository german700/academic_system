//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\teachers\StudentReportsTable.jsx
import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../shared/ui/table";
import { Badge } from "../shared/ui/badge";

export default function StudentReportsTable({ reports, courseName, subjectName, period }) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-3">
        Informe individual por estudiante – materia: <strong>{subjectName || "Matemáticas"}</strong>, curso: <strong>{courseName || "1-A"}</strong>, periodo: <strong>{period || "1"}</strong>
      </p>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Estudiante</TableHead>
              <TableHead>Promedio</TableHead>
              <TableHead>Riesgo IA</TableHead>
              <TableHead>% Tardías</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map(r => {
              const risco = r.prediccion_riesgo.riesgo;
              const pctTardias = ((r.entregas_tardias || 0) / (r.total_evaluaciones || 1)) * 100;
              return (
                <TableRow key={r.student_id}>
                  <TableCell>{r.student_email.split("@")[0]}</TableCell>
                  <TableCell>{r.promedio_general.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={risco > 0.6 ? "destructive" : "default"}>
                      {(risco * 100).toFixed(0)}%
                    </Badge>
                  </TableCell>
                  <TableCell>{pctTardias.toFixed(0)}%</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      <div className="text-xs text-gray-400 mt-2">
        <strong>Nota:</strong> Las celdas de "Riesgo IA" en rojo indican alto riesgo (≥60%). 
        Los porcentajes de entregas tardías se calculan sobre el total de evaluaciones.
      </div>
    </div>
  );
}