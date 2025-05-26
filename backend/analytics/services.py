import pandas as pd
from academic.models import GradeEntry

def generar_informe_narrativo(data):
    """
    Genera un informe narrativo basado en los datos de rendimiento del estudiante.
    
    Args:
        data (dict): Datos del análisis de rendimiento
        
    Returns:
        str: Informe narrativo formateado
    """
    texto = []
    
    promedio = data["promedio_general"]
    if promedio >= 4.5:
        calificacion_texto = "excelente"
        emoji = "🌟"
    elif promedio >= 4.0:
        calificacion_texto = "muy bueno"
        emoji = "😊"
    elif promedio >= 3.5:
        calificacion_texto = "satisfactorio"
        emoji = "👍"
    elif promedio >= 3.0:
        calificacion_texto = "básico"
        emoji = "⚠️"
    else:
        calificacion_texto = "necesita mejorar"
        emoji = "🔴"
    
    texto.append(f"{emoji} El rendimiento académico general es {calificacion_texto} con un promedio ponderado de {promedio:.2f} en escala de 1 a 5.")
    
    periodos = data["resumen_por_periodo"]
    if len(periodos) > 1:
        p1 = next((p["nota"] for p in periodos if p["periodo"] == 1), None)
        p2 = next((p["nota"] for p in periodos if p["periodo"] == 2), None)
        
        if p1 is not None and p2 is not None:
            diferencia = p2 - p1
            if diferencia > 0.3:
                texto.append(f"📈 Se observa una mejora significativa del periodo 1 ({p1:.2f}) al periodo 2 ({p2:.2f}), con un incremento de {diferencia:.2f} puntos.")
            elif diferencia < -0.3:
                texto.append(f"📉 Se detecta una disminución del periodo 1 ({p1:.2f}) al periodo 2 ({p2:.2f}), con una reducción de {abs(diferencia):.2f} puntos.")
            else:
                texto.append(f"📊 El desempeño se mantiene estable entre el periodo 1 ({p1:.2f}) y el periodo 2 ({p2:.2f}).")
    
    niveles = data["niveles_desempeno"]
    total_evaluaciones = data["total_evaluaciones"]
    niveles_texto = []
    for nivel, cantidad in niveles.items():
        if cantidad > 0:
            porcentaje = (cantidad / total_evaluaciones) * 100
            niveles_texto.append(f"{nivel}: {cantidad} ({porcentaje:.1f}%)")
    
    if niveles_texto:
        texto.append(f"📊 Distribución del desempeño: {', '.join(niveles_texto)}.")
    
    bajas = data["materias_con_bajo_rendimiento"]
    if bajas:
        if len(bajas) == 1:
            texto.append(f"⚠️ Se requiere atención especial en {bajas[0]}, que presenta bajo rendimiento.")
        else:
            texto.append(f"⚠️ Se requiere atención especial en las siguientes materias con bajo rendimiento: {', '.join(bajas)}.")
    else:
        texto.append("✅ Todas las materias muestran un rendimiento satisfactorio o superior.")
    
    porcentaje_tardias = data.get("porcentaje_tardias", 0)
    if porcentaje_tardias > 0.1:
        texto.append(f"⏰ El {porcentaje_tardias*100:.1f}% de las entregas fueron tardías, lo que sugiere la necesidad de mejorar la gestión del tiempo.")
    
    recomendaciones = data["recomendaciones"]
    if recomendaciones:
        texto.append(f"💡 Recomendaciones principales: {' '.join(recomendaciones)}")
    
    if promedio >= 4.0:
        texto.append("🎯 ¡Continúa con este excelente trabajo y mantén la constancia en tus estudios!")
    elif promedio >= 3.5:
        texto.append("🎯 Con un poco más de esfuerzo y dedicación, podrás alcanzar un nivel de excelencia.")
    else:
        texto.append("🎯 Es importante implementar las recomendaciones sugeridas para mejorar el rendimiento académico.")
    
    return " ".join(texto)


def analizar_rendimiento_estudiante(student):
    entries = GradeEntry.objects.filter(
        student=student
    ).select_related(
        'assignment', 'assignment__course_subject', 'assignment__course_subject__subject'
    )

    if not entries.exists():
        return {
            "mensaje": "No hay datos suficientes para analizar.",
            "informe_narrativo": "No se encontraron registros de calificaciones para este estudiante."
        }

    data = []
    for entry in entries:
        assignment = entry.assignment
        subject = assignment.course_subject.subject
        nota = round((float(entry.score) / float(assignment.max_score)) * 5.0, 2)
        data.append({
            "materia": subject.name,
            "tipo": assignment.assignment_type,
            "periodo": assignment.period,
            "peso": assignment.weight,
            "nota": nota,
            "tarde": entry.late_submission,
        })
    
    df = pd.DataFrame(data)
    df["ponderado"] = df["nota"] * df["peso"]
    promedio_general = round(df["ponderado"].sum() / df["peso"].sum(), 2)
    
    materias = df.groupby("materia")["nota"].mean().round(2).reset_index()
    materias_dict = materias.to_dict(orient="records")
    
    bajas = df[df["nota"] < 3.0]["materia"].unique().tolist()
    
    periodos_df = df.groupby("periodo")["nota"].mean().round(2).reset_index()
    periodos = periodos_df.to_dict(orient="records")
    
    def clasificar_nivel(nota):
        if nota < 3.0:
            return "Bajo"
        elif nota < 4.0:
            return "Básico"
        elif nota <= 4.5:
            return "Alto"
        else:
            return "Superior"
    
    df["nivel"] = df["nota"].apply(clasificar_nivel)
    niveles = df["nivel"].value_counts().to_dict()
    niveles_completos = {
        nivel: niveles.get(nivel, 0) 
        for nivel in ["Bajo", "Básico", "Alto", "Superior"]
    }

    recomendaciones = []
    if promedio_general < 3.5:
        recomendaciones.append("Se recomienda revisar y mejorar los hábitos de estudio.")
    
    porcentaje_tardias = df["tarde"].mean()
    if porcentaje_tardias > 0.25:
        recomendaciones.append(f"Hay un {porcentaje_tardias*100:.1f}% de entregas tardías. Se sugiere mejorar la gestión del tiempo.")
    
    if len(bajas) >= 2:
        recomendaciones.append("Se necesita refuerzo académico en varias materias clave.")
    
    if promedio_general >= 4.5:
        recomendaciones.append("¡Excelente rendimiento! Continúa con el buen trabajo.")

    informe_narrativo = generar_informe_narrativo({
        "promedio_general": promedio_general,
        "materias_con_bajo_rendimiento": bajas,
        "resumen_por_periodo": periodos,
        "niveles_desempeno": niveles_completos,
        "recomendaciones": recomendaciones,
        "porcentaje_tardias": porcentaje_tardias,
        "total_evaluaciones": len(df)
    })

    return {
        "promedio_general": promedio_general,
        "promedios_por_materia": materias_dict,
        "materias_con_bajo_rendimiento": bajas,
        "resumen_por_periodo": periodos,
        "niveles_desempeno": niveles_completos,
        "recomendaciones": recomendaciones,
        "informe_narrativo": informe_narrativo,
        "estadisticas_adicionales": {
            "total_evaluaciones": len(df),
            "porcentaje_entregas_tardias": round(porcentaje_tardias * 100, 1),
            "mejor_materia": materias.loc[materias["nota"].idxmax(), "materia"] if not materias.empty else None,
            "peor_materia": materias.loc[materias["nota"].idxmin(), "materia"] if not materias.empty else None
        }
    }
