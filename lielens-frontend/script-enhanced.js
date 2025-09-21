// Enhanced LieLens Frontend Script with multiple backend support
// List of potential backend URLs (add your deployed URLs here)
const backendUrls = [
    'https://your-render-app.onrender.com',  // Replace with your Render URL
    'https://your-railway-app.up.railway.app',  // Replace with your Railway URL
    'http://localhost:8000',  // Local development
    'https://mindful-compass-api-1082426526892.us-central1.run.app'  // Original URL
];

let activeBackendUrl = null;

// DOM Elements
const form = document.getElementById('analysisForm');
const contentInput = document.getElementById('contentInput');
const resultsSection = document.getElementById('resultsSection');
const errorSection = document.getElementById('errorSection');
const errorMessage = document.getElementById('errorMessage');
const loadingOverlay = document.getElementById('loadingOverlay');
const newAnalysisBtn = document.getElementById('newAnalysisBtn');
const retryBtn = document.getElementById('retryBtn');
const demoBtn = document.getElementById('demoBtn');
const backendStatus = document.getElementById('backendStatus');
const statusIcon = document.getElementById('statusIcon');
const statusText = document.getElementById('statusText');

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await checkBackendConnection();
});

// Check which backend is available
async function checkBackendConnection() {
    statusText.textContent = 'Checking backend connection...';
    statusIcon.className = 'fas fa-circle text-warning';
    
    for (const url of backendUrls) {
        try {
            console.log(`Testing backend: ${url}`);
            const response = await fetch(url + '/', { 
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept': 'application/json',
                }
            });
            
            if (response.ok) {
                activeBackendUrl = url;
                statusText.textContent = `Connected to backend`;
                statusIcon.className = 'fas fa-circle text-success';
                console.log(`Active backend: ${activeBackendUrl}`);
                return;
            }
        } catch (error) {
            console.log(`Backend ${url} not available:`, error.message);
        }
    }
    
    // No backend available
    statusText.textContent = 'Backend offline - Demo mode only';
    statusIcon.className = 'fas fa-circle text-error';
    console.log('No backend available, using demo mode');
}

// Demo button handler
demoBtn.addEventListener('click', async () => {
    contentInput.value = `BREAKING: Scientists SHOCKED by this simple trick that Big Pharma HATES! 
They don't want you to know this one secret that could save your life. 
Thousands of people are already using this, but the mainstream media won't report it. 
Act fast - this information might be taken down soon!`;
    
    // Trigger analysis with demo content
    await analyzeContent();
});

// Form submission handler
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await analyzeContent();
});

