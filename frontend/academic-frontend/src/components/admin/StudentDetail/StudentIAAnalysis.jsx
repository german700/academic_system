//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\admin\StudentDetail\StudentIAAnalysis.jsx
import React from "react";
import AttendanceAnalysis from "./AttendanceAnalysis";
import GradesSummary from "./GradesSummary";
import IAAnalysisContainer from "./IAAnalysisContainer";

const StudentIAAnalysis = ({ data }) => {
  if (!data) {
    return <p className="text-gray-500">No hay análisis IA disponible.</p>;
  }

  return (
    <div className="space-y-6">
      <AttendanceAnalysis attendance={data.attendance} />
      <GradesSummary grades={data.grades_summary} />
      <IAAnalysisContainer
        ia_analysis={data.ia_analysis}
        grades_summary={data.grades_summary}
        student={data.student}
      />
    </div>
  );
};

export default StudentIAAnalysis;