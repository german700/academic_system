import React, { useState, useMemo } from "react";
import { Filter, TrendingUp, Calendar, BookOpen, Clock, Award, AlertCircle } from "lucide-react";

const GradesSummary = ({ grades }) => {
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  // Datos de ejemplo basados en el archivo proporcionado
  const mockGrades = {
    average_overall: 4.73,
    late_submissions: 23,
    average_by_period: {
      "P1": 4.71,
      "P2": 4.75,
      "P3": 4.72,
      "P4": 4.74
    },
    grades_by_subject: {
      "Matemáticas": 4.75,
      "Inglés": 4.71,
      "Lengua": 4.76,
      "Tecnología": 4.69,
      "Primerología": 4.72
    },
    activities: [
      { id: 1, subject: "Matemáticas", name: "Pruebita", type: "TAREA", score: 1, late: false, period: "P1" },
      { id: 2, subject: "Tecnología", name: "Presentación grupal", type: "PROYECTO", score: 4.48, late: false, period: "P1" },
      { id: 3, subject: "Matemáticas", name: "Evaluación escrita", type: "EXAMEN", score: 4.2, late: false, period: "P1" },
      { id: 4, subject: "Matemáticas", name: "Evaluación escrita", type: "EXAMEN", score: 4.97, late: true, period: "P1" },
      { id: 5, subject: "Matemáticas", name: "Aporte en clase", type: "PARTICIPACION", score: 4.77, late: true, period: "P2" },
      { id: 6, subject: "Inglés", name: "Presentación grupal", type: "PROYECTO", score: 4.69, late: false, period: "P4" },
      { id: 7, subject: "Inglés", name: "Quiz sorpresa", type: "QUIZ", score: 4.44, late: false, period: "P4" },
      { id: 8, subject: "Tecnología", name: "Evaluación escrita", type: "EXAMEN", score: 4.84, late: false, period: "P1" },
      { id: 9, subject: "Lengua", name: "Parcial", type: "EXAMEN", score: 4.99, late: false, period: "P3" },
      { id: 10, subject: "Primerología", name: "Investigación guiada", type: "TAREA", score: 4.89, late: false, period: "P1" }
    ]
  };

  const data = grades || mockGrades;

  const getScoreColor = (score) => {
    if (score >= 4.5) return "text-green-600 bg-green-50";
    if (score >= 4.0) return "text-yellow-600 bg-yellow-50";
    if (score >= 3.5) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "EXAMEN": return "📝";
      case "PROYECTO": return "🎯";
      case "TAREA": return "📚";
      case "QUIZ": return "⚡";
      case "PARTICIPACION": return "🗣️";
      default: return "📋";
    }
  };

  const subjects = ["all", ...Object.keys(data.grades_by_subject)];
  const periods = ["all", ...Object.keys(data.average_by_period)];
  const types = ["all", "EXAMEN", "PROYECTO", "TAREA", "QUIZ", "PARTICIPACION"];

  const filteredActivities = useMemo(() => {
    return data.activities.filter(activity => {
      if (selectedSubject !== "all" && activity.subject !== selectedSubject) return false;
      if (selectedPeriod !== "all" && activity.period !== selectedPeriod) return false;
      if (selectedType !== "all" && activity.type !== selectedType) return false;
      return true;
    });
  }, [selectedSubject, selectedPeriod, selectedType, data.activities]);

  const stats = [
    {
      label: "Promedio General",
      value: data.average_overall.toFixed(2),
      icon: <Award className="w-5 h-5" />,
      color: "bg-blue-500"
    },
    {
      label: "Entregas Tardías",
      value: data.late_submissions,
      icon: <Clock className="w-5 h-5" />,
      color: "bg-red-500"
    },
    {
      label: "Total Actividades",
      value: data.activities.length,
      icon: <BookOpen className="w-5 h-5" />,
      color: "bg-green-500"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Rendimiento Académico</h2>
        </div>

        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-gradient-to-r from-white to-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color} text-white`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Promedios por periodo */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Promedios por Periodo
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(data.average_by_period).map(([period, avg]) => (
              <div key={period} className="bg-blue-50 p-3 rounded-lg text-center">
                <p className="text-sm text-blue-600 font-medium">{period}</p>
                <p className="text-xl font-bold text-blue-800">{avg.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Promedios por materia */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Promedios por Materia
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(data.grades_by_subject).map(([subject, avg]) => (
              <div key={subject} className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-green-600 font-medium">{subject}</p>
                <p className="text-xl font-bold text-green-800">{avg.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filtros y actividades */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Actividades Detalladas</h3>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Materia</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {subjects.map(subject => (
                <option key={subject} value={subject}>
                  {subject === "all" ? "Todas las materias" : subject}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Periodo</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {periods.map(period => (
                <option key={period} value={period}>
                  {period === "all" ? "Todos los periodos" : period}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {types.map(type => (
                <option key={type} value={type}>
                  {type === "all" ? "Todos los tipos" : type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista de actividades */}
        <div className="space-y-3">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              <p>No se encontraron actividades con los filtros seleccionados</p>
            </div>
          ) : (
            filteredActivities.map((activity) => (
              <div key={activity.id} className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-400">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getTypeIcon(activity.type)}</span>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        [{activity.subject}] {activity.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {activity.type} • {activity.period}
                        {activity.late && (
                          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                            <Clock className="w-3 h-3 mr-1" />
                            Tarde
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full font-bold ${getScoreColor(activity.score)}`}>
                    {activity.score ?? "Sin nota"}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {filteredActivities.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Mostrando {filteredActivities.length} de {data.activities.length} actividades
          </div>
        )}
      </div>
    </div>
  );
};

export default GradesSummary;