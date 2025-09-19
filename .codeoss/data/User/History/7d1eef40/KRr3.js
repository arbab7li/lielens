const backendUrl = 'https://mindful-compass-api-1082426526892.us-central1.run.app';
const form = document.getElementById('analysisForm');
const contentInput = document.getElementById('contentInput');
const resultsSection = document.getElementById('resultsSection');
const errorSection = document.getElementById('errorSection');
const errorMessage = document.getElementById('errorMessage');
const loadingOverlay = document.getElementById('loadingOverlay');
const newAnalysisBtn = document.getElementById('newAnalysisBtn');
const retryBtn = document.getElementById('retryBtn');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const content = contentInput.value.trim();
    if (!content) {
        return;
    }
    
    showLoading(true);
    resultsSection.classList.add('hidden');
    errorSection.classList.add('hidden');

    try {
        const response = await fetch(backendUrl + '/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content: content })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Analysis failed');
        }

        const analysisData = await response.json();
        
        displayReport(analysisData);

    } catch (error) {
        showError(error.message);
        console.error('Error:', error);
    } finally {
        showLoading(false);
    }
});

newAnalysisBtn.addEventListener('click', () => {
    resultsSection.classList.add('hidden');
    contentInput.value = '';
});

retryBtn.addEventListener('click', () => {
    errorSection.classList.add('hidden');
});

function showLoading(show) {
    if (show) {
        loadingOverlay.classList.remove('hidden');
    } else {
        loadingOverlay.classList.add('hidden');
    }
}

function showError(message) {
    errorMessage.textContent = message;
    errorSection.classList.remove('hidden');
}

function displayReport(data) {
    // Hide form and show results
    resultsSection.classList.remove('hidden');
    window.scrollTo({ top: resultsSection.offsetTop, behavior: 'smooth' });

    // Helper function for safe string
    const safeText = (text) => text || 'Not provided';
    
    // Helper function to map risk levels to CSS classes
    const getRiskClass = (level) => {
        if (!level) return '';
        return level.toLowerCase().replace('_', '-');
    };

    // Helper function to map credibility ratings to CSS classes
    const getRatingClass = (rating) => {
        if (!rating) return '';
        return rating.toLowerCase().replace('_', '-');
    };

    // --- Summary Card ---
    const summary = data.analysis_summary;
    document.getElementById('riskLevelText').textContent = summary.risk_level;
    document.getElementById('riskLevel').className = 'risk-level ' + getRiskClass(summary.risk_level);
    document.getElementById('credibilityRating').textContent = summary.credibility_rating;
    document.getElementById('credibilityRating').className = 'rating-value ' + getRatingClass(summary.credibility_rating);
    document.getElementById('primaryConcern').textContent = safeText(summary.primary_concern);

    // --- Detected Tactics ---
    const tacticsList = document.getElementById('detectedTactics');
    tacticsList.innerHTML = ''; // Clear previous results
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

    // --- Cognitive Biases ---
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

    // --- Educational Insights ---
    const insights = data.educational_insights;
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
    
    // --- Fact Check Flags ---
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

    // --- Recommendations ---
    const recs = data.recommendations;
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
    
    // --- Confidence Metrics ---
    const metrics = data.confidence_metrics;
    const analysisConfidenceBar = document.getElementById('analysisConfidenceBar');
    const dataCompletenessBar = document.getElementById('dataCompletenessBar');
    const contextAvailability = document.getElementById('contextAvailability');
    
    analysisConfidenceBar.style.width = `${metrics.analysis_confidence}%`;
    document.getElementById('analysisConfidenceText').textContent = `${metrics.analysis_confidence}%`;
    
    dataCompletenessBar.style.width = `${metrics.data_completeness}%`;
    document.getElementById('dataCompletenessText').textContent = `${metrics.data_completeness}%`;
    
    contextAvailability.textContent = metrics.context_availability;
    contextAvailability.className = 'context-badge ' + getRatingClass(metrics.context_availability);
}