import React from "react";

const IARecommendation = ({ data }) => {
  if (!data) return null;

  const { riesgo, confianza, materias_con_riesgo = [], mensaje, promedio_notas, asistencia, entregas_tardias, edad, estrato } = data;

  // Banco de recomendaciones basado en condiciones
  const generarRecomendaciones = () => {
    const recomendaciones = [];

    // Riesgo bajo
    if (riesgo <= 0.4) {
      recomendaciones.push(
        "El estudiante mantiene un rendimiento estable. Se recomienda seguir reforzando hábitos positivos de estudio.",
        "La asistencia es adecuada y su participación es buena. Continuar monitoreando sin necesidad de intervención."
      );
    }

    // Riesgo medio
    if (riesgo > 0.4 && riesgo <= 0.7) {
      recomendaciones.push(
        "Se observan fluctuaciones en el rendimiento. Puede ser útil realizar tutorías o seguimiento en las materias claves.",
        "Una revisión de los métodos de evaluación puede ayudar a identificar oportunidades de mejora.",
      );
      if (entregas_tardias > 0) {
        recomendaciones.push("Se han detectado entregas tardías. Reforzar la organización del tiempo y planificación de tareas.");
      }
    }

    // Riesgo alto
    if (riesgo > 0.7) {
      recomendaciones.push(
        "Existe un alto riesgo académico. Se recomienda una intervención inmediata con el docente y/o acudiente.",
        "El promedio general es bajo, lo que sugiere la necesidad de apoyo personalizado en las materias críticas."
      );
    }

    // Materias en riesgo
    if (materias_con_riesgo.length > 0) {
      recomendaciones.push(`Se ha identificado riesgo académico en las siguientes materias: ${materias_con_riesgo.join(", ")}.`);
    }

    // Estrato y edad
    if (estrato >= 4 && promedio_notas < 3) {
      recomendaciones.push("Aunque el estudiante pertenece a un nivel socioeconómico alto, su rendimiento es bajo. Puede haber desmotivación o falta de hábitos.");
    }

    if (edad <= 7) {
      recomendaciones.push("Dado que el estudiante es muy joven, es importante reforzar aspectos emocionales y pedagógicos en casa y clase.");
    }

    // Asistencia
    if (asistencia < 0.9) {
      recomendaciones.push("La asistencia es irregular. Se recomienda investigar causas y promover mayor presencia en clase.");
    }

    if (recomendaciones.length === 0) {
      recomendaciones.push("El análisis no detectó problemas significativos. Continuar monitoreando el progreso del estudiante.");
    }

    return recomendaciones;
  };

  const recomendaciones = generarRecomendaciones();

  return (
    <div className="my-6">
      <h3 className="text-lg font-semibold mb-2">🎯 Recomendaciones de IA</h3>

      <div className="space-y-2 text-gray-800">
        {recomendaciones.map((rec, index) => (
          <p key={index}>• {rec}</p>
        ))}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Índice de riesgo:</strong> {(riesgo * 100).toFixed(1)}%</p>
        <p><strong>Confianza del modelo:</strong> {(confianza * 100).toFixed(0)}%</p>
      </div>
    </div>
  );
};

export default IARecommendation;
