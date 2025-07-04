//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\admin\TeacherDetail\PersonalInfo.jsx
// src/components/admin/TeacherDetail/PersonalInfo.jsx
import React from "react";

const PersonalInfo = ({ docente }) => {
  const {
    first_name,
    middle_name,
    last_name,
    second_last_name,
    title,
    email,
    specialization,
    date_of_birth,
    profile_picture,
  } = docente;

  const fullName = `${first_name} ${middle_name || ""} ${last_name} ${second_last_name || ""}`.trim();

  return (
    <div className="flex items-center gap-6">
      <img
        src={profile_picture || "/default-avatar.png"}
        alt={fullName}
        className="w-24 h-24 rounded-full object-cover border border-gray-300 shadow"
      />
      <div>
        <h2 className="text-xl font-semibold text-gray-800">{fullName}</h2>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-sm">{email}</p>
        <p className="text-sm">Especialización: {specialization}</p>
        <p className="text-sm">Fecha de nacimiento: {date_of_birth}</p>
      </div>
    </div>
  );
};

export default PersonalInfo; 
