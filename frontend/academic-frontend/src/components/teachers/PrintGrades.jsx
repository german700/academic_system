import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "../shared/ui/card";
import { Button } from "../shared/ui/button";
import { X, FileText, Download } from "lucide-react";

export default function PrintGrades({
    students,
    assignments,
    period,
    courseId,
    subjectId,
    metadata = {}, // ✅ Nuevo prop para los metadatos
    onClose
}) {
    const [includeDefinitiva, setIncludeDefinitiva] = useState(false);
    const [logoBase64, setLogoBase64] = useState('');
    
    // Convertir logo a base64 al cargar el componente
    React.useEffect(() => {
        const convertLogoToBase64 = async () => {
            try {
                const response = await fetch('/logo.png');
                const blob = await response.blob();
                const reader = new FileReader();
                reader.onloadend = () => {
                    setLogoBase64(reader.result);
                };
                reader.readAsDataURL(blob);
            } catch (error) {
                console.log('Error cargando logo:', error);
                setLogoBase64('');
            }
        };
        convertLogoToBase64();
    }, []);
   
    // Calcular definitiva (igual que en el componente padre)
    const calculateFinal = (studentGrades) => {
        let total = 0;
        let weightSum = 0;
        for (const assignment of assignments) {
            const grade = studentGrades.find(g => g.assignment_id === assignment.id);
            const weight = (assignment.weightPercentage || 0) / 100;
            if (grade && !isNaN(grade.score) && weight > 0) {
                total += grade.score * weight;
                weightSum += weight;
            }
        }
        return weightSum > 0 ? (total / weightSum).toFixed(2) : "0.00";
    };

    // Función auxiliar para manejar la impresión con logo
    const handlePrintWithLogo = (printWindow) => {
        const logo = printWindow.document.querySelector("img.logo");
        if (logo && logoBase64) {
            if (logo.complete) {
                setTimeout(() => printWindow.print(), 100);
            } else {
                logo.onload = () => {
                    setTimeout(() => printWindow.print(), 100);
                };
                logo.onerror = () => {
                    setTimeout(() => printWindow.print(), 100);
                };
            }
        } else {
            setTimeout(() => printWindow.print(), 100);
        }
    };

    // ✅ Función para generar la información del curso con datos reales
    const getCourseInfoSection = () => {
        return `
            <div class="course-info">
                <div><strong>CURSO:</strong> ${metadata.courseName || '_________________'}</div>
                <div><strong>MATERIA:</strong> ${metadata.subjectName || '_________________'}</div>
                <div><strong>PERIODO:</strong> ${period}</div>
            </div>
            
            <div class="course-info">
                <div><strong>DOCENTE:</strong> ${metadata.teacherName || '_________________'}</div>
                <div><strong>AÑO:</strong> ${new Date().getFullYear()}</div>
                <div><strong>FECHA:</strong> ${new Date().toLocaleDateString('es-CO')}</div>
            </div>
        `;
    };

    // Generar planilla en blanco
    console.log("METADATA EN PDF:", metadata);
    const generateBlankTemplate = () => {
        const printContent = `
            <html>
                <head>
                    <title>Planilla de Calificaciones - ${metadata.courseName || 'Curso'} - ${metadata.subjectName || 'Materia'} - ${period}</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            margin: 20px;
                            font-size: 12px;
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 30px;
                            border-bottom: 2px solid #000;
                            padding-bottom: 20px;
                            position: relative;
                            min-height: 100px;
                        }
                        .logo {
                            position: absolute;
                            left: 0;
                            top: 5px;
                            width: 100px;
                            height: 100px;
                            object-fit: contain;
                        }
                        .header-content {
                            margin-left: 110px;
                            margin-right: 110px;
                        }
                        .institution {
                            font-size: 18px;
                            font-weight: bold;
                            text-transform: uppercase;
                        }
                        .course-info {
                            margin: 15px 0;
                            display: flex;
                            justify-content: space-between;
                        }
                        .course-info div {
                            border: 1px solid #000;
                            padding: 5px 10px;
                            min-width: 200px;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-top: 20px;
                        }
                        th, td {
                            border: 1px solid #000;
                            padding: 8px 4px;
                            text-align: center;
                            vertical-align: middle;
                        }
                        th {
                            background-color: #f0f0f0;
                            font-weight: bold;
                            font-size: 10px;
                        }
                        .student-column {
                            text-align: left;
                            width: 200px;
                        }
                        .grade-column {
                            width: 60px;
                            height: 25px;
                        }
                        .student-id {
                            font-weight: bold;
                            font-size: 10px;
                        }
                        .student-name {
                            font-size: 11px;
                        }
                        .footer {
                            margin-top: 30px;
                            display: flex;
                            justify-content: space-between;
                        }
                        .signature {
                            border-top: 1px solid #000;
                            width: 200px;
                            text-align: center;
                            padding-top: 5px;
                            margin-top: 20px;
                        }
                        @media print {
                            body { margin: 0; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        ${logoBase64 ? `<img src="${logoBase64}" alt="Logo Institución" class="logo">` : ''}
                        <div class="header-content">
                            <div class="institution">INSTITUCIÓN EDUCATIVA</div>
                            <div>PLANILLA DE CALIFICACIONES</div>
                        </div>
                    </div>
                    
                    ${getCourseInfoSection()}
                    <table>
                        <thead>
                            <tr>
                                <th class="student-column">ESTUDIANTE</th>
                                ${assignments.map(assignment =>
                                    `<th class="grade-column">${assignment.name}<br><small>(${assignment.weightPercentage || 0}%)</small></th>`
                                ).join('')}
                                <th class="grade-column">DEFINITIVA</th>
                                <th class="grade-column">OBSERVACIONES</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${students.map(student => `
                                <tr>
                                    <td class="student-column">
                                        <div class="student-id">ID: ${student.student_id}</div>
                                        <div class="student-name">${student.student_name.toUpperCase()}</div>
                                    </td>
                                    ${assignments.map(() => '<td class="grade-column"></td>').join('')}
                                    <td class="grade-column"></td>
                                    <td class="grade-column"></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="footer">
                        <div class="signature">
                            <div>_________________________</div>
                            <div>FIRMA DEL DOCENTE</div>
                        </div>
                        <div class="signature">
                            <div>_________________________</div>
                            <div>COORDINADOR ACADÉMICO</div>
                        </div>
                        <div class="signature">
                            <div>_________________________</div>
                            <div>DIRECTOR(A)</div>
                        </div>
                    </div>
                </body>
            </html>
        `;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.onload = () => {
            handlePrintWithLogo(printWindow);
        };
    };

    // Generar planilla con notas
    console.log("METADATA EN PDF:", metadata);
    const generateGradesTemplate = () => {
        const printContent = `
            <html>
                <head>
                    <title>Planilla de Calificaciones con Notas - ${metadata.courseName || 'Curso'} - ${metadata.subjectName || 'Materia'} - ${period}</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            margin: 20px;
                            font-size: 12px;
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 30px;
                            border-bottom: 2px solid #000;
                            padding-bottom: 20px;
                            position: relative;
                            min-height: 100px;
                        }
                        .logo {
                            position: absolute;
                            left: 0;
                            top: 5px;
                            width: 100px;
                            height: 100px;
                            object-fit: contain;
                        }
                        .header-content {
                            margin-left: 110px;
                            margin-right: 110px;
                        }
                        .institution {
                            font-size: 18px;
                            font-weight: bold;
                            text-transform: uppercase;
                        }
                        .course-info {
                            margin: 15px 0;
                            display: flex;
                            justify-content: space-between;
                        }
                        .course-info div {
                            border: 1px solid #000;
                            padding: 5px 10px;
                            min-width: 200px;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-top: 20px;
                        }
                        th, td {
                            border: 1px solid #000;
                            padding: 8px 4px;
                            text-align: center;
                            vertical-align: middle;
                        }
                        th {
                            background-color: #f0f0f0;
                            font-weight: bold;
                            font-size: 10px;
                        }
                        .student-column {
                            text-align: left;
                            width: 200px;
                        }
                        .grade-column {
                            width: 60px;
                        }
                        .student-id {
                            font-weight: bold;
                            font-size: 10px;
                        }
                        .student-name {
                            font-size: 11px;
                        }
                        .grade-value {
                            font-weight: bold;
                            font-size: 11px;
                        }
                        .passed {
                            color: green;
                        }
                        .failed {
                            color: red;
                        }
                        .footer {
                            margin-top: 30px;
                            display: flex;
                            justify-content: space-between;
                        }
                        .signature {
                            border-top: 1px solid #000;
                            width: 200px;
                            text-align: center;
                            padding-top: 5px;
                            margin-top: 20px;
                        }
                        @media print {
                            body { margin: 0; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        ${logoBase64 ? `<img src="${logoBase64}" alt="Logo Institución" class="logo">` : ''}
                        <div class="header-content">
                            <div class="institution">INSTITUCIÓN EDUCATIVA</div>
                            <div>PLANILLA DE CALIFICACIONES</div>
                        </div>
                    </div>
                    
                    ${getCourseInfoSection()}
                    <table>
                        <thead>
                            <tr>
                                <th class="student-column">ESTUDIANTE</th>
                                ${assignments.map(assignment =>
                                    `<th class="grade-column">${assignment.name}<br><small>(${assignment.weightPercentage || 0}%)</small></th>`
                                ).join('')}
                                ${includeDefinitiva ? '<th class="grade-column">DEFINITIVA</th>' : ''}
                                <th class="grade-column">OBSERVACIONES</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${students.map(student => {
                                const definitiva = parseFloat(calculateFinal(student.grades));
                                return `
                                    <tr>
                                        <td class="student-column">
                                            <div class="student-id">ID: ${student.student_id}</div>
                                            <div class="student-name">${student.student_name.toUpperCase()}</div>
                                        </td>
                                        ${assignments.map(assignment => {
                                            const grade = student.grades.find(g => g.assignment_id === assignment.id);
                                            return `<td class="grade-column">
                                                <div class="grade-value">${grade ? grade.score.toFixed(1) : '—'}</div>
                                            </td>`;
                                        }).join('')}
                                        ${includeDefinitiva ?
                                            `<td class="grade-column">
                                                <div class="grade-value ${definitiva >= 3 ? 'passed' : 'failed'}">
                                                    ${definitiva.toFixed(2)}
                                                </div>
                                            </td>` : ''
                                        }
                                        <td class="grade-column"></td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                    <div class="footer">
                        <div class="signature">
                            <div>_________________________</div>
                            <div>FIRMA DEL DOCENTE</div>
                        </div>
                        <div class="signature">
                            <div>_________________________</div>
                            <div>COORDINADOR ACADÉMICO</div>
                        </div>
                        <div class="signature">
                            <div>_________________________</div>
                            <div>DIRECTOR(A)</div>
                        </div>
                    </div>
                </body>
            </html>
        `;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.onload = () => {
            handlePrintWithLogo(printWindow);
        };
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-full">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Opciones de Impresión</h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="p-1"
                    >
                        <X size={20} />
                    </Button>
                </div>

                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Selecciona el tipo de planilla que deseas imprimir para el {period}:
                    </p>

                    {/* ✅ Mostrar información del curso si está disponible */}
                    {metadata.courseName && (
                        <div className="bg-blue-50 p-3 rounded-lg text-sm">
                            <div><strong>Curso:</strong> {metadata.courseName}</div>
                            <div><strong>Materia:</strong> {metadata.subjectName}</div>
                            <div><strong>Docente:</strong> {metadata.teacherName}</div>
                        </div>
                    )}

                    {/* Opción 1: Planilla en blanco */}
                    <Card className="cursor-pointer hover:bg-gray-50">
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                                <FileText size={24} className="text-blue-600" />
                                <div className="flex-1">
                                    <h3 className="font-semibold">Planilla en Blanco</h3>
                                    <p className="text-sm text-gray-600">
                                        Solo ID, apellido, nombre y columnas vacías para llenar manualmente
                                    </p>
                                </div>
                            </div>
                            <Button
                                className="w-full mt-3"
                                onClick={generateBlankTemplate}
                                variant="outline"
                            >
                                <Download size={16} className="mr-2" />
                                Imprimir Planilla en Blanco
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Opción 2: Planilla con notas */}
                    <Card className="cursor-pointer hover:bg-gray-50">
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                                <FileText size={24} className="text-green-600" />
                                <div className="flex-1">
                                    <h3 className="font-semibold">Planilla con Notas</h3>
                                    <p className="text-sm text-gray-600">
                                        Incluye todas las calificaciones registradas
                                    </p>
                                </div>
                            </div>
                            
                            {/* Checkbox para incluir definitiva */}
                            <div className="mt-3 flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="includeDefinitiva"
                                    checked={includeDefinitiva}
                                    onChange={(e) => setIncludeDefinitiva(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="includeDefinitiva" className="text-sm">
                                    Incluir columna de definitiva
                                </label>
                            </div>
                            
                            <Button
                                className="w-full mt-3"
                                onClick={generateGradesTemplate}
                                variant="outline"
                            >
                                <Download size={16} className="mr-2" />
                                Imprimir Planilla con Notas
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-6 flex justify-end">
                    <Button variant="outline" onClick={onClose}>
                        Cerrar
                    </Button>
                </div>
            </div>
        </div>
    );
}