// Main analysis function
async function analyzeContent() {
    const content = contentInput.value.trim();
    if (!content) {
        showError('Please enter some content to analyze');
        return;
    }
    
    showLoading(true);
    resultsSection.classList.add('hidden');
    errorSection.classList.add('hidden');

    try {
        let analysisData;
        
        if (activeBackendUrl) {
            // Try to use live backend
            try {
                const response = await fetch(activeBackendUrl + '/analyze', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    mode: 'cors',
                    body: JSON.stringify({ content: content })
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                analysisData = await response.json();
            } catch (backendError) {
                console.error('Backend error:', backendError);
                // Fall back to demo mode
                analysisData = getDemoAnalysis(content);
                showNotification('Using demo mode - backend temporarily unavailable');
            }
        } else {
            // Use demo mode
            analysisData = getDemoAnalysis(content);
            showNotification('Running in demo mode');
        }
        
        displayReport(analysisData);

    } catch (error) {
        showError(`Analysis failed: ${error.message}`);
        console.error('Error:', error);
    } finally {
        showLoading(false);
    }
}

// Demo analysis generator
function getDemoAnalysis(content) {
    const contentLength = content.length;
    const hasURL = content.includes('http');
    const hasEmotionalWords = /breaking|shocking|secret|exclusive|banned|hidden|urgent/i.test(content);
    const hasAllCaps = /[A-Z]{4,}/.test(content);
    
    // Calculate risk based on content characteristics
    let riskScore = 30; // Base score
    if (hasEmotionalWords) riskScore += 25;
    if (hasAllCaps) riskScore += 20;
    if (content.includes('!')) riskScore += 10;
    if (contentLength < 100) riskScore -= 10;
    
    const riskLevel = riskScore > 70 ? 'HIGH' : riskScore > 50 ? 'MEDIUM' : 'LOW';
    const credibility = riskScore > 70 ? 'QUESTIONABLE' : riskScore > 50 ? 'QUESTIONABLE' : 'RELIABLE';
    
    return {
        "analysis_summary": {
            "risk_level": riskLevel,
            "risk_score": Math.min(riskScore, 95),
            "primary_concern": hasEmotionalWords ? 
                "Content uses emotional manipulation and urgency tactics" : 
                "Content appears relatively neutral",
            "credibility_rating": credibility
        },
        "detected_tactics": hasEmotionalWords ? [
            {
                "tactic_name": "Emotional Manipulation",
                "description": "Uses strong emotional language to bypass critical thinking",
                "example_from_content": content.substring(0, 100) + "...",
                "manipulation_type": "EMOTIONAL"
            },
            {
                "tactic_name": "Urgency Creation",
                "description": "Creates artificial time pressure to prompt immediate action",
                "example_from_content": "Act fast",
                "manipulation_type": "SOCIAL"
            }
        ] : [
            {
                "tactic_name": "Demo Analysis",
                "description": "This is a demonstration of our analysis capabilities",
                "example_from_content": "Sample content analysis",
                "manipulation_type": "LOGICAL"
            }
        ],
        "cognitive_biases": [
            {
                "bias_name": "Fear of Missing Out (FOMO)",
                "explanation": "The tendency to feel anxiety about missing beneficial opportunities",
                "how_its_exploited": "Content suggests exclusive or time-limited information",
                "resistance_tip": "Ask yourself: What's the real urgency? Can I verify this independently?"
            },
            {
                "bias_name": "Authority Bias",
                "explanation": "Tendency to trust information from perceived authority figures",
                "how_its_exploited": "References to 'scientists' or 'experts' without specific credentials",
                "resistance_tip": "Check the actual credentials and affiliations of cited experts"
            }
        ],
        "fact_check_flags": hasEmotionalWords ? [
            {
                "claim": "Scientists are 'shocked' by this discovery",
                "flag_reason": "Vague, unsupported claims about scientific consensus",
                "verification_suggestion": "Look for peer-reviewed studies and specific researcher names"
            }
        ] : [],
        "educational_insights": {
            "why_convincing": hasEmotionalWords ? 
                "Uses emotional triggers and authority appeals to create trust and urgency" :
                "Content appears straightforward without obvious manipulation",
            "target_audience": "People seeking health solutions or exclusive information",
            "psychological_appeal": "Combines fear, hope, and exclusivity to motivate action",
            "critical_questions": [
                "Who specifically are these 'scientists'?",
                "What evidence supports these claims?",
                "Why would this information be suppressed?",
                "What are the potential risks or side effects?"
            ],
            "verification_steps": [
                "Search for peer-reviewed research on this topic",
                "Check multiple reputable health information sources",
                "Consult with healthcare professionals",
                "Look for potential conflicts of interest"
            ]
        },
        "recommendations": {
            "immediate_action": riskScore > 70 ? 
                "Exercise extreme caution - verify all claims before acting" :
                "Proceed with normal fact-checking practices",
            "further_research": [
                "Search scientific databases for related research",
                "Check fact-checking websites",
                "Consult domain experts"
            ],
            "share_decision": riskScore > 70 ? "AVOID_SHARING" : "SHARE_WITH_CONTEXT",
            "learning_opportunity": "Practice identifying emotional manipulation in content"
        },
        "confidence_metrics": {
            "analysis_confidence": 75,
            "data_completeness": 60,
            "context_availability": "PARTIAL"
        },
        "metadata": {
            "analysis_timestamp": new Date().toISOString(),
            "model_used": "demo-mode",
            "content_length": contentLength,
            "source_type": hasURL ? "url" : "text"
        }
    };
}

// UI Helper Functions
function showLoading(show) {
    if (show) {
        loadingOverlay.classList.remove('hidden');
        document.getElementById('analyzeBtn').classList.add('loading');
    } else {
        loadingOverlay.classList.add('hidden');
        document.getElementById('analyzeBtn').classList.remove('loading');
    }
}

function showError(message) {
    errorMessage.textContent = message;
    errorSection.classList.remove('hidden');
}

function showNotification(message) {
    // Create a temporary notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #3b82f6;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 1001;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Event Listeners
newAnalysisBtn.addEventListener('click', () => {
    resultsSection.classList.add('hidden');
    contentInput.value = '';
    contentInput.focus();
});

retryBtn.addEventListener('click', () => {
    errorSection.classList.add('hidden');
    analyzeContent();
});

// Display Report (same as original but with enhanced error handling)
function displayReport(data) {
    resultsSection.classList.remove('hidden');
    window.scrollTo({ top: resultsSection.offsetTop, behavior: 'smooth' });

    const safeText = (text) => text || 'Not provided';
    const getRiskClass = (level) => level ? level.toLowerCase().replace('_', '-') : '';
    const getRatingClass = (rating) => rating ? rating.toLowerCase().replace('_', '-') : '';

    // Summary Card
    const summary = data.analysis_summary || {};
    document.getElementById('riskLevelText').textContent = summary.risk_level || 'UNKNOWN';
    document.getElementById('riskLevel').className = 'risk-level ' + getRiskClass(summary.risk_level);
    document.getElementById('credibilityRating').textContent = summary.credibility_rating || 'UNKNOWN';
    document.getElementById('credibilityRating').className = 'rating-value ' + getRatingClass(summary.credibility_rating);
    document.getElementById('primaryConcern').textContent = safeText(summary.primary_concern);

    // Detected Tactics
    const tacticsList = document.getElementById('detectedTactics');
    tacticsList.innerHTML = '';
    if (data.detected_tactics && data.detected_tactics.length > 0) {
        data.detected_tactics.forEach(tactic => {
            const tacticItem = document.createElement('div');
            tacticItem.className = 'tactic-item';
            tacticItem.innerHTML = `
                <div class="tactic-header">
                    <span class="tactic-name">${safeText(tactic.tactic_name)}</span>
                    <span class="manipulation-type ${getRatingClass(tactic.manipulation_type)}">${safeText(tactic.manipulation_type)}</span>
                </div>
                <p class="tactic-description">${safeText(tactic.description)}</p>
                <div class="tactic-example">
                    <p>${safeText(tactic.example_from_content)}</p>
                </div>
            `;
            tacticsList.appendChild(tacticItem);
        });
    } else {
        tacticsList.innerHTML = '<p class="text-center">No specific manipulation tactics detected.</p>';
    }

    // Cognitive Biases
    const biasesList = document.getElementById('cognitiveBiases');
    biasesList.innerHTML = '';
    if (data.cognitive_biases && data.cognitive_biases.length > 0) {
        data.cognitive_biases.forEach(bias => {
            const biasItem = document.createElement('div');
            biasItem.className = 'bias-item';
            biasItem.innerHTML = `
                <div class="bias-header">
                    <h4>${safeText(bias.bias_name)}</h4>
                    <p>${safeText(bias.explanation)}</p>
                </div>
                <p><strong>How it's exploited:</strong> ${safeText(bias.how_its_exploited)}</p>
                <p class="resistance-tip"><strong>Tip:</strong> ${safeText(bias.resistance_tip)}</p>
            `;
            biasesList.appendChild(biasItem);
        });
    } else {
        biasesList.innerHTML = '<p class="text-center">No specific cognitive biases targeted.</p>';
    }

    // Educational Insights
    const insights = data.educational_insights || {};
    document.getElementById('whyConvincing').textContent = safeText(insights.why_convincing);
    document.getElementById('targetAudience').textContent = safeText(insights.target_audience);
    document.getElementById('psychologicalAppeal').textContent = safeText(insights.psychological_appeal);

    const criticalQuestionsList = document.getElementById('criticalQuestions');
    criticalQuestionsList.innerHTML = '';
    if (insights.critical_questions && insights.critical_questions.length > 0) {
        insights.critical_questions.forEach(q => {
            const li = document.createElement('li');
            li.textContent = q;
            criticalQuestionsList.appendChild(li);
        });
    }

    const verificationStepsList = document.getElementById('verificationSteps');
    verificationStepsList.innerHTML = '';
    if (insights.verification_steps && insights.verification_steps.length > 0) {
        insights.verification_steps.forEach(step => {
            const li = document.createElement('li');
            li.textContent = step;
            verificationStepsList.appendChild(li);
        });
    }
    
    // Fact Check Flags
    const factCheckFlagsList = document.getElementById('factCheckFlags');
    const factCheckSection = document.getElementById('factCheckSection');
    factCheckFlagsList.innerHTML = '';
    if (data.fact_check_flags && data.fact_check_flags.length > 0) {
        factCheckSection.classList.remove('hidden');
        data.fact_check_flags.forEach(flag => {
            const flagItem = document.createElement('div');
            flagItem.className = 'flag-item';
            flagItem.innerHTML = `
                <p class="flag-claim">Claim: "${safeText(flag.claim)}"</p>
                <p class="flag-reason"><strong>Reason:</strong> ${safeText(flag.flag_reason)}</p>
                <p class="flag-reason"><strong>Suggestion:</strong> ${safeText(flag.verification_suggestion)}</p>
            `;
            factCheckFlagsList.appendChild(flagItem);
        });
    } else {
        factCheckSection.classList.add('hidden');
    }

    // Recommendations
    const recs = data.recommendations || {};
    document.getElementById('immediateAction').textContent = safeText(recs.immediate_action);
    document.getElementById('shareDecision').className = 'share-decision ' + getRatingClass(recs.share_decision);
    document.getElementById('shareDecision').querySelector('.decision-badge').textContent = safeText(recs.share_decision);
    document.getElementById('learningOpportunity').textContent = safeText(recs.learning_opportunity);
    
    const furtherResearchList = document.getElementById('furtherResearch');
    furtherResearchList.innerHTML = '';
    if (recs.further_research && recs.further_research.length > 0) {
        recs.further_research.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            furtherResearchList.appendChild(li);
        });
    }
    
    // Confidence Metrics
    const metrics = data.confidence_metrics || {};
    const analysisConfidenceBar = document.getElementById('analysisConfidenceBar');
    const dataCompletenessBar = document.getElementById('dataCompletenessBar');
    const contextAvailability = document.getElementById('contextAvailability');
    
    const analysisConf = metrics.analysis_confidence || 0;
    const dataComp = metrics.data_completeness || 0;
    
    analysisConfidenceBar.style.width = `${analysisConf}%`;
    document.getElementById('analysisConfidenceText').textContent = `${analysisConf}%`;
    
    dataCompletenessBar.style.width = `${dataComp}%`;
    document.getElementById('dataCompletenessText').textContent = `${dataComp}%`;
    
    contextAvailability.textContent = metrics.context_availability || 'UNKNOWN';
    contextAvailability.className = 'context-badge ' + getRatingClass(metrics.context_availability);
}

// Add CSS for status indicators
const style = document.createElement('style');
style.textContent = `
.backend-status {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 16px;
    padding: 8px 12px;
    background: rgba(255,255,255,0.1);
    border-radius: 8px;
    font-size: 14px;
}

.text-success { color: #10b981; }
.text-warning { color: #f59e0b; }
.text-error { color: #ef4444; }

.demo-section {
    text-align: center;
    margin: 16px 0;
    padding: 16px;
    background: rgba(59, 130, 246, 0.05);
    border-radius: 8px;
    border: 1px solid rgba(59, 130, 246, 0.1);
}

.demo-btn {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 24px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    margin-bottom: 8px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.demo-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

.demo-section small {
    display: block;
    color: #6b7280;
    font-style: italic;
}

.notification {
    animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}
`;
document.head.appendChild(style);