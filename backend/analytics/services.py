#C:\Users\germa\Desktop\academic_system\backend\analytics\services.py
import pandas as pd
import numpy as np
import math
import pickle
import logging
from pathlib import Path
from typing import Dict, List, Optional, Union
from django.conf import settings
from django.core.cache import cache
from academic.models import GradeEntry, Student

# Configurar logging
logger = logging.getLogger(__name__)

class MLModelHandler:
    """Manejador singleton para el modelo de ML y encoder"""
    
    _instance = None
    _modelo = None
    _encoder = None
    _modelo_disponible = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._cargar_modelo()
        return cls._instance
    
    def _cargar_modelo(self):
        """Carga el modelo y encoder una sola vez"""
        try:
            modelo_path = Path(settings.BASE_DIR) / "analytics" / "ml_model" / "modelo_riesgo.h5"
            encoder_path = Path(settings.BASE_DIR) / "analytics" / "ml_model" / "encoder.pkl"
            dataset_path = Path(settings.BASE_DIR) / "analytics" / "ml_model" / "dataset.csv"
            
            # Cargar modelo
            if modelo_path.exists():
                from tensorflow.keras.models import load_model
                self._modelo = load_model(str(modelo_path))
                logger.info("Modelo ML cargado exitosamente")
            else:
                raise FileNotFoundError(f"Modelo no encontrado en {modelo_path}")
            
            # Cargar encoder
            if encoder_path.exists():
                with open(encoder_path, 'rb') as f:
                    self._encoder = pickle.load(f)
                logger.info("Encoder cargado desde archivo pickle")
            elif dataset_path.exists():
                # Fallback: crear encoder desde dataset
                from sklearn.preprocessing import OneHotEncoder
                df = pd.read_csv(dataset_path)
                self._encoder = OneHotEncoder(sparse_output=False, handle_unknown="ignore")
                self._encoder.fit(df[["subject", "course"]])
                
                # Guardar encoder para próximas ejecuciones
                with open(encoder_path, 'wb') as f:
                    pickle.dump(self._encoder, f)
                logger.info("Encoder creado y guardado desde dataset")
            else:
                raise FileNotFoundError("No se encontró encoder ni dataset para entrenar")
            
            self._modelo_disponible = True
            
        except Exception as e:
            logger.error(f"Error cargando modelo ML: {e}")
            self._modelo = None
            self._encoder = None
            self._modelo_disponible = False
    
    @property
    def modelo_disponible(self) -> bool:
        return self._modelo_disponible
    
    @property
    def modelo(self):
        return self._modelo
    
    @property
    def encoder(self):
        return self._encoder


