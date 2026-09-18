from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class RecommendationRequest(BaseModel):
    accuracy: float = Field(..., ge=0.0, le=1.0, description="Session accuracy (0.0 to 1.0)")
    reaction_time: float = Field(..., ge=0.0, description="Average reaction time in seconds")
    mistakes: int = Field(..., ge=0, description="Count of mistakes")
    completion_rate: Optional[float] = Field(1.0, ge=0.0, le=1.0)
    previous_score: int = Field(..., ge=0, le=100, description="Previous session score")
    previous_difficulty: int = Field(..., ge=1, le=5, description="Previous session difficulty level (1-5)")
    game_type: str = Field("memory", description="Game type: memory, pattern, routine, object_rec")
    mood: Optional[str] = Field("good", description="Self-reported mood")
    session_count: Optional[int] = Field(1)

class RecommendationResponse(BaseModel):
    recommended_difficulty: int = Field(..., description="Recommended difficulty level (1-5)")
    confidence: float = Field(..., description="AI Model confidence score (0.0 to 1.0)")
    reason: str = Field(..., description="Explainable AI explanation string")
    engine_used: str = Field(..., description="Engine type: XGBoost / Random Forest / Rule Fallback")
    previous_difficulty: int
    performance_trend: str

class CognitiveScoreRequest(BaseModel):
    patient_id: str
    sessions: List[Dict[str, Any]]

class CognitiveScoreResponse(BaseModel):
    memory_score: int
    attention_score: int
    recognition_score: int
    response_score: int
    consistency_score: int
    engagement_score: int
    overall_performance_indicator: int
    disclaimer: str = "Supportive cognitive performance indicators. NOT a clinical diagnosis."

class PerformanceAnalysisRequest(BaseModel):
    recent_baseline_score: float = Field(..., description="Average score from last 5-10 sessions")
    today_score: float = Field(..., description="Score from today's session")
    patient_name: Optional[str] = "Patient"

class PerformanceAnalysisResponse(BaseModel):
    alert_triggered: bool
    severity: Optional[str] = None
    message: str
    baseline_score: float
    today_score: float
    percentage_change: float
