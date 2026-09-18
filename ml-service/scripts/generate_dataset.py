"""
Synthetic Cognitive Performance Dataset Generator for MINDMATE NER
DISCLAIMER: "Synthetic demonstration dataset — not clinical data."
Used exclusively for training prototype ML adaptive difficulty models.
"""

import os
import random
import numpy as np
import pandas as pd

def generate_synthetic_dataset(num_records=5500, seed=42):
    np.random.seed(seed)
    random.seed(seed)

    game_types = ['memory', 'pattern', 'routine', 'object_rec']
    age_groups = ['60-69', '70-79', '80+']
    moods = ['happy', 'good', 'okay', 'worried', 'sad']
    
    data = []

    for i in range(num_records):
        user_id = f"PAT_{random.randint(100, 999)}"
        age_group = random.choice(age_groups)
        game_type = random.choice(game_types)
        prev_diff = random.randint(1, 5)
        session_count = random.randint(1, 40)
        mood = random.choice(moods)

        # Baseline difficulty for this session
        current_diff = prev_diff

        # Generate realistic metrics correlated with difficulty & age
        base_acc = np.random.beta(5, 2) if current_diff <= 2 else np.random.beta(3, 3)
        if age_group == '80+':
            base_acc *= 0.90
        
        accuracy = round(float(np.clip(base_acc, 0.15, 1.0)), 2)

        # Reaction time (seconds) - lower difficulty / younger = faster
        base_rt = 2.0 + (current_diff * 1.1) + np.random.exponential(1.5)
        if accuracy < 0.5:
            base_rt += 2.0
        reaction_time = round(float(np.clip(base_rt, 1.2, 14.0)), 2)

        # Mistakes count (correlated inversely with accuracy)
        max_mistakes = current_diff * 3
        mistakes = int(round((1.0 - accuracy) * max_mistakes))

        # Completion rate
        completion_rate = round(float(np.clip(accuracy + np.random.uniform(-0.1, 0.1), 0.3, 1.0)), 2)

        # Previous score
        previous_score = int(round(np.clip(accuracy * 100 + np.random.normal(0, 10), 10, 100)))

        # Determine target recommended difficulty based on realistic adaptive rules + noise
        perf_score = (accuracy * 0.55) + ((14.0 - reaction_time) / 14.0 * 0.30) + (completion_rate * 0.15)

        if perf_score > 0.75 and mistakes <= 2 and accuracy >= 0.75:
            recommended_diff = min(5, current_diff + 1)
        elif perf_score < 0.45 or accuracy < 0.50 or reaction_time > 8.5:
            recommended_diff = max(1, current_diff - 1)
        else:
            recommended_diff = current_diff

        # Occasional random noise (5% chance) to simulate edge cases in user interaction
        if random.random() < 0.05:
            recommended_diff = max(1, min(5, recommended_diff + random.choice([-1, 1])))

        data.append({
            'user_id': user_id,
            'age_group': age_group,
            'game_type': game_type,
            'difficulty': current_diff,
            'accuracy': accuracy,
            'reaction_time': reaction_time,
            'mistakes': mistakes,
            'completion_rate': completion_rate,
            'previous_score': previous_score,
            'previous_difficulty': prev_diff,
            'session_count': session_count,
            'mood': mood,
            'recommended_difficulty': recommended_diff
        })

    df = pd.DataFrame(data)
    
    # Save dataset
    out_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, 'synthetic_cognitive_dataset.csv')
    df.to_csv(out_path, index=False)
    print(f"[SUCCESS] Generated {len(df)} synthetic records saved to {os.path.abspath(out_path)}")
    return df

if __name__ == "__main__":
    generate_synthetic_dataset()
