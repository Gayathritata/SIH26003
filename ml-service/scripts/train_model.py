"""
Model Training Script for MINDMATE NER Adaptive Cognitive Engine
Trains Random Forest and XGBoost classifiers on synthetic performance data.
Selects best performing model and exports models/adaptive_model.pkl.
"""

import os
import joblib
import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report
from xgboost import XGBClassifier

def train_and_evaluate():
    data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'synthetic_cognitive_dataset.csv')
    if not os.path.exists(data_path):
        from generate_dataset import generate_synthetic_dataset
        df = generate_synthetic_dataset()
    else:
        df = pd.read_csv(data_path)

    print(f"[INFO] Loaded dataset with {len(df)} records.")

    # One-hot encode categorical features: game_type and mood
    feature_cols = [
        'difficulty', 'accuracy', 'reaction_time', 'mistakes',
        'completion_rate', 'previous_score', 'previous_difficulty', 'session_count'
    ]
    
    df_encoded = pd.get_dummies(df, columns=['game_type', 'mood'], drop_first=False)
    
    encoded_feature_cols = [col for col in df_encoded.columns if col not in ['user_id', 'age_group', 'recommended_difficulty']]
    
    X = df_encoded[encoded_feature_cols]
    # XGBoost expects 0-indexed classes (recommended_difficulty levels 1-5 -> 0-4)
    y = df_encoded['recommended_difficulty'] - 1  # 0 to 4

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    # 1. Random Forest Classifier
    rf_model = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42)
    rf_model.fit(X_train, y_train)
    rf_preds = rf_model.predict(X_test)
    rf_acc = accuracy_score(y_test, rf_preds)
    rf_f1 = f1_score(y_test, rf_preds, average='macro')
    print(f"--- Random Forest Metrics ---")
    print(f"Accuracy: {rf_acc:.4f} | F1 (macro): {rf_f1:.4f}")

    # 2. XGBoost Classifier
    xgb_model = XGBClassifier(n_estimators=120, max_depth=6, learning_rate=0.08, random_state=42, eval_metric='mlogloss')
    xgb_model.fit(X_train, y_train)
    xgb_preds = xgb_model.predict(X_test)
    xgb_acc = accuracy_score(y_test, xgb_preds)
    xgb_f1 = f1_score(y_test, xgb_preds, average='macro')
    print(f"--- XGBoost Metrics ---")
    print(f"Accuracy: {xgb_acc:.4f} | F1 (macro): {xgb_f1:.4f}")

    # Select winning model
    if xgb_acc >= rf_acc:
        best_model = xgb_model
        best_name = "XGBoost Classifier"
        best_acc = xgb_acc
        best_f1 = xgb_f1
    else:
        best_model = rf_model
        best_name = "Random Forest Classifier"
        best_acc = rf_acc
        best_f1 = rf_f1

    print(f"\n[WINNER] Selected: {best_name} (Acc: {best_acc:.4f}, F1: {best_f1:.4f})")

    # Export model package
    models_dir = os.path.join(os.path.dirname(__file__), '..', 'models')
    os.makedirs(models_dir, exist_ok=True)
    export_path = os.path.join(models_dir, 'adaptive_model.pkl')

    package = {
        'model_name': best_name,
        'model': best_model,
        'feature_columns': encoded_feature_cols,
        'metrics': {
            'accuracy': float(best_acc),
            'f1_macro': float(best_f1),
            'rf_accuracy': float(rf_acc),
            'xgb_accuracy': float(xgb_acc)
        }
    }

    joblib.dump(package, export_path)
    print(f"[SUCCESS] Exported trained model to {os.path.abspath(export_path)}")

if __name__ == "__main__":
    train_and_evaluate()
