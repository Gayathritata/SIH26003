"""
Data Preprocessing & Feature Extraction Pipeline for MINDMATE NER Adaptive Cognitive Engine
Ensures input features are cleanly extracted and structured without data leakage.
"""

import pandas as pd
import numpy as np

# Feature Column Definitions (Excludes target and PII)
NUMERIC_FEATURES = [
    'accuracy',
    'score',
    'completionTime',
    'attempts',
    'incorrectAttempts',
    'correctAnswers',
    'completionRate',
    'previousDifficultyNum',
]

GAME_TYPE_CATEGORIES = [
    'gameType_memory_match',
    'gameType_pattern_recognition',
    'gameType_daily_routine_recall',
    'gameType_object_recognition',
]

ALL_FEATURE_COLUMNS = NUMERIC_FEATURES + GAME_TYPE_CATEGORIES

DIFF_STR_TO_NUM = {
    'easy': 1,
    'medium': 2,
    'hard': 3,
    '1': 1,
    '2': 2,
    '3': 3,
}

DIFF_NUM_TO_STR = {
    0: 'easy',
    1: 'medium',
    2: 'hard',
}

DIFF_STR_TO_INDEX = {
    'easy': 0,
    'medium': 1,
    'hard': 2,
}


def preprocess_single_input(raw_input: dict) -> pd.DataFrame:
    """
    Safely preprocesses a single game session dictionary into a model-ready 1-row DataFrame.
    Handles missing fields safely with fallback defaults.
    """
    # 1. Normalize gameType
    raw_game_type = str(raw_input.get('gameType') or raw_input.get('game_type') or 'memory_match').lower().trim() if hasattr(str(raw_input.get('gameType')), 'trim') else str(raw_input.get('gameType') or raw_input.get('game_type') or 'memory_match').lower().strip()
    if raw_game_type == 'memory': raw_game_type = 'memory_match'
    if raw_game_type == 'pattern': raw_game_type = 'pattern_recognition'
    if raw_game_type == 'routine': raw_game_type = 'daily_routine_recall'
    if raw_game_type == 'object_rec': raw_game_type = 'object_recognition'

    # 2. Normalize previousDifficulty
    prev_diff_raw = str(raw_input.get('previousDifficulty') or raw_input.get('difficulty') or 'easy').lower().strip()
    prev_diff_num = DIFF_STR_TO_NUM.get(prev_diff_raw, 1)

    # 3. Extract numerical performance features safely
    attempts = float(raw_input.get('attempts') if raw_input.get('attempts') is not None else 5)
    incorrect_attempts = float(raw_input.get('incorrectAttempts') if raw_input.get('incorrectAttempts') is not None else (raw_input.get('mistakes') or 0))
    correct_answers = float(raw_input.get('correctAnswers') if raw_input.get('correctAnswers') is not None else (raw_input.get('correctMatches') or max(0, attempts - incorrect_attempts)))
    
    accuracy = float(raw_input.get('accuracy') if raw_input.get('accuracy') is not None else (correct_answers / max(1.0, attempts)))
    if accuracy > 1.0: # Normalize percentage to 0.0 - 1.0 if passed as 0-100
        accuracy = round(accuracy / 100.0, 4)

    score = float(raw_input.get('score') if raw_input.get('score') is not None else (accuracy * 100))
    completion_time = float(raw_input.get('completionTime') if raw_input.get('completionTime') is not None else (raw_input.get('reactionTime') or 30.0))
    completion_rate = float(raw_input.get('completionRate') if raw_input.get('completionRate') is not None else 1.0)
    if completion_rate > 1.0:
        completion_rate = round(completion_rate / 100.0, 4)

    row = {
        'accuracy': accuracy,
        'score': score,
        'completionTime': completion_time,
        'attempts': attempts,
        'incorrectAttempts': incorrect_attempts,
        'correctAnswers': correct_answers,
        'completionRate': completion_rate,
        'previousDifficultyNum': prev_diff_num,
        'gameType_memory_match': 1 if raw_game_type == 'memory_match' else 0,
        'gameType_pattern_recognition': 1 if raw_game_type == 'pattern_recognition' else 0,
        'gameType_daily_routine_recall': 1 if raw_game_type == 'daily_routine_recall' else 0,
        'gameType_object_recognition': 1 if raw_game_type == 'object_recognition' else 0,
    }

    df = pd.DataFrame([row])
    return df[ALL_FEATURE_COLUMNS]


def preprocess_dataframe(df: pd.DataFrame):
    """
    Preprocesses a batch DataFrame for model training.
    """
    df = df.copy()

    # Map previousDifficulty to numeric
    df['previousDifficultyNum'] = df['previousDifficulty'].apply(lambda x: DIFF_STR_TO_NUM.get(str(x).lower().strip(), 1))

    # One-hot encode gameType
    for gtype in ['memory_match', 'pattern_recognition', 'daily_routine_recall', 'object_recognition']:
        col_name = f"gameType_{gtype}"
        df[col_name] = (df['gameType'] == gtype).astype(int)

    X = df[ALL_FEATURE_COLUMNS]
    
    # Target encoding: easy=0, medium=1, hard=2
    y = df['recommendedDifficulty'].apply(lambda x: DIFF_STR_TO_INDEX.get(str(x).lower().strip(), 1))

    return X, y
