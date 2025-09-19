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

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl, Field
import google.generativeai as genai
from google.cloud import secretmanager
import uvicorn
import google.auth

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(_name_)

# Initialize FastAPI app
app = FastAPI(
    title="Mindful Compass API",
    description="AI-powered misinformation detection and cognitive bias coaching",
    version="1.0.0"
)

# Configure CORS for frontend integration
app.add_middleware(