//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\admin\StudentDetail\StudentInfo.jsx
import React from "react";

const StudentInfo = ({ student }) => {
  if (!student) return <p>No hay información del estudiante disponible.</p>;

  const fullName = `${student.first_name || ""} ${student.middle_name || ""} ${student.last_name || ""} ${student.second_last_name || ""}`.trim();
  const genderMap = { M: "Masculino", F: "Femenino", O: "Otro" };

  // Mapeo de grados
  const gradoDescripcion = {
    1: "Primero de primaria",
    2: "Segundo de primaria", 
    3: "Tercero de primaria",
    4: "Cuarto de primaria",
    5: "Quinto de primaria",
    6: "Sexto de bachillerato",
    7: "Séptimo de bachillerato",
    8: "Octavo de bachillerato",
    9: "Noveno de bachillerato",
    10: "Décimo de bachillerato",
    11: "Once de bachillerato",
    12: "Doce de bachillerato",
  };

  // Mapeo de estratos socioeconómicos
  const estratoDescripcion = {
    BAJO: "Estrato 1 (Bajo)",
    MEDIO_BAJO: "Estrato 2 (Medio bajo)", 
    MEDIO: "Estrato 3 (Medio)",
    MEDIO_ALTO: "Estrato 4 (Medio alto)",
    ALTO: "Estrato 5 (Alto)",
  };

  console.log("Datos del estudiante:", student);

  return (
    <section className="mb-6">
      <h2>Información General</h2>
      <div>
        <p><strong>Nombre:</strong> {fullName || "No disponible"}</p>
        <p><strong>Correo:</strong> {student.email || "No disponible"}</p>
        <p><strong>Fecha de nacimiento:</strong> {student.date_of_birth || "No registrada"}</p>
        <p>
          <strong>Grado:</strong>{" "}
          {student.curso?.grado 
            ? `${student.curso.grado} (${gradoDescripcion[student.curso.grado] || "No definido"})`
            : "No asignado"
          }
        </p>
        <p><strong>Curso:</strong> {student.curso?.nombre} ({student.curso?.id})</p>
        <p><strong>Género:</strong> {genderMap[student.gender] || "No especificado"}</p>
        <p><strong>Barrio:</strong> {student.neighborhood || "No especificado"}</p>
        <p>
          <strong>Nivel Socioeconómico:</strong>{" "}
          {estratoDescripcion[student.socioeconomic_status] || "No especificado"}
        </p>
      </div>
    </section>
  );
};

export default StudentInfo;