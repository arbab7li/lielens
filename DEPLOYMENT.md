# Deployment Guide for LieLens

## Quick Deployment Options

### Option 1: Render (Recommended - Free Tier)
1. Push your code to GitHub
2. Go to [render.com](https://render.com) and sign up
3. Connect your GitHub repository
4. Create a new "Web Service"
5. Set build command: `pip install -r lielens-backend/requirements.txt`
6. Set start command: `cd lielens-backend && python app.py`
7. Add environment variable: `GEMINI_API_KEY` with your API key
8. Deploy!

### Option 2: Railway
1. Push to GitHub
2. Go to [railway.app](https://railway.app)
3. Deploy from GitHub repo
4. Add environment variable: `GEMINI_API_KEY`
5. Railway will auto-detect and deploy

### Option 3: Render + Netlify (Frontend & Backend separate)
**Backend on Render:**
- Follow Option 1 above

**Frontend on Netlify:**
1. Update `script.js` with your Render backend URL
2. Deploy `lielens-frontend` folder to [netlify.com](https://netlify.com)
3. Drag and drop the frontend folder or connect GitHub

### Option 4: GitHub Pages (Frontend only, with demo mode)
1. Update `script.js` to use demo mode or a public API
2. Enable GitHub Pages in repository settings
3. Deploy from `lielens-frontend` folder

## Environment Variables Needed
- `GEMINI_API_KEY`: Your Google Gemini API key
- `PORT`: Will be set automatically by hosting platforms
- `HOST`: Will be set automatically

## Testing Deployment
1. Backend health check: `https://your-backend-url.com/`
2. Demo endpoint: `https://your-backend-url.com/demo`
3. Frontend should connect automatically

## Demo Mode
If you don't have a Gemini API key, the backend will run in demo mode with sample responses.