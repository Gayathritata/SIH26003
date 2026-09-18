"""
ML Prediction Services & Analytics Calculator for MINDMATE NER
"""

import os
import joblib
import pandas as pd
import numpy as np

from app.fallback import rule_based_recommendation, generate_explanation
from app.schemas import RecommendationRequest, RecommendationResponse

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'adaptive_model.pkl')

class MLServiceContainer:
    def __init__(self):
        self.model_package = None
        self.load_model()

    def load_model(self):
        if os.path.exists(MODEL_PATH):
            try:
                self.model_package = joblib.load(MODEL_PATH)
                print(f"[ML SERVICE] Model successfully loaded from {MODEL_PATH} ({self.model_package.get('model_name')})")
            except Exception as e:
                print(f"[ML SERVICE WARNING] Could not load model: {e}")
                self.model_package = None
        else:
            print(f"[ML SERVICE INFO] Model binary not found at {MODEL_PATH}. Will fallback to rule-based engine.")

    def recommend(self, req: RecommendationRequest) -> RecommendationResponse:
        if self.model_package is None:
            res = rule_based_recommendation(
                req.accuracy, req.reaction_time, req.mistakes,
                req.previous_difficulty, req.previous_score
            )
            return RecommendationResponse(**res)

        try:
            model = self.model_package['model']
            feature_cols = self.model_package['feature_columns']
            model_name = self.model_package.get('model_name', 'Trained ML Model')

            # Build feature dictionary
            input_dict = {col: 0 for col in feature_cols}
            
            # Numeric features
            input_dict['difficulty'] = req.previous_difficulty
            input_dict['accuracy'] = req.accuracy
            input_dict['reaction_time'] = req.reaction_time
            input_dict['mistakes'] = req.mistakes
            input_dict['completion_rate'] = req.completion_rate or 1.0
            input_dict['previous_score'] = req.previous_score
            input_dict['previous_difficulty'] = req.previous_difficulty
            input_dict['session_count'] = req.session_count or 1

            # One-hot encoded features
            game_col = f"game_type_{req.game_type}"
            if game_col in input_dict:
                input_dict[game_col] = 1

            mood_col = f"mood_{req.mood or 'good'}"
            if mood_col in input_dict:
                input_dict[mood_col] = 1

            df_input = pd.DataFrame([input_dict])[feature_cols]

            # Predict class (0-4 mapping back to difficulty 1-5)
            pred_class = model.predict(df_input)[0]
            recommended_level = int(pred_class + 1)

            # Confidence probability
            if hasattr(model, "predict_proba"):
                probas = model.predict_proba(df_input)[0]
                confidence = float(np.max(probas))
            else:
                confidence = 0.88

            explanation = generate_explanation(
                recommended_level, req.previous_difficulty,
                req.accuracy, req.reaction_time, model_name
            )

            trend = "improving" if recommended_level > req.previous_difficulty else (
                "declining" if recommended_level < req.previous_difficulty else "stable"
            )

            return RecommendationResponse(
                recommended_difficulty=recommended_level,
                confidence=round(confidence, 2),
                reason=explanation,
                engine_used=model_name,
                previous_difficulty=req.previous_difficulty,
                performance_trend=trend
            )

        except Exception as e:
            print(f"[ML PREDICTION ERROR] Falling back to rules due to error: {e}")
            res = rule_based_recommendation(
                req.accuracy, req.reaction_time, req.mistakes,
                req.previous_difficulty, req.previous_score
            )
            return RecommendationResponse(**res)

ml_service = MLServiceContainer()

def calculate_cognitive_indicators(sessions):
    if not sessions:
        return {
            "memory_score": 75,
            "attention_score": 78,
            "recognition_score": 80,
            "response_score": 72,
            "consistency_score": 82,
            "engagement_score": 85,
            "overall_performance_indicator": 78
        }

    # Group sessions by game_type
    memory_sessions = [s for s in sessions if s.get('gameType') == 'memory']
    pattern_sessions = [s for s in sessions if s.get('gameType') == 'pattern']
    obj_sessions = [s for s in sessions if s.get('gameType') == 'object_rec']

    def avg_accuracy(sub):
        if not sub:
            return 75.0
        return sum(s.get('accuracy', 0.75) for s in sub) / len(sub) * 100

    def avg_rt(sub):
        if not sub:
            return 4.0
        return sum(s.get('reactionTime', 4.0) for s in sub) / len(sub)

    memory_score = int(round(avg_accuracy(memory_sessions)))
    attention_score = int(round(avg_accuracy(pattern_sessions)))
    recognition_score = int(round(avg_accuracy(obj_sessions)))
    
    # Response score calculated from average reaction speed
    overall_avg_rt = avg_rt(sessions)
    response_score = int(round(np.clip(100 - (overall_avg_rt * 6), 30, 98)))

    # Consistency score
    all_scores = [s.get('score', 70) for s in sessions]
    std_dev = float(np.std(all_scores)) if len(all_scores) > 1 else 5.0
    consistency_score = int(round(np.clip(100 - (std_dev * 2.5), 40, 95)))

    # Engagement score
    avg_comp = sum(s.get('completionRate', 1.0) for s in sessions) / len(sessions)
    engagement_score = int(round(np.clip(avg_comp * 85 + min(15, len(sessions) * 2), 50, 98)))

    overall = int(round((memory_score + attention_score + recognition_score + response_score + consistency_score + engagement_score) / 6))

    return {
        "memory_score": memory_score,
        "attention_score": attention_score,
        "recognition_score": recognition_score,
        "response_score": response_score,
        "consistency_score": consistency_score,
        "engagement_score": engagement_score,
        "overall_performance_indicator": overall
    }

def analyze_performance_change(recent_baseline_score: float, today_score: float, patient_name: str = "Patient"):
    if recent_baseline_score <= 0:
        pct_change = 0.0
    else:
        pct_change = ((today_score - recent_baseline_score) / recent_baseline_score) * 100

    pct_change_round = round(pct_change, 1)

    if pct_change < -20.0:
        return {
            "alert_triggered": True,
            "severity": "high" if pct_change < -35.0 else "medium",
            "message": f"Performance Change Alert: {patient_name}'s cognitive score today ({int(today_score)}%) dropped by {abs(pct_change_round)}% below recent baseline ({int(recent_baseline_score)}%). Consider checking in with the patient.",
            "baseline_score": recent_baseline_score,
            "today_score": today_score,
            "percentage_change": pct_change_round
        }
    else:
        return {
            "alert_triggered": False,
            "severity": "none",
            "message": f"Performance is within normal expected baseline variation ({pct_change_round}%).",
            "baseline_score": recent_baseline_score,
            "today_score": today_score,
            "percentage_change": pct_change_round
        }
