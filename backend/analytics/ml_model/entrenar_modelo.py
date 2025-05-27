import pandas as pd
import numpy as np
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout
from tensorflow.keras.models import save_model

# Leer dataset
df = pd.read_csv("backend/analytics/ml_model/dataset.csv")

# Validar columnas necesarias
required_cols = ["subject", "course", "grade", "late", "period", "attendance", "assignment_type", "exam_score", "task_score", "estrato", "edad"]
for col in required_cols:
    if col not in df.columns:
        raise ValueError(f"Columna faltante: {col}")

# One-hot encoding para variables categóricas
encoder = OneHotEncoder(sparse_output=False)
encoded_cat = encoder.fit_transform(df[["subject", "course", "assignment_type"]])

# Escalado de variables numéricas
scaler = StandardScaler()
scaled_num = scaler.fit_transform(df[["grade", "late", "period", "attendance", "exam_score", "task_score", "estrato", "edad"]])

# Dataset final
X = np.concatenate([encoded_cat, scaled_num], axis=1)

# Etiqueta: 1 si nota < 3.0
y = (df["grade"] < 3.0).astype(int)

# Dividir en entrenamiento y prueba
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Red neuronal
model = Sequential([
    Dense(128, activation='relu', input_shape=(X.shape[1],)),
    Dropout(0.3),
    Dense(64, activation='relu'),
    Dropout(0.2),
    Dense(32, activation='relu'),
    Dense(1, activation='sigmoid')
])

model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

# Entrenar
model.fit(X_train, y_train, epochs=50, batch_size=32, validation_split=0.2)

# Guardar modelo
os.makedirs("backend/analytics/ml_model", exist_ok=True)
model.save("backend/analytics/ml_model/modelo_riesgo.keras")
print("✅ Modelo mejorado entrenado y guardado")
