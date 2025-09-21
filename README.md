# LieLens: Navigate Information with Insight

An AI-powered tool for combating misinformation by teaching users to detect psychological manipulation and cognitive biases.
(It is still just the prototype stage)

🚀 Live Demo & Prototype

---

## 💡 The Problem & Our Solution
The digital world is awash in misinformation that preys on human psychology, not just a lack of facts. Traditional fact-checking is a reactive approach, debunking falsehoods after they've already spread.

LieLens offers a proactive solution. Our tool uniquely analyzes digital content to identify specific psychological manipulation tactics and expose the cognitive biases being exploited. By empowering users to understand the "why" behind the content, LieLens fosters long-term digital resilience and transforms them into active, critical thinkers.

---

## ✨ Features
- **AI-Powered Analysis:** Leverages Google's Gemini 1.5 Pro with a custom-engineered prompt for deep, nuanced content evaluation.
- **Cognitive Bias Coach:** Identifies and explains the specific psychological biases being targeted (e.g., Confirmation Bias, Anchoring Bias).
- **Manipulation Tactics Detection:** Pinpoints emotional triggers, logical fallacies, and social engineering techniques used in the content.
- **Risk & Credibility Scoring:** Provides an immediate, clear assessment of content reliability.
- **Educational Insights:** Offers actionable advice, critical questions, and practical steps for independent verification.

---

## ⚙️ Getting Started
Follow these steps to set up the project locally.

### Prerequisites
- Python 3.10+
- Node.js (for local web server, optional)
- Google Cloud SDK with gcloud authenticated.

### Backend Setup (API)
Clone the repository:
```sh
git clone https://github.com/arbab7li/LieLens.git
cd LieLens
```

Navigate to the backend directory and set up a virtual environment:
```sh
cd lielens-backend
python -m venv venv
venv\Scripts\activate  # On Windows
# or
source venv/bin/activate  # On Mac/Linux
```

Install dependencies:
```sh
pip install -r requirements.txt
```

Set your Gemini API key as an environment variable:
```sh
set GEMINI_API_KEY="YOUR_GEMINI_API_KEY"  # On Windows
# or
export GEMINI_API_KEY="YOUR_GEMINI_API_KEY"  # On Mac/Linux
```

Run the FastAPI server:
```sh
uvicorn app:app --host 0.0.0.0 --port 8000
```

### Frontend Setup (Static Website)
Navigate to the frontend directory:
```sh
cd ..\lielens-frontend
```

Open `index.html` in your browser: You can either open the file directly or use a simple web server (e.g., `python -m http.server`).

---

## 🏗️ Architecture
LieLens is a full-stack web application built on a scalable, serverless architecture.

- **Frontend:** A single-page application built with HTML, CSS, and vanilla JavaScript. It sends user input to the backend and displays the AI-generated report.
- **Backend:** A Python FastAPI server, deployed on Google Cloud Run. It serves as an API to receive requests, call the Gemini API, and return a structured JSON response.
- **AI Model:** The core analysis is powered by the Google Gemini 1.5 Pro model via the Vertex AI API.

---

## 📦 Submission Deliverables
- [ ] A live, fully functional prototype.
- [ ] A well-structured, comprehensive presentation deck.
- [ ] A 3-minute demo video showcasing the project's features.
- [ ] This GitHub repository with all source code and documentation.

---

## 🤝 Team DevNeX
| Name                     | LinkedIn                  |
|--------------------------|---------------------------|
| Mohammed Anwar Qureshi   | [Link to your LinkedIn]   |
| Arbab Ansar Ali          | [Link to their LinkedIn]  |
| Mir Haroon Ali           | [Link to their LinkedIn]  |
