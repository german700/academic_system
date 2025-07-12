import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../shared/ui/card";
import PeriodComparisonChart from "./PeriodComparisonChart";
import SiblingCoursesChart from "./SiblingCoursesChart";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList } from 'recharts';
import { TrendingUp, Users, Target, Award, AlertTriangle } from "lucide-react";

const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#0088FE', '#8884D8'];

const PrintCourseAnalysis = ({ analysis, metadata, period }) => {
    // Función para redondear porcentajes
    const roundToOneDecimal = (num) => Math.round(num * 10) / 10;
    
    // Preparamos los datos para Pie y Bar con porcentajes redondeados
    const performanceData = [
        {
            name: 'Alto rendimiento',
            value: roundToOneDecimal(analysis.highPerformancePct),
            color: COLORS[0],
        },
        {
            name: 'Rendimiento medio',
            value: roundToOneDecimal(Math.max(0, 100 - analysis.highPerformancePct - analysis.lowPerformancePct)),
            color: COLORS[1],
        },
        {
            name: 'Bajo rendimiento',
            value: roundToOneDecimal(analysis.lowPerformancePct),
            color: COLORS[2],
        }
    ].filter(d => d.value > 0);

    const evaluationTypesData = Object.entries(analysis.promediosPorTipoCurso || {}).map(
        ([tipo, prom], i) => ({ tipo: tipo.replace(/_/g, ' '), promedio: prom, fill: COLORS[i % COLORS.length] })
    );

    const totalStudents = analysis.studentReports?.length || 0;
    const studentsWithData = analysis.studentReports?.filter(s => s.promedio_general != null).length || 0;
    const avgAttendance = analysis.avgAsistenciaPeriodo || analysis.avgAsistenciaCurso || 0;

    const attendanceStatus = avgAttendance >= 0.8 ? 'Excelente' : avgAttendance >= 0.6 ? 'Buena' : 'Necesita atención';

    return (
        <div
            className="printable-content bg-white font-sans text-gray-900 leading-relaxed"
            style={{
                width: '210mm',
                minHeight: '297mm',
                padding: '20mm',
                margin: '0 auto',
                boxSizing: 'border-box',
                fontSize: '12px',
                lineHeight: '1.4'
            }}
        >
            {/* Encabezado con Logo */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-gray-200">
                <div className="flex items-center space-x-4">
                    <img
                        src="/logo.png"
                        alt="Logo Institucional"
                        className="w-16 h-16 object-contain"
                        style={{ maxWidth: '64px', maxHeight: '64px' }}
                        onError={(e) => { e.target.style.display = 'none' }}
                    />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-1">
                            Análisis General del Curso
                        </h1>
                        <p className="text-lg font-semibold text-blue-600">
                            {metadata.subjectName} — {metadata.courseName}
                        </p>
                    </div>
                </div>
                <div className="text-right text-sm text-gray-600">
                    <p className="font-medium">Periodo {period}</p>
                    <p>Generado: {new Date().toLocaleDateString("es-CO", {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}</p>
                </div>
            </div>

            {/* Resumen Ejecutivo */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-blue-500" />
                    Resumen Ejecutivo
                </h2>
                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-800">Promedio Real</p>
                                <p className="text-2xl font-bold text-blue-600">{analysis.realAverage}</p>
                            </div>
                            <TrendingUp className="h-6 w-6 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-800">Promedio IA</p>
                                <p className="text-2xl font-bold text-purple-600">{analysis.iaAverage}</p>
                            </div>
                            <Target className="h-6 w-6 text-purple-500" />
                        </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-800">Estudiantes</p>
                                <p className="text-2xl font-bold text-green-600">{studentsWithData}/{totalStudents}</p>
                                <p className="text-xs text-green-600">con datos</p>
                            </div>
                            <Users className="h-6 w-6 text-green-500" />
                        </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-yellow-800">Asistencia</p>
                                <p className="text-2xl font-bold text-yellow-600">{Math.round(avgAttendance * 100)}%</p>
                                <p className="text-xs text-yellow-600">{attendanceStatus}</p>
                            </div>
                            <Award className="h-6 w-6 text-yellow-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Análisis de Rendimiento */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                    Análisis de Rendimiento
                </h2>
                <div className="grid grid-cols-2 gap-6">
                    {/* Gráfico de distribución con tamaño controlado */}
                    <div className="bg-gray-50 p-4 rounded-lg border">
                        <h3 className="font-semibold text-gray-700 mb-3">Distribución de Rendimiento</h3>
                        <div style={{ width: '100%', height: '180px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={performanceData}
                                        cx="50%" 
                                        cy="50%"
                                        labelLine={false}
                                        label={({ value }) => `${value}%`}
                                        outerRadius={60}
                                        innerRadius={0}
                                        dataKey="value"
                                        labelStyle={{
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            fill: '#000'
                                        }}
                                    >
                                        {performanceData.map((entry, idx) => (
                                            <Cell key={idx} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `${value}%`} />
                                    <Legend 
                                        layout="vertical" 
                                        verticalAlign="middle" 
                                        align="right"
                                        wrapperStyle={{ 
                                            fontSize: '10px',
                                            paddingLeft: '10px'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Estadísticas de rendimiento */}
                    <div className="space-y-3">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-green-800">Alto Rendimiento</p>
                                    <p className="text-sm text-green-600">Promedio ≥ 4.0</p>
                                </div>
                                <p className="text-2xl font-bold text-green-600">{roundToOneDecimal(analysis.highPerformancePct)}%</p>
                            </div>
                        </div>

                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-yellow-800">Rendimiento Medio</p>
                                    <p className="text-sm text-yellow-600">Promedio 3.0 - 3.9</p>
                                </div>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {roundToOneDecimal(Math.max(0, 100 - analysis.highPerformancePct - analysis.lowPerformancePct))}%
                                </p>
                            </div>
                        </div>

                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-red-800">Necesitan Atención</p>
                                    <p className="text-sm text-red-600">Promedio &lt; 3.0</p>
                                </div>
                                <p className="text-2xl font-bold text-red-600">{roundToOneDecimal(analysis.lowPerformancePct)}%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Promedios por tipo de evaluación con etiquetas */}
            {evaluationTypesData.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Promedios por Tipo de Evaluación</h2>
                    <div className="bg-gray-50 p-4 rounded-lg border">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={evaluationTypesData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="tipo"
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                    fontSize={10}
                                />
                                <YAxis domain={[0, 5]} fontSize={10} />
                                <Tooltip />
                                <Bar dataKey="promedio" radius={[4, 4, 0, 0]}>
                                    <LabelList 
                                        dataKey="promedio" 
                                        position="top" 
                                        formatter={(value) => value.toFixed(2)}
                                        style={{ fontSize: '10px', fontWeight: 'bold' }}
                                    />
                                    {evaluationTypesData.map((entry, i) => (
                                        <Cell key={i} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Comparativa entre periodos */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Comparativa entre Periodos</h2>
                <div className="bg-gray-50 p-4 rounded-lg border">
                    <PeriodComparisonChart
                        data={analysis.periodComparisons}
                        courseName={metadata.courseName}
                        subjectName={metadata.subjectName}
                    />
                </div>
            </div>

            {/* Cursos hermanos */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Comparación con Cursos Similares</h2>
                <div className="bg-gray-50 p-4 rounded-lg border">
                    <SiblingCoursesChart
                        data={analysis.siblingCourses}
                        currentCourseId={metadata.courseId}
                        currentCourseName={metadata.courseName}
                    />
                </div>
            </div>

            {/* Resumen por estudiante */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-blue-500" />
                    Resumen por Estudiante
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700">
                                    Estudiante
                                </th>
                                <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-700">
                                    Promedio
                                </th>
                                <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-700">
                                    Riesgo IA
                                </th>
                                <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-700">
                                    Entregas Tardías
                                </th>
                                <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-700">
                                    Estado
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {analysis.studentReports.map((s, i) => {
                                const riesgoPct = s.prediccion_riesgo?.riesgo != null
                                    ? (s.prediccion_riesgo.riesgo * 100).toFixed(1) + '%'
                                    : '-';
                                const promedio = s.promedio_general != null ? s.promedio_general.toFixed(2) : '-';
                                const isHighRisk = s.prediccion_riesgo?.riesgo > 0.7;
                                const isLowGrade = s.promedio_general != null && s.promedio_general < 3.0;

                                return (
                                    <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                        <td className="border border-gray-300 px-3 py-2 font-medium">
                                            {s.student_name}
                                        </td>
                                        <td className={`border border-gray-300 px-3 py-2 text-center font-semibold ${isLowGrade ? 'text-red-600' : 'text-green-600'
                                            }`}>
                                            {promedio}
                                        </td>
                                        <td className={`border border-gray-300 px-3 py-2 text-center font-semibold ${isHighRisk ? 'text-red-600' : 'text-green-600'
                                            }`}>
                                            {riesgoPct}
                                        </td>
                                        <td className="border border-gray-300 px-3 py-2 text-center">
                                            {s.entregas_tardias ?? '-'}
                                        </td>
                                        <td className={`border border-gray-300 px-3 py-2 text-center font-medium ${isHighRisk || isLowGrade ? 'text-red-600' : 'text-green-600'
                                            }`}>
                                            {isHighRisk || isLowGrade ? 'Requiere atención' : 'Satisfactorio'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pie de página */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
                <p>Este reporte fue generado automáticamente por el Sistema de Gestión Académica</p>
                <p className="mt-1">© 2024 - Todos los derechos reservados</p>
            </div>

            {/* Estilos CSS específicos para impresión */}
            <style>{`
    @media print {
        .printable-content {
            margin: 0 !important;
            padding: 15mm !important;
            box-shadow: none !important;
            font-size: 11px !important;
            line-height: 1.3 !important;
        }
        
        .grid {
            display: grid !important;
            page-break-inside: avoid;
        }
        
        .grid-cols-4 {
            grid-template-columns: repeat(4, 1fr) !important;
        }
        
        .grid-cols-2 {
            grid-template-columns: repeat(2, 1fr) !important;
        }
        
        table {
            page-break-inside: avoid;
            font-size: 10px !important;
        }
        
        .mb-8 {
            margin-bottom: 1.5rem !important;
            page-break-inside: avoid;
        }
        
        h1, h2, h3 {
            page-break-after: avoid;
        }
        
        .bg-gray-50,
        .bg-blue-50,
        .bg-purple-50,
        .bg-green-50,
        .bg-yellow-50,
        .bg-red-50 {
            background-color: #f9f9f9 !important;
            border: 1px solid #e5e5e5 !important;
        }
        
        .text-blue-600,
        .text-purple-600,
        .text-green-600,
        .text-yellow-600,
        .text-red-600 {
            color: #333 !important;
        }
        
        .border-blue-200,
        .border-purple-200,
        .border-green-200,
        .border-yellow-200,
        .border-red-200 {
            border-color: #ccc !important;
        }
        
        /* Estilos específicos para el gráfico de torta en impresión */
        .recharts-pie-chart {
            max-width: 180px !important;
            max-height: 180px !important;
        }
        
        .recharts-legend-wrapper {
            font-size: 9px !important;
        }
    }
`}</style>
        </div>
    );
};

export default PrintCourseAnalysis;