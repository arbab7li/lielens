# Mindful Compass - Cloud Run Backend API
# FastAPI backend that processes content and returns cognitive bias analysis

import os
import json
import requests
import logging
from typing import Dict, List, Any, Optional
from urllib.parse import urlparse
import re
from datetime import datetime
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl, Field
import google.generativeai as genai
from google.cloud import secretmanager_v1 as secretmanager
import uvicorn


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="LieLens API",
    description="AI-powered misinformation detection and cognitive bias coaching",
    version="1.0.0"
)

# Configure CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for demo/development - configure properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cell 3: Define Request and Response Models
# This cell contains the data validation models.

class AnalysisRequest(BaseModel):
    content: str = Field(..., min_length=10, max_length=10000, description="URL or text content to analyze")
    content_type: str = Field(default="auto", description="'url', 'text', or 'auto' to detect")
    user_id: Optional[str] = Field(None, description="Optional user identifier for analytics")

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    version: str

class ErrorResponse(BaseModel):
    error: str
    message: str
    timestamp: str

# Import our prompt system
class MindfulCompassPrompt:
    """Core prompt engineering system for cognitive bias analysis"""
    
    @staticmethod
    def get_analysis_prompt(content: str, source_type: str = "text") -> str:
        """Generate the master prompt for Gemini analysis"""
        
        prompt = f"""
You are the "Mindful Compass" - an advanced AI system that analyzes content for misinformation and educates users about psychological manipulation tactics.

Your mission: Don't just detect falsehoods, but EDUCATE users about WHY they might be susceptible and HOW the content manipulates them.

CONTENT TO ANALYZE:
{content}

SOURCE TYPE: {source_type}

ANALYSIS FRAMEWORK:
Perform comprehensive analysis across these dimensions:

1. CREDIBILITY ASSESSMENT
- Factual accuracy and verifiability
- Missing context or cherry-picked data
- Source credibility and methodology

2. PSYCHOLOGICAL MANIPULATION DETECTION  
- Emotional triggers (fear, anger, outrage, false hope)
- Social proof manipulation (bandwagon, false consensus)
- Authority manipulation (false expertise, appeal to authority)
- Urgency/scarcity tactics ("act now", "exclusive information")

3. COGNITIVE BIAS EXPLOITATION
- Confirmation bias (reinforces existing beliefs)
- Availability heuristic (vivid stories over data)
- Anchoring bias (misleading initial framing)
- In-group bias (us vs. them narratives)

4. LINGUISTIC ANALYSIS
- Loaded language and emotional triggers
- Vague claims without evidence
- Logical fallacies and reasoning errors
- Overall tone and intent

5. EDUCATIONAL COACHING
- Explain WHY someone might find this convincing
- Teach about specific biases being targeted
- Provide actionable evaluation tips
- Suggest verification strategies

CRITICAL: Respond ONLY with valid JSON in this exact format:

{{
  "analysis_summary": {{
    "risk_level": "LOW|MEDIUM|HIGH|CRITICAL",
    "risk_score": 0-100,
    "primary_concern": "string",
    "credibility_rating": "RELIABLE|QUESTIONABLE|UNRELIABLE|FABRICATED"
  }},
  "detected_tactics": [
    {{
      "tactic_name": "string",
      "description": "string", 
      "example_from_content": "string",
      "manipulation_type": "EMOTIONAL|LOGICAL|SOCIAL|AUTHORITY"
    }}
  ],
  "cognitive_biases": [
    {{
      "bias_name": "string",
      "explanation": "string",
      "how_its_exploited": "string", 
      "resistance_tip": "string"
    }}
  ],
  "fact_check_flags": [
    {{
      "claim": "string",
      "flag_reason": "string",
      "verification_suggestion": "string"
    }}
  ],
  "educational_insights": {{
    "why_convincing": "string",
    "target_audience": "string", 
    "psychological_appeal": "string",
    "critical_questions": ["string1", "string2"],
    "verification_steps": ["string1", "string2"]
  }},
  "recommendations": {{
    "immediate_action": "string",
    "further_research": ["string1", "string2"],
    "share_decision": "SAFE_TO_SHARE|SHARE_WITH_CONTEXT|AVOID_SHARING|DO_NOT_SHARE",
    "learning_opportunity": "string"
  }},
  "confidence_metrics": {{
    "analysis_confidence": 0-100,
    "data_completeness": 0-100,
    "context_availability": "FULL|PARTIAL|LIMITED|INSUFFICIENT"
  }}
}}
        """
        return prompt.strip()