def predecir_riesgo_estudiante(entries_or_student) -> Dict[str, Union[float, str, List[str], None]]:
    """
    Predice el riesgo académico de un estudiante usando el modelo ML.
    
    Args:
        entries_or_student: Puede ser:
            - Instancia del modelo Student (comportamiento original)
            - QuerySet de GradeEntry (nuevo comportamiento para análisis específico)
        
    Returns:
        dict: Diccionario con la predicción de riesgo y información adicional
    """
    from academic.models import Student, GradeEntry
    
    # Obtener instancia del manejador de ML
    ml_handler = MLModelHandler()
    
    if not ml_handler.modelo_disponible:
        return {
            "riesgo": None, 
            "mensaje": "Modelo de predicción no disponible",
            "materias_con_riesgo": [],
            "confianza": None
        }
    
    # Determinar si se recibió un Student o un QuerySet de GradeEntry
    if isinstance(entries_or_student, Student):
        # Comportamiento original - tomar todas las entries del estudiante
        student = entries_or_student
        entries = GradeEntry.objects.filter(
            student=student,
            assignment__course_subject__course=student.course
        ).select_related(
            'assignment', 'assignment__course_subject', 'assignment__course_subject__subject'
        )

        cache_key = f"analisis_completo_{student.id}"
    else:
        # Nuevo comportamiento - usar las entries filtradas que se pasaron
        entries = entries_or_student.select_related(
            "assignment__course_subject__subject",
            "assignment__course_subject", 
            "assignment"
        )
        student = entries.first().student if entries.exists() else None
        
        # Cache key específico para análisis filtrado
        if student and entries.exists():
            # Crear cache key basado en el student y los IDs de las entries
            entry_ids = list(entries.values_list('id', flat=True))
            cache_key = f"analisis_filtrado_{student.id}_{hash(tuple(entry_ids))}"
        else:
            cache_key = None
    
    # Verificar cache si hay una key válida
    cached_result = None
    if cache_key:
        cached_result = cache.get(cache_key)
        if cached_result:
            return cached_result
    
    if not entries.exists():
        return {
            "riesgo": None, 
            "mensaje": "No hay datos suficientes",
            "materias_con_riesgo": [],
            "confianza": None
        }
    
    try:
        data = []
        for entry in entries:
            if not entry.assignment or not entry.assignment.course_subject:
                continue
                
            # Calcular nota normalizada (0-5)
            nota_normalizada = round((float(entry.score) / float(entry.assignment.max_score)) * 5.0, 2)
            
            data.append({
                "subject": entry.assignment.course_subject.subject.name,
                "course": student.course.name if student and student.course else "Sin curso",
                "grade": nota_normalizada,
                "late": int(entry.late_submission),
                "period": entry.assignment.period,
            })
        
        if not data:
            return {
                "riesgo": None, 
                "mensaje": "No hay datos válidos para procesar",
                "materias_con_riesgo": [],
                "confianza": None
            }
        
        df = pd.DataFrame(data)
        
        # Preparar datos para el modelo
        try:
            # Codificar variables categóricas
            subject_encoded = ml_handler.encoder.transform(df[["subject", "course"]])
            
            # Preparar features numéricas
            numeric_features = df[["grade", "late", "period"]].values
            
            # Combinar features
            X = np.concatenate([subject_encoded, numeric_features], axis=1)
            
            # Realizar predicción
            predicciones = ml_handler.modelo.predict(X, verbose=0)
            riesgo_promedio = float(np.mean(predicciones))
            
            # Calcular confianza basada en la desviación estándar
            confianza = 1.0 - min(float(np.std(predicciones)), 1.0)
            
            # Identificar materias con riesgo
            materias_riesgo = []
            for i, pred in enumerate(predicciones.flatten()):
                if pred > 0.6 and df.iloc[i]["grade"] < 3.5:
                    materias_riesgo.append(df.iloc[i]["subject"])
            
            # Eliminar duplicados manteniendo orden
            materias_riesgo = list(dict.fromkeys(materias_riesgo))
            
            resultado = {
                "riesgo": round(riesgo_promedio, 3),
                "confianza": round(confianza, 3),
                "materias_con_riesgo": materias_riesgo,
                "mensaje": "Predicción realizada exitosamente",
                "total_evaluaciones": len(data),
                "promedio_notas": round(df["grade"].mean(), 2),
                "student_id": student.id if student else None,
                "tipo_analisis": "completo" if isinstance(entries_or_student, Student) else "filtrado"
            }
            
            # Cachear resultado por 1 hora (solo si hay cache_key)
            if cache_key:
                cache.set(cache_key, resultado, 3600)
            
            return resultado
            
        except Exception as encoding_error:
            logger.error(f"Error en codificación de datos: {encoding_error}")
            return {
                "riesgo": None,
                "mensaje": f"Error en procesamiento de datos: {str(encoding_error)}",
                "materias_con_riesgo": [],
                "confianza": None
            }
            
    except Exception as e:
        logger.error(f"Error general en predicción: {e}")
        return {
            "riesgo": None,
            "mensaje": f"Error en predicción: {str(e)}",
            "materias_con_riesgo": [],
            "confianza": None
        }


def interpretar_riesgo(riesgo: float) -> Dict[str, str]:
    """
    Interpreta el nivel de riesgo y proporciona recomendaciones.
    
    Args:
        riesgo: Valor de riesgo entre 0 y 1
        
    Returns:
        dict: Interpretación y recomendaciones
    """
    if riesgo >= 0.8:
        return {
            "nivel": "CRÍTICO",
            "descripcion": "Riesgo muy alto de fracaso académico",
            "emoji": "🚨",
            "color": "red",
            "recomendacion": "Se requiere intervención inmediata del equipo académico y apoyo personalizado."
        }
    elif riesgo >= 0.6:
        return {
            "nivel": "ALTO",
            "descripcion": "Riesgo considerable de bajo rendimiento",
            "emoji": "⚠️",
            "color": "orange",
            "recomendacion": "Se sugiere tutoría académica y seguimiento cercano del progreso."
        }
    elif riesgo >= 0.4:
        return {
            "nivel": "MODERADO",
            "descripcion": "Riesgo moderado que requiere atención",
            "emoji": "🔶",
            "color": "yellow",
            "recomendacion": "Se recomienda refuerzo en materias específicas y mejora de hábitos de estudio."
        }
    elif riesgo >= 0.2:
        return {
            "nivel": "BAJO",
            "descripcion": "Riesgo bajo con seguimiento preventivo",
            "emoji": "✅",
            "color": "lightgreen",
            "recomendacion": "Mantener el buen trabajo y continuar con estrategias de estudio actuales."
        }
    else:
        return {
            "nivel": "MÍNIMO",
            "descripcion": "Riesgo mínimo, excelente desempeño",
            "emoji": "🌟",
            "color": "green",
            "recomendacion": "¡Excelente trabajo! Continúa con tu dedicación y ayuda a compañeros si es posible."
        }


