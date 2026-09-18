import sys
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Ensure parent directory is in python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.schemas import (
    RecommendationRequest, RecommendationResponse,
    CognitiveScoreRequest, CognitiveScoreResponse,
    PerformanceAnalysisRequest, PerformanceAnalysisResponse
)
from app.services import ml_service, calculate_cognitive_indicators, analyze_performance_change

app = FastAPI(
    title="MINDMATE NER - AI/ML Adaptive Cognitive Engine",
    description="Provides adaptive difficulty recommendations, explainable AI, and performance change alerts.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
@app.get("/health")
def health_check():
    model_status = "loaded" if ml_service.model_package else "rule_fallback_active"
    return {
        "status": "online",
        "service": "MINDMATE NER AI Engine",
        "model_status": model_status,
        "disclaimer": "Supportive cognitive assistance engine. NOT a medical diagnostic tool."
    }

@app.post("/ai/recommend-difficulty", response_model=RecommendationResponse)
def recommend_difficulty(request: RecommendationRequest):
    try:
        return ml_service.recommend(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ML Recommendation engine error: {str(e)}")

@app.post("/ai/performance-score", response_model=CognitiveScoreResponse)
def calculate_performance_score(request: CognitiveScoreRequest):
    try:
        indicators = calculate_cognitive_indicators(request.sessions)
        return CognitiveScoreResponse(**indicators)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cognitive score calculation error: {str(e)}")

@app.post("/ai/analyze-performance", response_model=PerformanceAnalysisResponse)
def analyze_performance(request: PerformanceAnalysisRequest):
    try:
        res = analyze_performance_change(
            request.recent_baseline_score,
            request.today_score,
            request.patient_name or "Patient"
        )
        return PerformanceAnalysisResponse(**res)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Performance analysis error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