# Cell 5: Content Processing and Gemini Integration
# This cell contains the utility classes for fetching content and interacting with the Gemini API.

# Content Processing Utils
class ContentProcessor:
    """Handle URL fetching and content cleaning"""
    
    @staticmethod
    def is_valid_url(url: str) -> bool:
        """Check if string is a valid URL"""
        try:
            result = urlparse(url)
            return all([result.scheme, result.netloc])
        except:
            return False
    
    @staticmethod
    def fetch_url_content(url: str, timeout: int = 10) -> Dict[str, Any]:
        """Fetch and clean content from URL"""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            
            response = requests.get(url, headers=headers, timeout=timeout)
            response.raise_for_status()
            
            content = response.text
            clean_content = re.sub(r'<[^>]+>', ' ', content)
            clean_content = re.sub(r'\s+', ' ', clean_content).strip()
            
            if len(clean_content) > 8000:
                clean_content = clean_content[:8000] + "... [content truncated]"
            
            return {
                "success": True,
                "content": clean_content,
                "url": url,
                "status_code": response.status_code
            }
            
        except requests.RequestException as e:
            logger.error(f"Error fetching URL {url}: {str(e)}")
            return {
                "success": False,
                "error": f"Failed to fetch URL: {str(e)}",
                "url": url
            }

# Gemini Integration
class GeminiAnalyzer:
    """Handle Gemini API integration for content analysis"""
    
    def __init__(self):
        # Try multiple ways to get the API key
        self.api_key = (
            os.getenv('GEMINI_API_KEY') or 
            os.getenv('GOOGLE_API_KEY') or 
            os.getenv('API_KEY')
        )
        
        if self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel('gemini-1.5-pro')
                logger.info("Gemini API configured successfully")
            except Exception as e:
                logger.warning(f"Failed to configure Gemini API: {e}")
                self.model = None
        else:
            self.model = None
            logger.warning("Gemini API key not found - running in demo mode")
    
    def _get_demo_response(self) -> Dict[str, Any]:
        """Return demo response when API is not available"""
        return {
            "analysis_summary": {
                "risk_level": "MEDIUM",
                "risk_score": 65,
                "primary_concern": "Demo mode - Limited analysis available",
                "credibility_rating": "QUESTIONABLE"
            },
            "detected_tactics": [
                {
                    "tactic_name": "Demo Analysis",
                    "description": "This is a demonstration response",
                    "example_from_content": "Sample content",
                    "manipulation_type": "EMOTIONAL"
                }
            ],
            "cognitive_biases": [
                {
                    "bias_name": "Demo Bias",
                    "explanation": "This is a sample analysis",
                    "how_its_exploited": "Demo content",
                    "resistance_tip": "Set up Gemini API for full analysis"
                }
            ],
            "fact_check_flags": [],
            "educational_insights": {
                "why_convincing": "Demo mode active",
                "target_audience": "Developers testing the system",
                "psychological_appeal": "Shows system functionality",
                "critical_questions": ["Is the API key configured?"],
                "verification_steps": ["Configure Gemini API key"]
            },
            "recommendations": {
                "immediate_action": "Configure production API access",
                "further_research": ["Set up Google Cloud credentials"],
                "share_decision": "SAFE_TO_SHARE",
                "learning_opportunity": "Understanding system architecture"
            },
            "confidence_metrics": {
                "analysis_confidence": 0,
                "data_completeness": 0,
                "context_availability": "INSUFFICIENT"
            },
            "metadata": {
                "analysis_timestamp": datetime.utcnow().isoformat(),
                "model_used": "demo-mode",
                "content_length": 0,
                "source_type": "demo"
            }
        }
    
    def analyze_content(self, content: str, source_type: str = "text") -> Dict[str, Any]:
        """Perform AI analysis using Gemini"""
        
        if not self.model:
            return self._get_demo_response()
        
        try:
            prompt = MindfulCompassPrompt.get_analysis_prompt(content, source_type)
            
            generation_config = {
                "temperature": 0.1,
                "top_p": 0.8,
                "top_k": 40,
                "max_output_tokens": 4000,
            }
            
            response = self.model.generate_content(
                prompt,
                generation_config=generation_config
            )
            
            response_text = response.text.strip()
            
            if response_text.startswith("```json"):
                response_text = response_text[7:-3].strip()
            elif response_text.startswith("```"):
                response_text = response_text[3:-3].strip()
            
            analysis_result = json.loads(response_text)
            
            analysis_result["metadata"] = {
                "analysis_timestamp": datetime.utcnow().isoformat(),
                "model_used": "gemini-1.5-pro",
                "content_length": len(content),
                "source_type": source_type
            }
            
            return analysis_result
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {e}")
            logger.error(f"Raw response: {response.text[:500]}...")
            raise HTTPException(status_code=500, detail="AI response format error")
        
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

