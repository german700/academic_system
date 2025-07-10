// src/components/admin/TeacherDetail/PersonalInfo.jsx
import React from "react";
import "./TeacherDetail_css/PersonalInfo.css";

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
    <div className="personal-info-container">
      <img
        src={profile_picture || "/default-avatar.png"}
        alt={fullName}
        className="profile-picture"
      />
      <div className="info-text">
        <h2>{fullName}</h2>
        <p>{title}</p>
        <p>{email}</p>
        <p>Especialización: {specialization}</p>
        <p>Fecha de nacimiento: {date_of_birth}</p>
      </div>
    </div>
  );
};

export default PersonalInfo;