def generar_informe_narrativo_mejorado(data: Dict) -> str:
    """
    Genera un informe narrativo mejorado basado en los datos de rendimiento del estudiante.
    
    Args:
        data: Datos del análisis de rendimiento
        
    Returns:
        str: Informe narrativo formateado y mejorado
    """
    texto = []
    
    # Análisis del promedio general
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
        calificacion_texto = "necesita mejorar urgentemente"
        emoji = "🔴"
    
    texto.append(f"{emoji} **Rendimiento Académico General**: {calificacion_texto.title()} con un promedio ponderado de **{promedio:.2f}** en escala de 1 a 5.")
    
    # Análisis de riesgo ML con mayor detalle
    if "prediccion_riesgo" in data and data["prediccion_riesgo"].get("riesgo") is not None:
        riesgo_data = data["prediccion_riesgo"]
        riesgo = riesgo_data["riesgo"]
        confianza = riesgo_data.get("confianza", 0)
        interpretacion = interpretar_riesgo(riesgo)
        
        texto.append(f"{interpretacion['emoji']} **Análisis de Riesgo IA**: {interpretacion['nivel']} ({riesgo:.2f}) - {interpretacion['descripcion']} (Confianza: {confianza:.2f}).")
        texto.append(f"💡 **Recomendación IA**: {interpretacion['recomendacion']}")
        
        if riesgo_data["materias_con_riesgo"]:
            materias_riesgo = ", ".join(riesgo_data["materias_con_riesgo"])
            texto.append(f"🎯 **Materias de Atención Prioritaria**: {materias_riesgo}.")
    
    # Análisis de tendencias por período
    periodos = data.get("resumen_por_periodo", [])
    if len(periodos) > 1:
        periodos_ordenados = sorted(periodos, key=lambda x: x["periodo"])
        tendencia = []
        
        for i in range(len(periodos_ordenados) - 1):
            p_actual = periodos_ordenados[i]
            p_siguiente = periodos_ordenados[i + 1]
            diferencia = p_siguiente["nota"] - p_actual["nota"]
            
            if diferencia > 0.3:
                tendencia.append(f"📈 **Mejora significativa** del periodo {p_actual['periodo']} ({p_actual['nota']:.2f}) al {p_siguiente['periodo']} ({p_siguiente['nota']:.2f}): +{diferencia:.2f} puntos")
            elif diferencia < -0.3:
                tendencia.append(f"📉 **Declive preocupante** del periodo {p_actual['periodo']} ({p_actual['nota']:.2f}) al {p_siguiente['periodo']} ({p_siguiente['nota']:.2f}): {diferencia:.2f} puntos")
            else:
                tendencia.append(f"📊 **Estabilidad** entre periodo {p_actual['periodo']} ({p_actual['nota']:.2f}) y {p_siguiente['periodo']} ({p_siguiente['nota']:.2f})")
        
        if tendencia:
            texto.extend(tendencia)
    
    # Análisis detallado de distribución de desempeño
    niveles = data.get("niveles_desempeno", {})
    total_evaluaciones = data.get("total_evaluaciones", 0)
    
    if total_evaluaciones > 0:
        analisis_niveles = []
        for nivel, cantidad in niveles.items():
            if cantidad > 0:
                porcentaje = (cantidad / total_evaluaciones) * 100
                analisis_niveles.append(f"**{nivel}**: {cantidad} evaluaciones ({porcentaje:.1f}%)")
        
        if analisis_niveles:
            texto.append(f"📊 **Distribución del Desempeño**: {' | '.join(analisis_niveles)}.")
    
    # Análisis de materias problemáticas
    bajas = data.get("materias_con_bajo_rendimiento", [])
    if bajas:
        if len(bajas) == 1:
            texto.append(f"⚠️ **Área de Mejora Crítica**: {bajas[0]} requiere atención inmediata.")
        else:
            texto.append(f"⚠️ **Áreas de Mejora Críticas**: {', '.join(bajas)} requieren intervención académica.")
    else:
        texto.append("✅ **Fortaleza Académica**: Todas las materias muestran rendimiento satisfactorio o superior.")
    
    # Análisis de puntualidad
    porcentaje_tardias = data.get("porcentaje_tardias", 0)
    if porcentaje_tardias > 0.2:
        texto.append(f"⏰ **Gestión del Tiempo**: {porcentaje_tardias*100:.1f}% de entregas tardías indica necesidad urgente de mejorar organización temporal.")
    elif porcentaje_tardias > 0.05:
        texto.append(f"⏰ **Puntualidad**: {porcentaje_tardias*100:.1f}% de entregas tardías sugiere mejorar planificación.")
    else:
        texto.append("⏰ **Excelente Puntualidad**: Entregas puntuales demuestran buena organización.")
    
    # Recomendaciones estratégicas
    recomendaciones = data.get("recomendaciones", [])
    if recomendaciones:
        texto.append(f"🎯 **Plan de Acción Sugerido**: {' | '.join(recomendaciones)}")
    
    # Mensaje motivacional personalizado
    if promedio >= 4.5:
        texto.append("🏆 **¡Felicitaciones!** Tu rendimiento excepcional te posiciona como ejemplo a seguir. Considera compartir tus estrategias de estudio con otros compañeros.")
    elif promedio >= 4.0:
        texto.append("🎯 **¡Muy bien!** Estás muy cerca de la excelencia. Con dedicación adicional podrás alcanzar el nivel superior.")
    elif promedio >= 3.5:
        texto.append("💪 **Buen progreso.** Tienes una base sólida. Enfócate en las áreas específicas de mejora para destacar.")
    else:
        texto.append("📚 **Es momento de actuar.** Con el plan de mejora adecuado y apoyo académico, puedes recuperar tu rendimiento exitosamente.")
    
    return "\n\n".join(texto)

