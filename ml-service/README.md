# MINDMATE NER — Adaptive Cognitive Difficulty Engine (XGBoost ML Pipeline)

This directory contains the Python machine learning pipeline for **MINDMATE NER** adaptive difficulty recommendation.

---

## 📌 DISCLAIMER
> **IMPORTANT**: This ML model is an adaptive game difficulty recommendation system designed to keep cognitive games engaging and appropriately challenging for elderly users.
> It is **NOT** a medical diagnostic tool and does **NOT** diagnose dementia, Alzheimer's disease, or any clinical condition.

---

## 🏗️ Project Architecture

```
ml-service/
├── data/
│   └── training_data.csv        # Generated prototype synthetic training dataset
├── models/
│   └── difficulty_model.pkl     # Serialized XGBoost trained model package
├── src/
│   ├── generate_data.py         # Reproducible synthetic data generator (seed=42)
│   ├── preprocess.py            # Feature extraction & normalization pipeline
│   ├── train_model.py           # XGBoost training, stratified evaluation & export
│   └── predict.py               # Reusable inference function & class probabilities
├── requirements.txt             # Python dependencies
└── README.md                    # System documentation
```

---

## 📊 Features & Target Definition

### **Input Features**
* `accuracy`: Game session accuracy ratio (`0.0` to `1.0`)
* `score`: Transparent performance score (`0` to `200`)
* `completionTime`: Session completion duration in seconds (`5.0` to `180.0`)
* `attempts`: Total attempts made
* `incorrectAttempts`: Number of mistakes/mismatches made
* `correctAnswers`: Number of correct matches/answers
* `completionRate`: Completion percentage ratio (`0.0` to `1.0`)
* `previousDifficultyNum`: Numerical previous difficulty level (`1`=easy, `2`=medium, `3`=hard)
* `gameType_*`: One-hot encoded game categories (`memory_match`, `pattern_recognition`, `daily_routine_recall`, `object_recognition`)

### **Target Variable**
* `recommendedDifficulty`: Target difficulty class (`easy`, `medium`, `hard`)

---

## 🚀 How to Run

### **1. Generate Synthetic Training Data**
```bash
python src/generate_data.py
```

### **2. Train & Evaluate XGBoost Model**
```bash
python src/train_model.py
```

### **3. Run Inference Tests**
```bash
python src/predict.py
```

---

## 🎯 Sample Inference Output

```json
{
  "recommendedDifficulty": "hard",
  "confidence": 0.875,
  "probabilities": {
    "easy": 0.035,
    "medium": 0.090,
    "hard": 0.875
  },
  "explanation": "Difficulty recommended (hard) based on recent game performance metrics (accuracy: 90%, completion time: 18.5s).",
  "disclaimer": "Adaptive game difficulty recommendation engine — non-clinical demonstration."
}
```
