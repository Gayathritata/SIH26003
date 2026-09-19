"""
Synthetic Cognitive Performance Dataset Generator for MINDMATE NER
DISCLAIMER: "Prototype synthetic training data — not clinical diagnostic data."
Used exclusively for training prototype ML adaptive difficulty models.
"""

import os
import random
import numpy as np
import pandas as pd

def generate_synthetic_dataset(num_records=6000, seed=42):
    np.random.seed(seed)
    random.seed(seed)

    game_types = ['memory_match', 'pattern_recognition', 'daily_routine_recall', 'object_recognition']
    diff_levels = ['easy', 'medium', 'hard']
    diff_map = {'easy': 1, 'medium': 2, 'hard': 3}
    
    data = []

    for i in range(num_records):
        game_type = random.choice(game_types)
        prev_diff_str = random.choice(diff_levels)
        prev_diff_num = diff_map[prev_diff_str]

        # Generate realistic metrics correlated with difficulty level & user skill
        skill_tier = random.choice(['low', 'moderate', 'high'])
        
        if skill_tier == 'high':
            accuracy = round(float(np.random.uniform(0.80, 1.00)), 2)
            completion_time = round(float(np.random.uniform(10.0, 35.0)), 1)
            incorrect_attempts = int(np.random.choice([0, 1, 2], p=[0.7, 0.2, 0.1]))
            attempts = int(np.random.randint(4, 8) + incorrect_attempts)
            correct_answers = attempts - incorrect_attempts
            completion_rate = 1.0
            base_score = 100 + int(accuracy * 80) + int((40 - completion_time) * 2)
        elif skill_tier == 'moderate':
            accuracy = round(float(np.random.uniform(0.60, 0.82)), 2)
            completion_time = round(float(np.random.uniform(25.0, 55.0)), 1)
            incorrect_attempts = int(np.random.choice([1, 2, 3], p=[0.4, 0.4, 0.2]))
            attempts = int(np.random.randint(5, 10) + incorrect_attempts)
            correct_answers = max(1, attempts - incorrect_attempts)
            completion_rate = round(float(np.random.uniform(0.80, 1.00)), 2)
            base_score = 60 + int(accuracy * 50) + int((60 - completion_time) * 1)
        else: # low performance
            accuracy = round(float(np.random.uniform(0.20, 0.58)), 2)
            completion_time = round(float(np.random.uniform(45.0, 110.0)), 1)
            incorrect_attempts = int(np.random.randint(3, 8))
            attempts = int(np.random.randint(6, 12) + incorrect_attempts)
            correct_answers = max(0, attempts - incorrect_attempts)
            completion_rate = round(float(np.random.uniform(0.40, 0.85)), 2)
            base_score = Math.max(10, int(accuracy * 40)) if 'Math' in globals() else max(10, int(accuracy * 40))

        score = max(0, min(200, base_score))

        # Rule-based target recommended difficulty determination + slight noise
        perf_indicator = (accuracy * 0.50) + ((100.0 - min(100.0, completion_time)) / 100.0 * 0.30) + (completion_rate * 0.20)

        if perf_indicator > 0.72 and accuracy >= 0.78 and incorrect_attempts <= 2:
            target_diff = 'hard'
        elif perf_indicator < 0.48 or accuracy < 0.55 or incorrect_attempts >= 4 or completion_time > 65.0:
            target_diff = 'easy'
        else:
            target_diff = 'medium'

        # 4% random noise to simulate edge cases
        if random.random() < 0.04:
            target_diff = random.choice(diff_levels)

        data.append({
            'gameType': game_type,
            'accuracy': accuracy,
            'score': score,
            'completionTime': completion_time,
            'attempts': attempts,
            'incorrectAttempts': incorrect_attempts,
            'correctAnswers': correct_answers,
            'completionRate': completion_rate,
            'previousDifficulty': prev_diff_str,
            'recommendedDifficulty': target_diff,
        })

    df = pd.DataFrame(data)
    
    out_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, 'training_data.csv')
    df.to_csv(out_path, index=False)
    print(f"[SUCCESS] Generated {len(df)} prototype synthetic records -> {os.path.abspath(out_path)}")
    return df

if __name__ == '__main__':
    generate_synthetic_dataset()
