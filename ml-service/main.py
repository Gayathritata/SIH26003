import sys
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict

# Ensure src/ is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'src')))

# pyrefly: ignore [missing-import]
from predict import predict_recommended_difficulty, load_model_package

app = FastAPI(
    title="MINDMATE NER - AI Adaptive Difficulty Engine",
    description="FastAPI service serving XGBoost cognitive game difficulty recommendation predictions.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictDifficultyRequest(BaseModel):
    accuracy: float = Field(..., description="Accuracy ratio 0.0 to 1.0 or percentage 0-100")
    score: float = Field(..., description="Recent game score")
    completionTime: Optional[float] = Field(30.0, description="Completion duration in seconds")
    attempts: Optional[int] = Field(5, description="Attempts count")
    incorrectAttempts: Optional[int] = Field(0, description="Mistakes count")
    correctAnswers: Optional[int] = Field(5, description="Correct matches/answers count")
    completionRate: Optional[float] = Field(1.0, description="Completion rate ratio")
    previousDifficulty: Optional[str] = Field("easy", description="Previous difficulty: easy, medium, or hard")
    gameType: Optional[str] = Field("memory_match", description="Game type")

class PredictDifficultyResponse(BaseModel):
    recommendedDifficulty: str
    confidence: float
    probabilities: Dict[str, float]
    explanation: Optional[str] = None
    disclaimer: Optional[str] = None

@app.get("/")
@app.get("/health")
def health_check():
    package = load_model_package()
    model_name = package.get('model_name', 'XGBoost Classifier') if package else 'Unavailable'
    return {
        "status": "online",
        "service": "MINDMATE NER AI Adaptive Service",
        "model_name": model_name,
        "disclaimer": "Adaptive game difficulty recommendation engine — non-clinical demonstration."
    }

@app.post("/predict-difficulty", response_model=PredictDifficultyResponse)
@app.post("/ai/recommend-difficulty")
def predict_difficulty_endpoint(req: PredictDifficultyRequest):
    try:
        session_data = req.dict()
        prediction = predict_recommended_difficulty(session_data)
        return PredictDifficultyResponse(**prediction)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ML Prediction Service Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
