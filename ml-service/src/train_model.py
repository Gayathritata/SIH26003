"""
XGBoost Model Training & Evaluation Script for MINDMATE NER
Trains an adaptive difficulty recommendation model on synthetic performance data.
Saves serialized model package to ml-service/models/difficulty_model.pkl.

DISCLAIMER: This model provides adaptive difficulty recommendation for cognitive games.
It is NOT a medical diagnostic tool and does NOT diagnose dementia, Alzheimer's, or any medical condition.
"""

import os
import joblib
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix,
)
from xgboost import XGBClassifier

from generate_data import generate_synthetic_dataset
from preprocess import preprocess_dataframe, ALL_FEATURE_COLUMNS, DIFF_NUM_TO_STR

MODEL_DISCLAIMER = "Prototype adaptive cognitive difficulty recommendation model — non-clinical demonstration."

def train_and_evaluate_xgboost():
    print("==========================================================================")
    print("  MINDMATE NER — XGBoost Adaptive Difficulty Model Training (STEP 7)")
    print("==========================================================================")

    # 1. Load or generate synthetic training dataset
    data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'training_data.csv')
    if not os.path.exists(data_path):
        print("[INFO] Dataset not found. Generating new synthetic training data...")
        df = generate_synthetic_dataset(num_records=6000, seed=42)
    else:
        df = pd.read_csv(data_path)
        print(f"[INFO] Loaded synthetic dataset: {len(df)} records from {os.path.abspath(data_path)}")

    # 2. Preprocess features and target
    X, y = preprocess_dataframe(df)

    # Report class distribution
    print("\n[DATASET ANALYSIS] Class Distribution:")
    class_counts = pd.Series(y).map(DIFF_NUM_TO_STR).value_counts()
    for label, count in class_counts.items():
        pct = (count / len(y)) * 100
        print(f"  - {label.upper():<8}: {count} samples ({pct:.1f}%)")

    # 3. Train / Test Split with Stratification
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"\n[SPLIT] Train samples: {len(X_train)} | Test samples: {len(X_test)}")

    # 4. Train XGBoost Classifier
    print("\n[TRAINING] Fitting XGBClassifier...")
    xgb_model = XGBClassifier(
        n_estimators=150,
        max_depth=5,
        learning_rate=0.08,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=42,
        eval_metric='mlogloss',
        objective='multi:softprob',
        num_class=3,
    )
    xgb_model.fit(X_train, y_train)

    # 5. Evaluate Model Performance
    y_preds = xgb_model.predict(X_test)
    y_probs = xgb_model.predict_proba(X_test)

    acc = accuracy_score(y_test, y_preds)
    prec_macro = precision_score(y_test, y_preds, average='macro')
    prec_weighted = precision_score(y_test, y_preds, average='weighted')
    rec_macro = recall_score(y_test, y_preds, average='macro')
    rec_weighted = recall_score(y_test, y_preds, average='weighted')
    f1_macro = f1_score(y_test, y_preds, average='macro')
    f1_weighted = f1_score(y_test, y_preds, average='weighted')

    cm = confusion_matrix(y_test, y_preds)
    target_names = ['easy', 'medium', 'hard']

    print("\n--------------------------------------------------------------------------")
    print("  MODEL EVALUATION RESULTS (XGBoost Classifier)")
    print("--------------------------------------------------------------------------")
    print(f"  Accuracy Score       : {acc * 100:.2f}%")
    print(f"  Precision (Macro)    : {prec_macro * 100:.2f}%  | Weighted: {prec_weighted * 100:.2f}%")
    print(f"  Recall (Macro)       : {rec_macro * 100:.2f}%  | Weighted: {rec_weighted * 100:.2f}%")
    print(f"  F1-Score (Macro)     : {f1_macro * 100:.2f}%  | Weighted: {f1_weighted * 100:.2f}%")
    
    print("\n[CONFUSION MATRIX]")
    cm_df = pd.DataFrame(cm, index=[f"True {t}" for t in target_names], columns=[f"Pred {t}" for t in target_names])
    print(cm_df.to_string())

    print("\n[CLASSIFICATION REPORT]")
    print(classification_report(y_test, y_preds, target_names=target_names))

    # Feature Importance Analysis
    print("\n[FEATURE IMPORTANCES]")
    importances = xgb_model.feature_importances_
    feat_series = pd.Series(importances, index=ALL_FEATURE_COLUMNS).sort_values(ascending=False)
    for feat, imp in feat_series.items():
        print(f"  - {feat:<32}: {imp:.4f}")

    # 6. Save Model Package
    models_dir = os.path.join(os.path.dirname(__file__), '..', 'models')
    os.makedirs(models_dir, exist_ok=True)
    export_path = os.path.join(models_dir, 'difficulty_model.pkl')

    package = {
        'model_name': 'XGBoost Classifier (Adaptive Difficulty)',
        'model': xgb_model,
        'feature_columns': ALL_FEATURE_COLUMNS,
        'target_classes': target_names,
        'disclaimer': MODEL_DISCLAIMER,
        'metrics': {
            'accuracy': float(acc),
            'precision_macro': float(prec_macro),
            'recall_macro': float(rec_macro),
            'f1_macro': float(f1_macro),
            'f1_weighted': float(f1_weighted),
        },
    }

    joblib.dump(package, export_path)
    print(f"\n[SUCCESS] Exported trained model package to {os.path.abspath(export_path)}")
    print("==========================================================================\n")
    return package

if __name__ == '__main__':
    train_and_evaluate_xgboost()
