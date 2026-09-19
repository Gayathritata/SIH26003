"""
Inference & Prediction Pipeline for MINDMATE NER Adaptive Cognitive Engine
Loads trained XGBoost model package and generates recommended game difficulty.
"""

import os
import joblib
import pandas as pd
import numpy as np

from preprocess import preprocess_single_input, DIFF_NUM_TO_STR

_MODEL_PACKAGE = None

def load_model_package():
    """
    Loads serialized model package lazily to avoid unnecessary disk reloads.
    """
    global _MODEL_PACKAGE
    if _MODEL_PACKAGE is None:
        model_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'difficulty_model.pkl')
        if not os.path.exists(model_path):
            # Auto-train if model doesn't exist yet
            print("[INFO] Serialized model not found. Triggering model training...")
            from train_model import train_and_evaluate_xgboost
            _MODEL_PACKAGE = train_and_evaluate_xgboost()
        else:
            _MODEL_PACKAGE = joblib.load(model_path)
    return _MODEL_PACKAGE

def predict_recommended_difficulty(session_data: dict) -> dict:
    """
    Predicts next recommended difficulty ('easy', 'medium', 'hard') for an elderly cognitive game session.
    
    Example Input:
    {
        "gameType": "memory_match",
        "accuracy": 0.85,
        "score": 78,
        "completionTime": 42,
        "attempts": 8,
        "incorrectAttempts": 2,
        "correctAnswers": 6,
        "completionRate": 1.0,
        "previousDifficulty": "medium"
    }
    
    Returns:
    {
        "recommendedDifficulty": "hard",
        "confidence": 0.87,
        "probabilities": {"easy": 0.05, "medium": 0.08, "hard": 0.87},
        "explanation": "Difficulty recommended based on recent accuracy, score and completion performance."
    }
    """
    package = load_model_package()
    xgb_model = package['model']
    
    # 1. Preprocess input dictionary safely into model feature DataFrame
    X_input = preprocess_single_input(session_data)

    # 2. Run prediction and probability estimation
    pred_class_idx = int(xgb_model.predict(X_input)[0])
    class_probs = xgb_model.predict_proba(X_input)[0]

    # Map output class index to difficulty string ('easy', 'medium', 'hard')
    target_classes = package.get('target_classes', ['easy', 'medium', 'hard'])
    recommended_diff = target_classes[pred_class_idx]

    # Confidence is max class probability
    confidence = float(np.max(class_probs))

    # Formulate probabilities dictionary
    probabilities = {
        target_classes[i]: round(float(class_probs[i]), 4)
        for i in range(len(target_classes))
    }

    # Non-medical explanation (strictly avoiding dementia/medical diagnostic claims)
    explanation = (
        f"Difficulty recommended ({recommended_diff}) based on recent game performance metrics "
        f"(accuracy: {int(float(session_data.get('accuracy', 0))*100 if float(session_data.get('accuracy', 0)) <= 1.0 else session_data.get('accuracy', 0))}%, "
        f"completion time: {session_data.get('completionTime', session_data.get('reactionTime', 0))}s)."
    )

    return {
        "recommendedDifficulty": recommended_diff,
        "confidence": round(confidence, 4),
        "probabilities": probabilities,
        "explanation": explanation,
        "disclaimer": "Adaptive game difficulty recommendation engine — non-clinical demonstration."
    }

if __name__ == '__main__':
    print("==========================================================================")
    print("  TESTING PREDICTION PIPELINE ON SAMPLE GAME SESSIONS (STEP 7)")
    print("==========================================================================")

    test_samples = [
        {
            "gameType": "memory_match",
            "accuracy": 0.90,
            "score": 110,
            "completionTime": 18.5,
            "attempts": 6,
            "incorrectAttempts": 0,
            "correctAnswers": 6,
            "completionRate": 1.0,
            "previousDifficulty": "medium",
        },
        {
            "gameType": "pattern_recognition",
            "accuracy": 0.33,
            "score": 25,
            "completionTime": 75.0,
            "attempts": 6,
            "incorrectAttempts": 4,
            "correctAnswers": 2,
            "completionRate": 0.50,
            "previousDifficulty": "hard",
        },
        {
            "gameType": "daily_routine_recall",
            "accuracy": 0.70,
            "score": 75,
            "completionTime": 40.0,
            "attempts": 5,
            "incorrectAttempts": 1,
            "correctAnswers": 4,
            "completionRate": 1.0,
            "previousDifficulty": "easy",
        },
        {
            "gameType": "object_recognition",
            "accuracy": 0.95,
            "score": 125,
            "completionTime": 14.0,
            "attempts": 4,
            "incorrectAttempts": 0,
            "correctAnswers": 4,
            "completionRate": 1.0,
            "previousDifficulty": "easy",
        }
    ]

    for idx, sample in enumerate(test_samples, 1):
        print(f"\n--- Sample {idx}: {sample['gameType']} (Prev Diff: {sample['previousDifficulty']}) ---")
        result = predict_recommended_difficulty(sample)
        print(f"  Inputs                : Accuracy={sample['accuracy']}, Time={sample['completionTime']}s, Errors={sample['incorrectAttempts']}")
        print(f"  Recommended Difficulty: {result['recommendedDifficulty'].upper()}")
        print(f"  Confidence            : {result['confidence'] * 100:.1f}%")
        print(f"  Probabilities         : {result['probabilities']}")
        print(f"  Explanation           : {result['explanation']}")

    print("\n==========================================================================\n")
