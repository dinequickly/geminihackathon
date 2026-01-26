"""
Linguistic Analysis Service

FastAPI service that performs linguistic analysis using:
- COAST: Orality score (how "spoken-like" vs "written-like")
- textstat: Readability metrics
- spaCy: POS tagging and discourse marker detection
- LingFeat: Advanced linguistic features (optional)
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
import spacy
import textstat
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(
    title="Linguistic Analysis Service",
    description="Analyzes text for linguistic features including POS, readability, and orality",
    version="1.0.0"
)

# Load spaCy model (English)
try:
    nlp = spacy.load("en_core_web_sm")
    logger.info("spaCy model loaded successfully")
except OSError:
    logger.warning("spaCy model not found. Run: python -m spacy download en_core_web_sm")
    nlp = None

# Try to import COAST (optional)
try:
    from coast import coast
    COAST_AVAILABLE = True
    logger.info("COAST library loaded successfully")
except ImportError:
    COAST_AVAILABLE = False
    logger.warning("COAST not available. Install with: pip install git+https://github.com/katrinortmann/COAST.git")

# Try to import LingFeat (optional - large dependency)
try:
    import lingfeat
    LINGFEAT_AVAILABLE = True
    logger.info("LingFeat library loaded successfully")
except ImportError:
    LINGFEAT_AVAILABLE = False
    logger.warning("LingFeat not available. Install with: pip install lingfeat")

# ============================================================
# Request/Response Models
# ============================================================

class Segment(BaseModel):
    segment_index: int
    text: str

class AnalysisRequest(BaseModel):
    segments: List[Segment]

class POSCounts(BaseModel):
    nouns: int = 0
    verbs: int = 0
    adjectives: int = 0
    adverbs: int = 0
    pronouns: int = 0
    prepositions: int = 0
    conjunctions: int = 0
    interjections: int = 0

class ReadabilityMetrics(BaseModel):
    flesch_reading_ease: float = 0.0
    flesch_kincaid_grade: float = 0.0
    gunning_fog: float = 0.0
    smog_index: float = 0.0
    automated_readability_index: float = 0.0
    coleman_liau_index: float = 0.0

class LingFeatSummary(BaseModel):
    lexical_diversity: float = 0.0
    avg_word_length: float = 0.0
    sentence_complexity: float = 0.0

class SegmentResult(BaseModel):
    segment_index: int
    text: str
    orality_score: float
    parts_of_speech: POSCounts
    discourse_markers: List[str]
    readability_score: float
    readability_metrics: Optional[ReadabilityMetrics] = None
    lingfeat_summary: Optional[LingFeatSummary] = None

class AnalysisResponse(BaseModel):
    success: bool
    error: Optional[str] = None
    results: List[SegmentResult]

# ============================================================
# Discourse Markers
# ============================================================

DISCOURSE_MARKERS = {
    # Additive
    "also", "and", "besides", "furthermore", "moreover", "additionally", "plus",
    # Contrastive
    "but", "however", "although", "though", "yet", "still", "nevertheless", "nonetheless",
    "on the other hand", "in contrast", "conversely",
    # Causal
    "because", "since", "therefore", "thus", "so", "hence", "consequently", "as a result",
    # Temporal
    "then", "first", "next", "finally", "meanwhile", "afterwards", "previously", "subsequently",
    # Topic markers
    "well", "now", "okay", "right", "so", "anyway", "actually", "basically",
    # Hedging
    "like", "sort of", "kind of", "i think", "i guess", "maybe", "perhaps", "probably",
    # Response markers
    "yes", "yeah", "no", "right", "okay", "sure", "absolutely"
}

# ============================================================
# Analysis Functions
# ============================================================

def analyze_pos(text: str) -> POSCounts:
    """Analyze parts of speech using spaCy."""
    if nlp is None:
        return POSCounts()

    doc = nlp(text)
    counts = POSCounts()

    for token in doc:
        pos = token.pos_
        if pos == "NOUN" or pos == "PROPN":
            counts.nouns += 1
        elif pos == "VERB" or pos == "AUX":
            counts.verbs += 1
        elif pos == "ADJ":
            counts.adjectives += 1
        elif pos == "ADV":
            counts.adverbs += 1
        elif pos == "PRON":
            counts.pronouns += 1
        elif pos == "ADP":
            counts.prepositions += 1
        elif pos == "CCONJ" or pos == "SCONJ":
            counts.conjunctions += 1
        elif pos == "INTJ":
            counts.interjections += 1

    return counts

def analyze_readability(text: str) -> tuple[float, ReadabilityMetrics]:
    """Calculate readability metrics using textstat."""
    if not text.strip():
        return 0.0, ReadabilityMetrics()

    try:
        metrics = ReadabilityMetrics(
            flesch_reading_ease=textstat.flesch_reading_ease(text),
            flesch_kincaid_grade=textstat.flesch_kincaid_grade(text),
            gunning_fog=textstat.gunning_fog(text),
            smog_index=textstat.smog_index(text),
            automated_readability_index=textstat.automated_readability_index(text),
            coleman_liau_index=textstat.coleman_liau_index(text)
        )
        # Use Flesch Reading Ease as primary readability score (0-100, higher = easier)
        primary_score = max(0.0, min(100.0, metrics.flesch_reading_ease))
        return primary_score, metrics
    except Exception as e:
        logger.warning(f"Readability analysis failed: {e}")
        return 0.0, ReadabilityMetrics()

def analyze_orality(text: str) -> float:
    """
    Calculate orality score - how "spoken-like" vs "written-like" the text is.
    Uses COAST if available, otherwise falls back to heuristic calculation.
    """
    if COAST_AVAILABLE:
        try:
            # COAST returns a score where higher = more oral
            score = coast.orality_score(text)
            # Normalize to 0-100
            return min(100.0, max(0.0, score * 100))
        except Exception as e:
            logger.warning(f"COAST analysis failed: {e}")

    # Fallback: Heuristic orality score based on linguistic features
    # Spoken language tends to have: shorter sentences, more pronouns,
    # more discourse markers, simpler vocabulary

    if not text.strip():
        return 50.0  # Neutral

    orality_indicators = 0.0
    total_weight = 0.0

    words = text.lower().split()
    word_count = len(words)

    if word_count == 0:
        return 50.0

    # Check for discourse markers (oral indicator)
    discourse_count = sum(1 for marker in DISCOURSE_MARKERS if marker in text.lower())
    discourse_density = (discourse_count / word_count) * 100
    orality_indicators += min(discourse_density * 5, 25)  # Max 25 points
    total_weight += 25

    # Check for personal pronouns (I, you, we - oral indicator)
    personal_pronouns = ['i', 'you', 'we', 'me', 'my', 'your', 'our']
    pronoun_count = sum(1 for w in words if w in personal_pronouns)
    pronoun_density = (pronoun_count / word_count) * 100
    orality_indicators += min(pronoun_density * 3, 25)  # Max 25 points
    total_weight += 25

    # Short average word length (oral indicator)
    avg_word_len = sum(len(w) for w in words) / word_count if word_count > 0 else 5
    if avg_word_len < 4:
        orality_indicators += 25
    elif avg_word_len < 5:
        orality_indicators += 15
    elif avg_word_len < 6:
        orality_indicators += 5
    total_weight += 25

    # Contractions (oral indicator)
    contractions = ["'m", "'re", "'ve", "'ll", "'d", "n't", "'s"]
    contraction_count = sum(1 for c in contractions if c in text.lower())
    orality_indicators += min(contraction_count * 5, 25)  # Max 25 points
    total_weight += 25

    return (orality_indicators / total_weight) * 100 if total_weight > 0 else 50.0

def extract_discourse_markers(text: str) -> List[str]:
    """Extract discourse markers found in the text."""
    found = []
    text_lower = text.lower()

    for marker in DISCOURSE_MARKERS:
        if marker in text_lower:
            # Check word boundaries
            import re
            if re.search(r'\b' + re.escape(marker) + r'\b', text_lower):
                found.append(marker)

    return found

def analyze_lingfeat(text: str) -> Optional[LingFeatSummary]:
    """Extract advanced linguistic features using LingFeat."""
    if not LINGFEAT_AVAILABLE or not text.strip():
        return None

    try:
        # LingFeat extracts 255 features - we'll summarize key ones
        extractor = lingfeat.extractor.pass_text(text)
        features = extractor.preprocess().extract()

        return LingFeatSummary(
            lexical_diversity=features.get('LexicalDiversity', 0.0),
            avg_word_length=features.get('AvgWordLength', 0.0),
            sentence_complexity=features.get('SentenceComplexity', 0.0)
        )
    except Exception as e:
        logger.warning(f"LingFeat analysis failed: {e}")
        return None

def analyze_segment(segment: Segment) -> SegmentResult:
    """Perform full linguistic analysis on a text segment."""
    text = segment.text.strip()

    # POS analysis
    pos_counts = analyze_pos(text)

    # Readability analysis
    readability_score, readability_metrics = analyze_readability(text)

    # Orality analysis
    orality_score = analyze_orality(text)

    # Discourse markers
    discourse_markers = extract_discourse_markers(text)

    # LingFeat (optional)
    lingfeat_summary = analyze_lingfeat(text)

    return SegmentResult(
        segment_index=segment.segment_index,
        text=text,
        orality_score=round(orality_score, 2),
        parts_of_speech=pos_counts,
        discourse_markers=discourse_markers,
        readability_score=round(readability_score, 2),
        readability_metrics=readability_metrics,
        lingfeat_summary=lingfeat_summary
    )

# ============================================================
# API Endpoints
# ============================================================

@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": "Linguistic Analysis Service",
        "features": {
            "spacy": nlp is not None,
            "coast": COAST_AVAILABLE,
            "lingfeat": LINGFEAT_AVAILABLE,
            "textstat": True
        }
    }

@app.get("/health")
async def health():
    """Health check for deployment platforms."""
    return {"status": "healthy"}

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze(request: AnalysisRequest):
    """
    Analyze multiple text segments for linguistic features.

    Returns:
    - orality_score: How "spoken-like" the text is (0-100)
    - parts_of_speech: Counts of different POS categories
    - discourse_markers: List of discourse markers found
    - readability_score: Primary readability metric (Flesch Reading Ease)
    - readability_metrics: Detailed readability scores
    - lingfeat_summary: Advanced linguistic features (if available)
    """
    try:
        results = []

        for segment in request.segments:
            result = analyze_segment(segment)
            results.append(result)

        return AnalysisResponse(
            success=True,
            results=results
        )

    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================
# Run server
# ============================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
