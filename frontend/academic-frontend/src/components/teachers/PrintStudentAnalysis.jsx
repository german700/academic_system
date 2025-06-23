import React from "react";
import css from "../../assets/styles/PrintStudentAnalysis.css?raw";

// Hook principal unificado para impresión
export function usePrintStudentAnalysis() {
  const printStudentAnalysis = (analysis, metadata) => {
    // Validar que tenemos los datos necesarios
    if (!analysis || !metadata) {
      alert("No se encontraron datos para imprimir el análisis");
      return;
    }

    const logoUrl = "/logo.png";
    const fecha = new Date().toLocaleDateString("es-CO", {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Funciones auxiliares (mantenidas igual)
    function getGradeClass(grade) {
      if (!grade) return '';
      if (grade >= 4.0) return 'grade-excellent';
      if (grade >= 3.0) return 'grade-good';
      if (grade >= 2.0) return 'grade-average';
      return 'grade-poor';
    }

    function getRiskClass(riesgo) {
      if (!riesgo) return '';
      if (riesgo < 0.3) return 'risk-low';
      if (riesgo < 0.6) return 'risk-medium';
      return 'risk-high';
    }

    function formatNumber(num) {
      return num ? num.toFixed(2) : 'N/A';
    }

    function getGradeColor(grade) {
      if (!grade) return '#95a5a6';
      if (grade >= 4.0) return '#27ae60';
      if (grade >= 3.0) return '#f39c12';
      return '#e74c3c';
    }

    function getGradeColorSecondary(grade) {
      if (!grade) return '#7f8c8d';
      if (grade >= 4.0) return '#2ecc71';
      if (grade >= 3.0) return '#e67e22';
      return '#c0392b';
    }

    function getRiskInterpretation(riesgo) {
      if (!riesgo) return 'Sin datos';
      if (riesgo < 0.3) return 'Bajo Riesgo';
      if (riesgo < 0.6) return 'Riesgo Moderado';
      return 'Alto Riesgo';
    }

    function getRiskDescription(riesgo) {
      if (!riesgo) return 'No se pudo calcular el riesgo con los datos disponibles.';
      if (riesgo < 0.3) return 'El estudiante muestra un desempeño estable y bajo riesgo de dificultades académicas. Se recomienda mantener las estrategias actuales.';
      if (riesgo < 0.6) return 'El estudiante presenta algunos indicadores de riesgo que requieren seguimiento. Se sugiere implementar estrategias de apoyo preventivo.';
      return 'El estudiante presenta múltiples factores de riesgo que requieren intervención inmediata y apoyo integral para evitar el bajo rendimiento académico.';
    }

    // Construir el nombre completo del estudiante
    const { first_name, last_name, segundo_apellido, student_email } = analysis;
    const fullName = [first_name, last_name, segundo_apellido].filter(Boolean).join(" ") || student_email?.split("@")[0];

    // Validar que resumen_por_periodo sea un array
    const evolutionData = Array.isArray(analysis.resumen_por_periodo)
      ? analysis.resumen_por_periodo
      : [];

    // Datos para distribución de tipos de evaluación
    const distributionData = analysis.distribucion_tipos ?
      Object.entries(analysis.distribucion_tipos) : [];

    // Datos para gráfico de promedios por tipo
    const gradesByTypeData = analysis.promedios_por_tipo ?
      Object.entries(analysis.promedios_por_tipo) : [];

    // Intentar abrir la ventana
    const printWindow = window.open("", "_blank");

    // Validar que la ventana se abrió correctamente
    if (!printWindow) {
      alert("El navegador bloqueó la ventana emergente. Por favor, permite ventanas emergentes para este sitio y vuelve a intentar.");
      return;
    }

    const html = `
    <html>
      <head>
        <title>Análisis Individual - ${fullName}</title>
        <meta charset="UTF-8">
        <style>
          ${css}
          
          /* Regla específica para forzar salto de página antes de las recomendaciones */
          .recommendations-section {
            page-break-before: always;
            break-before: page;
          }
          
          /* Asegurar que no se corte en medio de una recomendación */
          .recommendation-item {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        </style>
      </head>
      <body>
        <!-- HEADER -->
        <div class="header">
          <img src="${logoUrl}" class="logo" alt="Logo Institucional" onerror="this.style.display='none'" />
          <div class="title">Análisis Individual del Estudiante</div>
          <div class="subtitle">${metadata.subjectName} – ${metadata.courseName}</div>
          <p>Docente: ${metadata.teacherName}</p>
          <div class="subtitle">Periodo Académico: ${metadata.period || 'N/A'}</div>
          <div class="date-info">Generado el ${fecha}</div>
        </div>

        <!-- STUDENT INFORMATION -->
        <div class="section">
          <div class="section-title">Información del Estudiante</div>
          <div class="student-info-grid">
            <div class="info-item">
              <div class="info-label">Nombre Completo</div>
              <div class="info-value">${fullName}</div>
            </div>
            <div class="info-item">
              <div class="info-label">ID Estudiante</div>
              <div class="info-value">${analysis.student_id || 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Correo Electrónico</div>
              <div class="info-value">${student_email || 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Edad</div>
              <div class="info-value">${analysis.edad ? `${analysis.edad} años` : 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Estrato Socioeconómico</div>
              <div class="info-value">Estrato ${analysis.estrato || 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Materia</div>
              <div class="info-value">${analysis.materia || metadata.subjectName || 'N/A'}</div>
            </div>
          </div>
        </div>

        <!-- KEY METRICS -->
        <div class="section">
          <div class="section-title">Métricas Principales</div>
          <div class="metrics-grid">
            <div class="metric-card ${getGradeClass(analysis.promedio_general)}">
              <div class="metric-value">${formatNumber(analysis.promedio_general)}</div>
              <div class="metric-label">Promedio General</div>
            </div>
            <div class="metric-card">
              <div class="metric-value" style="font-size: 14px;">
                ${formatNumber(analysis.nota_min)} - ${formatNumber(analysis.nota_max)}
              </div>
              <div class="metric-label">Rango de Notas</div>
            </div>
            <div class="metric-card">
              <div class="metric-value" style="color: #3498db;">
                ${analysis.asistencia_periodo ? `${(analysis.asistencia_periodo * 100).toFixed(0)}%` : 'N/A'}
              </div>
              <div class="metric-label">Asistencia Periodo</div>
            </div>
            <div class="metric-card ${getRiskClass(analysis.prediccion_riesgo?.riesgo)}">
              <div class="metric-value">
                ${analysis.prediccion_riesgo?.riesgo ? `${(analysis.prediccion_riesgo.riesgo * 100).toFixed(0)}%` : 'N/A'}
              </div>
              <div class="metric-label">Riesgo IA</div>
            </div>
          </div>

          <!-- Additional metrics row -->
          <div class="metrics-grid" style="margin-top: 12px;">
            <div class="metric-card">
              <div class="metric-value" style="color: #e67e22;">
                ${analysis.entregas_tardias || 0}
              </div>
              <div class="metric-label">Entregas Tardías</div>
            </div>
            <div class="metric-card">
              <div class="metric-value" style="color: #9b59b6;">
                ${analysis.total_evaluaciones || 0}
              </div>
              <div class="metric-label">Total Evaluaciones</div>
            </div>
            <div class="metric-card">
              <div class="metric-value" style="color: #27ae60;">
                ${analysis.asistencia ? `${(analysis.asistencia * 100).toFixed(0)}%` : 'N/A'}
              </div>
              <div class="metric-label">Asistencia General</div>
            </div>
            <div class="metric-card">
              <div class="metric-value" style="color: #34495e;">
                ${analysis.prediccion_riesgo?.confianza ? `${(analysis.prediccion_riesgo.confianza * 100).toFixed(0)}%` : 'N/A'}
              </div>
              <div class="metric-label">Confianza IA</div>
            </div>
          </div>
        </div>

        <!-- GRADES BY TYPE -->
        ${gradesByTypeData.length > 0 ? `
        <div class="section">
          <div class="section-title">Promedios por Tipo de Evaluación</div>
          <table>
            <thead>
              <tr>
                <th>Tipo de Evaluación</th>
                <th>Promedio</th>
                <th>Número de Evaluaciones</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${gradesByTypeData.map(([tipo, info]) => `
                <tr>
                  <td style="font-weight: 600;">${tipo.replace(/_/g, " ").toUpperCase()}</td>
                  <td class="${getGradeClass(info.promedio)}" style="font-weight: bold;">${formatNumber(info.promedio)}</td>
                  <td style="text-align: center;">${info.evaluaciones}</td>
                  <td>
                    <span class="badge ${info.promedio >= 4.0 ? 'badge-success' : info.promedio >= 3.0 ? 'badge-warning' : 'badge-danger'}">
                      ${info.promedio >= 4.0 ? 'Excelente' : info.promedio >= 3.0 ? 'Aceptable' : 'Deficiente'}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        <!-- EVALUATION DISTRIBUTION -->
        ${distributionData.length > 0 ? `
        <div class="section">
          <div class="section-title">Distribución de Tipos de Evaluación</div>
          <table>
            <thead>
              <tr>
                <th>Tipo de Evaluación</th>
                <th>Cantidad</th>
                <th>Porcentaje</th>
                <th>Representación Visual</th>
              </tr>
            </thead>
            <tbody>
              ${distributionData.map(([tipo, info]) => `
                <tr>
                  <td style="font-weight: 600;">${tipo.replace(/_/g, " ").toUpperCase()}</td>
                  <td style="text-align: center; font-weight: bold;">${info.cantidad}</td>
                  <td style="text-align: center; font-weight: bold;">${info.porcentaje}%</td>
                  <td>
                    <div style="background: #e9ecef; border-radius: 10px; height: 16px; position: relative; overflow: hidden;">
                      <div style="background: linear-gradient(90deg, #3498db, #2980b9); height: 100%; width: ${info.porcentaje}%; border-radius: 10px;"></div>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        <!-- EVOLUTION CHART -->
        ${evolutionData.length > 0 ? `
        <div class="section">
          <div class="section-title">Evolución por Periodo</div>
          <div class="evolution-chart">
            ${evolutionData.map(item => `
              <div class="chart-row">
                <div class="chart-period">P-${item.periodo}</div>
                <div class="chart-bar">
                  <div class="chart-fill" style="width: ${(item.nota / 5) * 100}%; background: linear-gradient(90deg, ${getGradeColor(item.nota)}, ${getGradeColorSecondary(item.nota)});"></div>
                </div>
                <div class="chart-value ${getGradeClass(item.nota)}">${formatNumber(item.nota)}</div>
              </div>
            `).join('')}
            <div style="margin-top: 10px; font-size: 10px; color: #6c757d;">
              <strong>Análisis de Tendencia:</strong> 
              ${(() => {
          if (evolutionData.length < 2) return 'Insuficientes datos para análisis de tendencia.';
          const firstNote = evolutionData[0]?.nota;
          const lastNote = evolutionData[evolutionData.length - 1]?.nota;
          const trend = lastNote - firstNote;
          const trendPercentage = ((trend / firstNote) * 100).toFixed(1);

          if (trend > 0.2) return `📈 Tendencia positiva con mejora de ${trend.toFixed(2)} puntos (${trendPercentage}% de crecimiento).`;
          if (trend < -0.2) return `📉 Tendencia descendente con caída de ${Math.abs(trend).toFixed(2)} puntos (${Math.abs(trendPercentage)}% de descenso).`;
          return `➡️ Rendimiento estable con variación mínima de ${Math.abs(trend).toFixed(2)} puntos.`;
        })()}
            </div>
          </div>
        </div>
        ` : ''}

        <!-- RISK ANALYSIS -->
        ${analysis.prediccion_riesgo ? `
        <div class="section">
          <div class="section-title">Análisis de Riesgo con Inteligencia Artificial</div>
          <div class="narrative">
            <div class="narrative-section narrative-risk">
              <div class="narrative-title">🤖 Predicción de Riesgo</div>
              <p><strong>Nivel de Riesgo:</strong> ${(analysis.prediccion_riesgo.riesgo * 100).toFixed(1)}% 
              (${getRiskInterpretation(analysis.prediccion_riesgo.riesgo)})</p>
              <p><strong>Confianza del Modelo:</strong> ${analysis.prediccion_riesgo.confianza ? `${(analysis.prediccion_riesgo.confianza * 100).toFixed(1)}%` : 'N/A'}</p>
              <p><strong>Interpretación:</strong> ${getRiskDescription(analysis.prediccion_riesgo.riesgo)}</p>
            </div>
          </div>
        </div>
        ` : ''}

        <!-- COMPREHENSIVE NARRATIVE -->
        <div class="section">
          <div class="section-title">Análisis Integral del Desempeño</div>
          <div class="narrative">
            <div class="narrative-section narrative-academic">
              <div class="narrative-title">📊 Rendimiento Académico</div>
              <p><strong>${fullName}</strong> obtuvo un promedio general de <strong>${formatNumber(analysis.promedio_general)}</strong> en la materia <strong>${analysis.materia || metadata.subjectName}</strong> durante el periodo evaluado.</p>
              ${analysis.nota_min && analysis.nota_max ? `<p>Su desempeño ha oscilado entre <strong>${formatNumber(analysis.nota_min)}</strong> y <strong>${formatNumber(analysis.nota_max)}</strong>, mostrando una variabilidad de <strong>${formatNumber(analysis.nota_max - analysis.nota_min)}</strong> puntos.</p>` : ''}
            </div>

            ${analysis.asistencia_periodo ? `
            <div class="narrative-section narrative-attendance">
              <div class="narrative-title">🕐 Análisis de Asistencia</div>
              <p>La asistencia del estudiante en el periodo fue del <strong>${(analysis.asistencia_periodo * 100).toFixed(1)}%</strong>${analysis.asistencia ? `, comparado con una asistencia general del <strong>${(analysis.asistencia * 100).toFixed(1)}%</strong>` : ''}.</p>
              <p>${analysis.asistencia_periodo >= 0.9 ? 'Excelente nivel de asistencia que contribuye positivamente al proceso de aprendizaje.' : analysis.asistencia_periodo >= 0.8 ? 'Buena asistencia, aunque podría mejorar para optimizar el aprovechamiento académico.' : 'La baja asistencia representa un factor de riesgo que requiere intervención inmediata.'}</p>
            </div>
            ` : ''}

            ${evolutionData.length > 1 ? `
            <div class="narrative-section narrative-trend">
              <div class="narrative-title">📈 Análisis de Evolución</div>
              <p>${(() => {
          const firstNote = evolutionData[0]?.nota;
          const lastNote = evolutionData[evolutionData.length - 1]?.nota;
          const trend = lastNote - firstNote;

          if (trend > 0.2) return `El estudiante muestra una <strong>evolución positiva</strong> con una mejora de <strong>${trend.toFixed(2)} puntos</strong> desde el inicio del seguimiento. Esta tendencia ascendente indica un proceso de aprendizaje efectivo y creciente dominio de la materia.`;
          if (trend < -0.2) return `Se observa una <strong>tendencia descendente</strong> con una disminución de <strong>${Math.abs(trend).toFixed(2)} puntos</strong> en el rendimiento. Es crucial implementar estrategias de apoyo para revertir esta situación.`;
          return `El estudiante mantiene un <strong>rendimiento estable</strong> con variaciones mínimas (${Math.abs(trend).toFixed(2)} puntos), demostrando consistencia en su desempeño académico.`;
        })()}</p>
            </div>
            ` : ''}
          </div>
        </div>

        <!-- RECOMMENDATIONS - CON SALTO DE PÁGINA -->
        <div class="section recommendations-section">
          <div class="section-title">Recomendaciones Pedagógicas Específicas</div>
          <div class="recommendations">
            ${(() => {
        const recommendations = [];

        if (analysis.entregas_tardias > 2) {
          recommendations.push(`<div class="recommendation-item"><span class="recommendation-icon">⏰</span><strong>Gestión del Tiempo:</strong> Implementar estrategias de planificación y organización para reducir las ${analysis.entregas_tardias} entregas tardías detectadas.</div>`);
        }

        if (analysis.asistencia_periodo < 0.8) {
          recommendations.push(`<div class="recommendation-item"><span class="recommendation-icon">📅</span><strong>Asistencia:</strong> Desarrollar un plan de seguimiento para mejorar la presencia en clases (actual: ${(analysis.asistencia_periodo * 100).toFixed(0)}%).</div>`);
        }

        if (analysis.promedio_general < 3.0) {
          recommendations.push(`<div class="recommendation-item"><span class="recommendation-icon">📚</span><strong>Refuerzo Académico:</strong> Implementar programa de tutorías y apoyo académico para mejorar el rendimiento general (promedio actual: ${formatNumber(analysis.promedio_general)}).</div>`);
        }

        if (analysis.prediccion_riesgo?.riesgo > 0.6) {
          recommendations.push(`<div class="recommendation-item"><span class="recommendation-icon">🚨</span><strong>Intervención Urgente:</strong> Activar protocolo de apoyo integral debido al alto riesgo detectado por IA (${(analysis.prediccion_riesgo.riesgo * 100).toFixed(0)}%).</div>`);
        }

        if (evolutionData.length > 1) {
          const trend = evolutionData[evolutionData.length - 1]?.nota - evolutionData[0]?.nota;
          if (trend < -0.2) {
            recommendations.push(`<div class="recommendation-item"><span class="recommendation-icon">📉</span><strong>Recuperación:</strong> Diseñar plan de recuperación académica para revertir la tendencia descendente detectada.</div>`);
          }
        }

        if (recommendations.length === 0) {
          recommendations.push(`<div class="recommendation-item"><span class="recommendation-icon">✅</span><strong>Mantenimiento:</strong> Continuar con las estrategias actuales manteniendo el monitoreo constante del progreso académico.</div>`);
        }

        return recommendations.join('');
      })()}
          </div>
        </div>

        <!-- FOOTER -->
        <div class="footer">
          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-label">Docente Responsable</div>
            </div>
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-label">Coordinador Académico</div>
            </div>
          </div>
          <div class="footer-info">
            <p>Documento generado automáticamente por el Sistema de Análisis Académico</p>
            <p>Fecha de generación: ${fecha} | Análisis basado en datos del periodo académico ${analysis.periodo || 'actual'}</p>
          </div>
        </div>
      </body>
    </html>
    `;

    try {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();

      // Esperar a que se cargue y luego imprimir
      setTimeout(() => {
        printWindow.print();
      }, 500);
    } catch (error) {
      console.error('Error al generar el documento:', error);
      alert('Error al generar el documento de impresión');
      printWindow.close();
    }
  };

  return printStudentAnalysis;
}

// Componente de botón unificado y optimizado
export default function PrintStudentAnalysisButton({
  analysis,
  metadata,
  children,
  className = "btn btn-primary",
  disabled = false,
  variant = "primary" // primary, secondary, icon
}) {

  const printStudentAnalysis = usePrintStudentAnalysis();
  console.log("Metadata en Print!!!:", metadata);
  console.log("Periodo prop directa!!!:", metadata?.period);
  const handlePrint = () => {
    // Validación previa
    if (!analysis || !metadata) {
      alert("Faltan datos necesarios para generar el análisis");
      return;
    }

    console.log("Metadata recibida:", metadata);
    console.log("Analysis recibida:", analysis);
    printStudentAnalysis(analysis, metadata);
  };

  // Determinar estilos según la variante
  const getButtonStyles = () => {
    const baseStyles = "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium";

    switch (variant) {
      case "secondary":
        return `${baseStyles} bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 hover:border-gray-400`;
      case "icon":
        return `${baseStyles} bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 p-2`;
      default: // primary
        return `${baseStyles} bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md`;
    }
  };

  const renderButtonContent = () => {
    if (variant === "icon") {
      return (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          <span className="sr-only">Imprimir Análisis</span>
        </>
      );
    }

    return (
      <>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        {children || "Imprimir Análisis"}
      </>
    );
  };

  return (
    <button
      onClick={handlePrint}
      className={className || getButtonStyles()}
      disabled={disabled || !analysis || !metadata}
      title={disabled ? "Datos insuficientes para imprimir" : "Generar reporte de análisis del estudiante"}
      type="button"
    >
      {renderButtonContent()}
    </button>
  );
}

// Exportar también un componente funcional adicional para casos específicos
export function QuickPrintButton({ analysis, metadata }) {
  const printStudentAnalysis = usePrintStudentAnalysis();

  return (
    <button
      onClick={() => printStudentAnalysis(analysis, metadata)}
      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
      title="Imprimir análisis rápido"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
      </svg>
    </button>
  );
}