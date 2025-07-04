//C:\Users\germa\Desktop\academic_system\frontend\academic-frontend\src\components\admin\StudentDetail\StudentProfile.jsx
import React from "react";

const StudentProfile = ({ student }) => {
    if (!student) return <p>Cargando perfil del estudiante...</p>;

    const {
        first_name,
        middle_name,
        last_name,
        second_last_name,
        email,
        date_of_birth,
        gender,
        neighborhood,
        socioeconomic_status,
        curso,
        photo,
    } = student;

    const fullName = `${first_name} ${middle_name || ""} ${last_name} ${second_last_name || ""}`.trim();

    const gradoNumero = curso?.grado ?? null;
    const cursoNombre = curso?.nombre ?? null;

    const profilePicture = photo || "/default-avatar.png";

    // Función para formatear fecha
    const formatDate = (dateString) => {
        if (!dateString) return "No especificado";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString();
        } catch {
            return dateString;
        }
    };

    const estratoTextoMap = {
        "BAJO": "Estrato 1 (Bajo)",
        "MEDIO-BAJO": "Estrato 2 (Medio-bajo)",
        "MEDIO": "Estrato 3 (Medio)",
        "MEDIO-ALTO": "Estrato 4 (Medio-alto)",
        "ALTO": "Estrato 5 (Alto)",
    };

    const estratoTexto = estratoTextoMap[socioeconomic_status?.toUpperCase()] || socioeconomic_status || "No especificado";

    return (
        <div>
            <h2>👤 Perfil del Estudiante</h2>

            <div style={{ marginBottom: "20px" }}>
                <img
                    src={profilePicture}
                    alt="Foto de perfil"
                    style={{
                        width: "120px",
                        height: "120px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "3px solid #ddd",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                    }}
                />
            </div>

            <ul style={{ listStyle: "none", padding: 0 }}>
                <li style={{ marginBottom: "8px" }}>
                    <strong>Nombre completo:</strong> {fullName}
                </li>
                <li style={{ marginBottom: "8px" }}>
                    <strong>Correo electrónico:</strong> {email || "No especificado"}
                </li>
                <li style={{ marginBottom: "8px" }}>
                    <strong>Fecha de nacimiento:</strong> {formatDate(date_of_birth)}
                </li>
                <li style={{ marginBottom: "8px" }}>
                    <strong>Género:</strong> {gender === "M" ? "Masculino" : gender === "F" ? "Femenino" : "Otro"}
                </li>
                <li style={{ marginBottom: "8px" }}>
                    <strong>Barrio:</strong> {neighborhood || "No especificado"}
                </li>
                <li style={{ marginBottom: "8px" }}>
                    <strong>Estrato socioeconómico:</strong> {estratoTexto}
                </li>
                <li style={{ marginBottom: "8px" }}>
                    <strong>Grado:</strong> {gradoNumero ? `Grado ${gradoNumero}` : "No asignado"}
                </li>
                <li style={{ marginBottom: "8px" }}>
                    <strong>Curso:</strong> {cursoNombre || "No asignado"}
                </li>
            </ul>
        </div>
    );
};

export default StudentProfile;
