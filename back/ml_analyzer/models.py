# back/ml_analyzer/models.py
from pydantic import BaseModel, Field
from typing import Dict, List

class PasswordInput(BaseModel):
    """Request model for password analysis."""
    # Allow empty string as the model handles it via 'is_empty' feature
    password: str = Field(..., description="The password to analyze (can be empty).")

class MLAnalysisResult(BaseModel):
    """Response model for ML password analysis."""
    predicted_strength_label: str = Field(..., description="Human-readable strength label including emoji and score (e.g., '🔥 Weak (Score: 1)').")
    predicted_strength_score: int = Field(..., ge=0, le=4, description="Predicted strength score (0-4), corresponding to zxcvbn score levels.")
    confidence: float = Field(..., ge=0, le=1, description="Model's confidence probability (0.0 to 1.0) for the predicted score.")
    probabilities: Dict[str, float] = Field(..., description="Dictionary mapping each possible score ('Score 0' to 'Score 4') to its predicted probability.")
    analysis_time_seconds: float = Field(..., description="Total time taken for feature extraction and model prediction in seconds.")
    model_info: str = Field("LightGBM Classifier (Trained on RockYou Sample)", description="Identifier for the model used.")

    class Config:
        json_schema_extra = {
            "example": {
                "predicted_strength_label": "🔥 Weak (Score: 1)",
                "predicted_strength_score": 1,
                "confidence": 0.5108, # Probability of Score 1
                "probabilities": {
                    "Score 0": 0.4854,
                    "Score 1": 0.5108,
                    "Score 2": 0.0018,
                    "Score 3": 0.0010,
                    "Score 4": 0.0010
                },
                "analysis_time_seconds": 0.0152,
                "model_info": "LightGBM Classifier (Trained on RockYou Sample)"
            }
        }