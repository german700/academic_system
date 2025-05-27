import numpy as np
import pandas as pd
from tensorflow.keras.models import load_model
from sklearn.preprocessing import OneHotEncoder, StandardScaler
import joblib

# Cargar modelo entrenado
model = load_model("backend/analytics/ml_model/modelo_riesgo.keras")

# Simulación de nuevos datos
nuevo = pd.DataFrame([{
    "subject": "Matemáticas",
    "course": "1-A",
    "assignment_type": "EXAMEN",
    "grade": 3.2,
    "late": 0,
    "period": 2,
    "attendance": 85,
    "exam_score": 4.0,
    "task_score": 3.8,
    "estrato": 2,
    "edad": 13
}])

# Codificación
encoder = OneHotEncoder(sparse_output=False, handle_unknown="ignore")
encoder.fit(pd.read_csv("backend/analytics/ml_model/dataset.csv")[["subject", "course", "assignment_type"]])
encoded_cat = encoder.transform(nuevo[["subject", "course", "assignment_type"]])

scaler = StandardScaler()
scaler.fit(pd.read_csv("backend/analytics/ml_model/dataset.csv")[["grade", "late", "period", "attendance", "exam_score", "task_score", "estrato", "edad"]])
scaled_num = scaler.transform(nuevo[["grade", "late", "period", "attendance", "exam_score", "task_score", "estrato", "edad"]])

X = np.concatenate([encoded_cat, scaled_num], axis=1)

# Predicción
riesgo = model.predict(X)[0][0]
print(f"Probabilidad de riesgo académico: {riesgo:.2f}")