# Initialize services
content_processor = ContentProcessor()
gemini_analyzer = GeminiAnalyzer()

# API Endpoints
@app.get("/", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow().isoformat(),
        version="1.0.0"
    )

@app.post("/analyze")
async def analyze_content(request: AnalysisRequest):
    """
    Main analysis endpoint - the core of our Mindful Compass
    """
    try:
        content = request.content.strip()
        
        # Determine content type
        if request.content_type == "auto":
            content_type = "url" if content_processor.is_valid_url(content) else "text"
        else:
            content_type = request.content_type
        
        # Process URL content if needed
        if content_type == "url":
            logger.info(f"Fetching content from URL: {content[:100]}...")
            url_result = content_processor.fetch_url_content(content)
            
            if not url_result["success"]:
                raise HTTPException(
                    status_code=400,
                    detail=f"Could not fetch URL content: {url_result['error']}"
                )
            
            analysis_content = url_result["content"]
            source_info = {"original_url": content, "fetched_successfully": True}
        else:
            analysis_content = content
            source_info = {"content_type": "direct_text"}
        
        # Perform AI analysis
        logger.info(f"Analyzing {content_type} content ({len(analysis_content)} chars)")
        analysis_result = gemini_analyzer.analyze_content(analysis_content, content_type)
        
        # Add source information
        analysis_result["source_info"] = source_info
        
        logger.info("Analysis completed successfully")
        return analysis_result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in analyze_content: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/demo")
async def get_demo_analysis():
    """Get a demo analysis for testing frontend"""
    demo_content = """
    BREAKING: Scientists SHOCKED by this simple trick that Big Pharma HATES! 
    They don't want you to know this one secret that could save your life. 
    Thousands of people are already using this, but the mainstream media won't report it. 
    Act fast - this information might be taken down soon!
    """
    
    analysis = gemini_analyzer.analyze_content(demo_content, "text")
    return analysis

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return ErrorResponse(
        error=exc.detail,
        message=f"HTTP {exc.status_code}",
        timestamp=datetime.utcnow().isoformat()
    )
if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))  # Default to 8000, but allow PORT env var
    host = os.getenv("HOST", "0.0.0.0")
    
    try:
        import nest_asyncio
        nest_asyncio.apply()
    except ImportError:
        pass  # nest_asyncio not available, continue without it
    
    logger.info(f"Starting server on {host}:{port}")
    uvicorn.run(app, host=host, port=port)    