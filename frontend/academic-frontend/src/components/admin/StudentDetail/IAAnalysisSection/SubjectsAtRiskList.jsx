//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\admin\StudentDetail\IAAnalysisSection\SubjectsAtRiskList.jsx
import React from "react";

const SubjectsAtRiskList = ({ atRiskSubjects, underperforming }) => {
  if ((!atRiskSubjects || atRiskSubjects.length === 0) && (!underperforming || underperforming.length === 0)) {
    return <p>No hay materias en riesgo.</p>;
  }

  return (
    <div>
      <h3>Materias en Riesgo</h3>
      <ul>
        {atRiskSubjects && atRiskSubjects.length > 0 && atRiskSubjects.map((subj, i) => (
          <li key={`risk-${i}`} style={{ color: "darkred" }}>{subj}</li>
        ))}
        {underperforming && underperforming.length > 0 && underperforming.map((subj, i) => (
          <li key={`under-${i}`} style={{ color: "orange" }}>{subj}</li>
        ))}
      </ul>
    </div>
  );
};

export default SubjectsAtRiskList;
