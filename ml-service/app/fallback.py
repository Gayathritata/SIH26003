"""
Rule-Based Fallback Engine & Explanation Generator for MINDMATE NER
Guarantees reliable operation even if ML model binary is missing or fails.
"""

def rule_based_recommendation(accuracy: float, reaction_time: float, mistakes: int, previous_difficulty: int, previous_score: int):
    prev_level = max(1, min(5, previous_difficulty))
    
    # Calculate performance index
    # Accuracy weight = 50%, Reaction speed weight = 30%, Mistake penalty = 20%
    speed_factor = max(0.0, min(1.0, (10.0 - reaction_time) / 10.0))
    mistake_factor = max(0.0, 1.0 - (mistakes * 0.2))
    
    composite_index = (accuracy * 0.50) + (speed_factor * 0.30) + (mistake_factor * 0.20)
    
    if composite_index >= 0.75 and accuracy >= 0.75 and mistakes <= 2:
        recommended = min(5, prev_level + 1)
        reason = "Accuracy improved during recent sessions and reaction time was swift."
        trend = "improving"
        confidence = 0.88
    elif composite_index < 0.45 or accuracy < 0.50 or reaction_time > 8.0:
        recommended = max(1, prev_level - 1)
        reason = "Recent accuracy decreased or reaction time increased; lowering difficulty for patient comfort."
        trend = "declining"
        confidence = 0.85
    else:
        recommended = prev_level
        reason = "Performance remains stable; maintaining current difficulty level."
        trend = "stable"
        confidence = 0.90

    return {
        "recommended_difficulty": recommended,
        "confidence": confidence,
        "reason": f"Fallback Rule Engine: {reason}",
        "engine_used": "Deterministic Rule Fallback",
        "previous_difficulty": prev_level,
        "performance_trend": trend
    }

def generate_explanation(recommended: int, prev: int, accuracy: float, reaction_time: float, model_name: str):
    if recommended > prev:
        return f"AI ({model_name}): Accuracy achieved ({int(accuracy*100)}%) with quick response ({reaction_time:.1f}s). Level raised from {prev} to {recommended} for cognitive stimulation."
    elif recommended < prev:
        return f"AI ({model_name}): Accuracy ({int(accuracy*100)}%) and reaction time ({reaction_time:.1f}s) suggest lower difficulty ({recommended}) will optimize engagement."
    else:
        return f"AI ({model_name}): Steady accuracy ({int(accuracy*100)}%) and comfortable reaction time ({reaction_time:.1f}s). Level {recommended} maintained."
