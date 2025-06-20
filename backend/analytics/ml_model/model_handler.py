#C:\Users\germa\Desktop\academic_system\backend\analytics\ml_model\model_handler.py
# analytics/ml_model/model_handler.py
import os
import pickle
import numpy as np
import pandas as pd
from tensorflow.keras.models import load_model
from sklearn.preprocessing import OneHotEncoder, StandardScaler

class MLModelHandler:
    def __init__(self):
        self.base_path = os.path.dirname(__file__)
        try:
            self.modelo = load_model(os.path.join(self.base_path, "modelo_riesgo.keras"))
            with open(os.path.join(self.base_path, "encoder.pkl"), "rb") as f:
                self.encoder = pickle.load(f)
            with open(os.path.join(self.base_path, "scaler.pkl"), "rb") as f:
                self.scaler = pickle.load(f)
            self.modelo_disponible = True
        except Exception as e:
            print("No se pudo cargar el modelo de IA:", e)
            self.modelo_disponible = False

    def transformar_dataframe(self, df):
        cat = self.encoder.transform(df[["subject", "course", "assignment_type"]])
        num = self.scaler.transform(df[["grade", "late", "period", "attendance", "exam_score", "task_score", "estrato", "edad"]])
        return np.concatenate([cat, num], axis=1)
