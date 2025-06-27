import pandas as pd
import numpy as np
import os
import pickle
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout

# Ruta base
BASE_DIR = os.path.dirname(__file__)

# Leer dataset
df = pd.read_csv(os.path.join(BASE_DIR, "dataset.csv"))

# Verificar columnas requeridas
required_cols = [
    "subject", "course", "grade", "late", "period", "attendance", 
    "assignment_type", "exam_score", "task_score", "estrato", "edad"
]
missing = [col for col in required_cols if col not in df.columns]
if missing:
    raise ValueError(f"❌ Columnas faltantes en el dataset: {missing}")

# Codificación categórica
encoder = OneHotEncoder(sparse_output=False, handle_unknown="ignore")
encoded_cat = encoder.fit_transform(df[["subject", "course", "assignment_type"]])

# Escalado de variables numéricas
scaler = StandardScaler()
scaled_num = scaler.fit_transform(df[[
    "grade", "late", "period", "attendance", 
    "exam_score", "task_score", "estrato", "edad"
]])

# Conjunto final
X = np.concatenate([encoded_cat, scaled_num], axis=1)

# Etiquetas: riesgo = 1 si nota < 3.0
y = (df["grade"] < 3.0).astype(int)

# Separar entrenamiento/prueba
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Modelo de red neuronal
model = Sequential([
    Dense(128, activation='relu', input_shape=(X.shape[1],)),
    Dropout(0.3),
    Dense(64, activation='relu'),
    Dropout(0.2),
    Dense(32, activation='relu'),
    Dense(1, activation='sigmoid')
])
model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

# Entrenamiento
model.fit(X_train, y_train, epochs=50, batch_size=32, validation_split=0.2)

# Guardar modelo y transformadores
model_path = os.path.join(BASE_DIR, "modelo_riesgo.keras")
encoder_path = os.path.join(BASE_DIR, "encoder.pkl")
scaler_path = os.path.join(BASE_DIR, "scaler.pkl")

model.save(model_path)
with open(encoder_path, "wb") as f:
    pickle.dump(encoder, f)
with open(scaler_path, "wb") as f:
    pickle.dump(scaler, f)

print("✅ Modelo reentrenado y guardado en:", model_path)
print("✅ Encoder guardado en:", encoder_path)
print("✅ Scaler guardado en:", scaler_path)
