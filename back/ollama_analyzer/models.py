# /your_project_root/back/ollama_analyzer/models.py
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional # Make sure Optional is imported

class Part(BaseModel):
    text: str

class Content(BaseModel):
    parts: List[Part]

class GenerationConfig(BaseModel):
    temperature: Optional[float] = None
    top_k: Optional[int] = Field(None, alias='topK')
    top_p: Optional[float] = Field(None, alias='topP')
    max_output_tokens: Optional[int] = Field(None, alias='maxOutputTokens')
    response_mime_type: Optional[str] = Field(None, alias='responseMimeType')

class OllamaApiRequest(BaseModel):
    contents: List[Content]
    generation_config: Optional[GenerationConfig] = Field(None, alias='generationConfig')

class AnalysisResponse(BaseModel):
    suggestions: List[str]
    reasoning: List[str]
    # Allow improvedPassword to be None if the AI doesn't provide it
    improvedPassword: Optional[str] = None # <-- Change here