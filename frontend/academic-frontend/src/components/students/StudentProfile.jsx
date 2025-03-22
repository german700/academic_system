import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obtenerPerfilEstudiante } from "../services/estudiantesService";

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const data = await obtenerPerfilEstudiante(id);
        console.log("📌 Perfil del estudiante cargado:", data); // Debug
        setPerfil(data);
      } catch (error) {
        console.error("❌ Error al cargar perfil:", error);
      }
    };
    cargarPerfil();
  }, [id]);

  if (!perfil) return <div>Cargando perfil del estudiante...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        {perfil.first_name} {perfil.last_name}
      </h1>
      <p>
        <strong>Curso:</strong> {perfil.curso ? `${perfil.curso.nombre} - Grado ${perfil.curso.grado}` : "No asignado"}
      </p>
      
      <h2 className="text-xl font-bold mt-4">Materias cursadas:</h2>
      {perfil.materias.length > 0 ? (
        <ul>
          {perfil.materias.map((mat) => (
            <li key={mat.id}>
              {mat.nombre} (Código: {mat.codigo})
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay materias registradas.</p>
      )}

      {/* Botón para ir a análisis con IA */}
      <button onClick={() => navigate("/analisis")} className="mt-4 p-2 bg-blue-500 text-white">
        Ir al Análisis de Desempeño
      </button>
    </div>
  );
};

export default StudentProfile;
