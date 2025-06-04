#C:\Users\germa\Desktop\academic_system\backend\analytics\ml_model\entrenar_modelo.py
import pandas as pd
import numpy as np
import os
import pickle
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout
from tensorflow.keras.models import save_model

# Leer dataset (relativo a este script)
df = pd.read_csv(os.path.join(os.path.dirname(__file__), "dataset.csv"))

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

# Crear carpeta de salida si no existe (aunque ya debería existir)
os.makedirs(os.path.dirname(__file__), exist_ok=True)

# Guardar modelo
model.save(os.path.join(os.path.dirname(__file__), "modelo_riesgo.keras"))

# Guardar encoder y scaler
with open(os.path.join(os.path.dirname(__file__), "encoder.pkl"), "wb") as f_enc:
    pickle.dump(encoder, f_enc)

with open(os.path.join(os.path.dirname(__file__), "scaler.pkl"), "wb") as f_scl:
    pickle.dump(scaler, f_scl)

print("✅ Modelo mejorado entrenado y guardado")
print("✅ Encoder y Scaler guardados")