def limpiar_json(obj):
    if isinstance(obj, dict):
        return {k: limpiar_json(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [limpiar_json(elem) for elem in obj]
    elif isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return 0.0  # Alternativamente puedes usar None si prefieres
        return obj
    else:
        return obj
    
def analizar_rendimiento_estudiante_completo(student: Student) -> Dict:
    """
    Análisis completo y mejorado del rendimiento académico de un estudiante.
    
    Args:
        student: Instancia del modelo Student
        
    Returns:
        dict: Análisis completo y detallado del rendimiento del estudiante
    """
    # Cache key mejorado que se invalida cuando cambian las notas
    ultima_nota = GradeEntry.objects.filter(student=student).order_by("-updated_at").first()
    timestamp = ultima_nota.updated_at.timestamp() if ultima_nota else "sin_datos"
    cache_key = f"analisis_completo_{student.id}_{timestamp}"
    
    cached_result = cache.get(cache_key)
    if cached_result:
        return cached_result
    
    entries = GradeEntry.objects.filter(
    student=student,
    assignment__course_subject__course=student.course  # solo su curso activo
    ).select_related(
        'assignment', 'assignment__course_subject', 'assignment__course_subject__subject'
    ).order_by('assignment__period', 'assignment__course_subject__subject__name')


    if not entries.exists():
        return {
            "mensaje": "No hay datos suficientes para analizar.",
            "informe_narrativo": "No se encontraron registros de calificaciones para este estudiante.",
            "modelo_ml_disponible": MLModelHandler().modelo_disponible
        }
    # Procesar datos
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
            "fecha": entry.created_at
        })
    
    df = pd.DataFrame(data)
    df["ponderado"] = df["nota"] * df["peso"]
    
    # Cálculos principales
    promedio_general = round(df["ponderado"].sum() / df["peso"].sum(), 2)
    
    # Análisis por materia - CORREGIDO
    materias = df.groupby("materia").agg({
        "nota": ["mean", "count", "std"],
        "tarde": "sum"
    }).round(2)
    # Cambiar los nombres de columnas para que coincidan con el frontend
    materias.columns = ["nota", "total_evaluaciones", "desviacion", "entregas_tardias"]
    materias = materias.reset_index().to_dict(orient="records")
    
    # Agregar campo "promedio" para compatibilidad
    for materia in materias:
        materia["promedio"] = materia["nota"]
    
    # Materias con bajo rendimiento
    bajas = df[df["nota"] < 3.0]["materia"].unique().tolist()
    
    # Análisis por período
    periodos_df = df.groupby("periodo").agg({
        "nota": "mean",
        "tarde": "mean"
    }).round(2)
    periodos_df.columns = ["nota", "porcentaje_tardias"]
    periodos = periodos_df.reset_index().to_dict(orient="records")
    
    # Clasificación de niveles de desempeño
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

    # Generar recomendaciones inteligentes
    recomendaciones = []
    
    if promedio_general < 3.0:
        recomendaciones.append("URGENTE: Implementar plan de recuperación académica inmediato")
    elif promedio_general < 3.5:
        recomendaciones.append("Revisar y fortalecer hábitos de estudio fundamentales")
    
    porcentaje_tardias = df["tarde"].mean()
    if porcentaje_tardias > 0.3:
        recomendaciones.append(f"Crítico: {porcentaje_tardias*100:.1f}% entregas tardías - Necesita gestión de tiempo urgente")
    elif porcentaje_tardias > 0.15:
        recomendaciones.append("Mejorar planificación y organización del tiempo de estudio")
    
    if len(bajas) >= 3:
        recomendaciones.append("Requiere apoyo académico multidisciplinario inmediato")
    elif len(bajas) >= 1:
        recomendaciones.append(f"Refuerzo específico necesario en: {', '.join(bajas)}")
    
    # Análisis de tendencias
    if len(periodos) > 1:
        ultima_tendencia = periodos[-1]["nota"] - periodos[-2]["nota"]
        if ultima_tendencia < -0.5:
            recomendaciones.append("ALERTA: Tendencia decreciente significativa detectada")
        elif ultima_tendencia > 0.5:
            recomendaciones.append("Excelente: Tendencia de mejora sostenida")
    
    if promedio_general >= 4.5:
        recomendaciones.append("Mantener excelencia y considerar roles de liderazgo académico")

    # Obtener predicción de riesgo ML
    print("\n📊 Notas normalizadas enviadas al modelo:")
    print(df[["materia", "periodo", "nota", "peso", "tarde"]].to_string(index=False))

    prediccion_riesgo = predecir_riesgo_estudiante(student)
    
    # Preparar datos para el informe narrativo
    datos_informe = {
        "promedio_general": promedio_general,
        "materias_con_bajo_rendimiento": bajas,
        "resumen_por_periodo": periodos,
        "niveles_desempeno": niveles_completos,
        "recomendaciones": recomendaciones,
        "porcentaje_tardias": porcentaje_tardias,
        "total_evaluaciones": len(df),
        "prediccion_riesgo": prediccion_riesgo
    }

    # Generar informe narrativo mejorado
    informe_narrativo = generar_informe_narrativo_mejorado(datos_informe)

    # Preparar resultado final
    resultado = {
        "promedio_general": promedio_general,
        "promedios_por_materia": materias,
        "materias_con_bajo_rendimiento": bajas,
        "resumen_por_periodo": periodos,
        "niveles_desempeno": niveles_completos,
        "recomendaciones": recomendaciones,
        "informe_narrativo": informe_narrativo,
        "prediccion_riesgo": prediccion_riesgo,
        "estadisticas_adicionales": {
            "total_evaluaciones": len(df),
            "porcentaje_entregas_tardias": round(porcentaje_tardias * 100, 1),
            "mejor_materia": max(materias, key=lambda x: x["promedio"])["materia"] if materias else None,
            "peor_materia": min(materias, key=lambda x: x["promedio"])["materia"] if materias else None,
            "desviacion_promedio": round(df["nota"].std(), 2),
            "rango_notas": {
                "minima": float(df["nota"].min()),
                "maxima": float(df["nota"].max())
            },
            "modelo_ml_disponible": MLModelHandler().modelo_disponible,
            "ultima_actualizacion": df["fecha"].max().isoformat() if not df.empty else None
        },
        "interpretacion_riesgo": interpretar_riesgo(prediccion_riesgo["riesgo"]) if prediccion_riesgo["riesgo"] else None
    }
    
    # Cachear resultado por 30 minutos
    resultado = limpiar_json(resultado)
    cache.set(cache_key, resultado, 1800)
    return resultado