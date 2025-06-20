//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\teachers\PrintStudentAnalysis.jsx
import React from "react";

export default function PrintStudentAnalysis({ analysis, metadata }) {
  const logoUrl = "/logo.png";
  const printWindow = window.open("", "_blank");

  const fecha = new Date().toLocaleDateString("es-CO");

  const html = `
    <html>
      <head>
        <title>Análisis Individual - ${analysis.first_name} ${analysis.last_name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; font-size: 13px; }
          .header { text-align: center; margin-bottom: 20px; position: relative; }
          .logo { position: absolute; left: 0; top: 0; width: 100px; height: 100px; object-fit: contain; }
          .title { font-size: 18px; font-weight: bold; }
          .section { margin-top: 25px; }
          .label { font-weight: bold; }
          .badge { display: inline-block; padding: 4px 8px; border-radius: 5px; font-weight: bold; }
          .riesgo { background-color: ${getRiskColor(analysis.prediccion_riesgo?.riesgo)}; color: white; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ccc; padding: 6px; text-align: left; }
          .small { font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${logoUrl}" class="logo" alt="Logo">
          <div class="title">Análisis Individual del Estudiante</div>
          <div>${metadata.subjectName} - ${metadata.courseName} | Periodo ${analysis.period}</div>
          <div>Fecha: ${fecha}</div>
        </div>

        <div class="section">
          <div><span class="label">Estudiante:</span> ${analysis.first_name} ${analysis.last_name} (${analysis.student_id})</div>
          <div><span class="label">Correo:</span> ${analysis.student_email}</div>
          <div><span class="label">Edad:</span> ${analysis.edad} años</div>
          <div><span class="label">Estrato:</span> ${analysis.estrato}</div>
        </div>

        <div class="section">
          <div><span class="label">Promedio General:</span> ${analysis.promedio_general}</div>
          <div><span class="label">Promedio IA:</span> ${analysis.prediccion_riesgo?.riesgo}</div>
          <div><span class="label">Asistencia:</span> ${(analysis.asistencia * 100).toFixed(1)}%</div>
          <div class="badge riesgo small">${analysis.interpretacion_riesgo?.nivel}: ${analysis.interpretacion_riesgo?.descripcion}</div>
        </div>

        <div class="section">
          <h3>Evaluaciones</h3>
          <table>
            <thead>
              <tr><th>Nombre</th><th>Tipo</th><th>Nota</th><th>Tarde</th></tr>
            </thead>
            <tbody>
              ${analysis.promedios_por_tipo ? Object.entries(analysis.promedios_por_tipo).map(([tipo, info]) => 
                `<tr><td colspan="2">${tipo}</td><td colspan="2">${info.promedio} (${info.evaluaciones} evaluaciones)</td></tr>`).join("") : "<tr><td colspan='4'>Sin datos</td></tr>"}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h3>Recomendaciones</h3>
          <ul>
            ${(analysis.prediccion_riesgo?.materias_con_riesgo || []).map(m => `<li>Revisar rendimiento en ${m}</li>`).join('')}
            ${(analysis.recomendaciones || []).map(r => `<li>${r}</li>`).join('')}
          </ul>
        </div>

        <div class="section">
          <div class="label">Análisis Narrativo:</div>
          <div>${analysis.informe_narrativo || "Sin observaciones."}</div>
        </div>

        <div class="section" style="margin-top:40px; text-align:center">
          ___________________________<br>Firma del Docente
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onload = () => printWindow.print();
  return null;
}

function getRiskColor(risk) {
  if (risk >= 0.8) return "#c0392b"; // rojo
  if (risk >= 0.6) return "#e67e22"; // naranja
  if (risk >= 0.4) return "#f1c40f"; // amarillo
  if (risk >= 0.2) return "#2ecc71"; // verde claro
  return "#27ae60"; // verde
}
