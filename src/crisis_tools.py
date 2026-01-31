"""
CrisisAI Tools - Mock data tools for crisis detection, verification, NGO matching, and updates.
For hackathon demo - simulates real-time crisis monitoring pipeline.
"""
import json
import os
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
import random

log = logging.getLogger(__name__)

# Base path for mock data files
MOCK_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "crises")


def ensure_data_dir():
    """Ensure the data directory exists"""
    os.makedirs(MOCK_DATA_DIR, exist_ok=True)


def load_mock_raw_crises() -> List[Dict[str, Any]]:
    """Load raw crisis detections from mock file"""
    log_id = "[CrisisTools:load_mock_raw_crises]"
    log.debug(f"{log_id} Loading raw crises")
    
    try:
        ensure_data_dir()
        file_path = os.path.join(MOCK_DATA_DIR, "mock_raw_crises.json")
        
        if not os.path.exists(file_path):
            log.warning(f"{log_id} File not found: {file_path}")
            return []
        
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            crises = data.get("crises", [])
            log.info(f"{log_id} Loaded {len(crises)} raw crises")
            return crises
            
    except Exception as e:
        log.error(f"{log_id} Failed to load raw crises: {e}", exc_info=True)
        return []


def detect_crises(
    source: Optional[str] = None,
    tool_context: Optional[Any] = None,
    tool_config: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Crisis Detection Agent tool - loads and publishes raw crisis detections.
    Simulates monitoring GDACS, news feeds, Twitter, USGS, NOAA.
    """
    log_id = "[CrisisTools:detect_crises]"
    log.debug(f"{log_id} Starting detection")
    
    try:
        raw_crises = load_mock_raw_crises()
        
        # Filter by source if provided
        if source:
            raw_crises = [c for c in raw_crises if c.get("source") == source]
        
        # Simulate publishing to Solace topic: crisis/raw/[source]/[crisis_id]
        published = []
        for crisis in raw_crises:
            topic = f"crisis/raw/{crisis.get('source', 'unknown')}/{crisis.get('crisis_id')}"
            published.append({
                "topic": topic,
                "crisis_id": crisis.get("crisis_id"),
                "source": crisis.get("source"),
                "type": crisis.get("type"),
                "location": crisis.get("location", {}),
                "timestamp": crisis.get("timestamp"),
            })
        
        log.info(f"{log_id} Detected {len(published)} crises")
        return {
            "status": "success",
            "count": len(published),
            "crises": published,
            "message": f"Published {len(published)} raw crisis detections to Solace topics"
        }
        
    except Exception as e:
        log.error(f"{log_id} Failed: {e}", exc_info=True)
        return {"status": "error", "message": str(e)}


def verify_and_score_crisis(
    crisis_id: Optional[str] = None,
    tool_context: Optional[Any] = None,
    tool_config: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Verification & Scoring Agent tool - verifies raw crises and calculates severity scores.
    Subscribes to crisis/raw/*/* and publishes to crisis/verified/[crisis_id]
    """
    log_id = "[CrisisTools:verify_and_score_crisis]"
    log.debug(f"{log_id} Starting verification")
    
    try:
        ensure_data_dir()
        file_path = os.path.join(MOCK_DATA_DIR, "mock_verified_crises.json")
        
        if not os.path.exists(file_path):
            log.warning(f"{log_id} File not found: {file_path}")
            return {"status": "error", "message": "Verified crises file not found"}
        
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            verified_crises = data.get("crises", [])
        
        # Filter by crisis_id if provided
        if crisis_id:
            verified_crises = [c for c in verified_crises if c.get("crisis_id") == crisis_id]
        
        # Simulate publishing to Solace topic: crisis/verified/[crisis_id]
        published = []
        for crisis in verified_crises:
            topic = f"crisis/verified/{crisis.get('crisis_id')}"
            published.append({
                "topic": topic,
                "crisis_id": crisis.get("crisis_id"),
                "severity_score": crisis.get("severity_score"),
                "confidence": crisis.get("confidence"),
                "verified_sources": crisis.get("verified_sources", []),
                "status": crisis.get("status"),
            })
        
        log.info(f"{log_id} Verified {len(published)} crises")
        return {
            "status": "success",
            "count": len(published),
            "crises": published,
            "message": f"Verified and scored {len(published)} crises"
        }
        
    except Exception as e:
        log.error(f"{log_id} Failed: {e}", exc_info=True)
        return {"status": "error", "message": str(e)}


def match_ngo_campaigns(
    crisis_id: Optional[str] = None,
    tool_context: Optional[Any] = None,
    tool_config: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    NGO Matching Agent tool - matches verified crises to NGO donation campaigns.
    Subscribes to crisis/verified/* and publishes to crisis/actionable/[crisis_id]
    """
    log_id = "[CrisisTools:match_ngo_campaigns]"
    log.debug(f"{log_id} Starting NGO matching")
    
    try:
        ensure_data_dir()
        file_path = os.path.join(MOCK_DATA_DIR, "mock_actionable_crises.json")
        
        if not os.path.exists(file_path):
            log.warning(f"{log_id} File not found: {file_path}")
            return {"status": "error", "message": "Actionable crises file not found"}
        
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            actionable_crises = data.get("crises", [])
        
        # Filter by crisis_id if provided
        if crisis_id:
            actionable_crises = [c for c in actionable_crises if c.get("crisis_id") == crisis_id]
        
        # Simulate publishing to Solace topic: crisis/actionable/[crisis_id]
        published = []
        for crisis in actionable_crises:
            topic = f"crisis/actionable/{crisis.get('crisis_id')}"
            ngo_count = len(crisis.get("ngo_campaigns", []))
            published.append({
                "topic": topic,
                "crisis_id": crisis.get("crisis_id"),
                "severity_score": crisis.get("severity_score"),
                "ngo_campaigns_count": ngo_count,
                "status": crisis.get("status"),
            })
        
        log.info(f"{log_id} Matched {len(published)} crises with NGOs")
        return {
            "status": "success",
            "count": len(published),
            "crises": published,
            "message": f"Matched {len(published)} crises with NGO campaigns"
        }
        
    except Exception as e:
        log.error(f"{log_id} Failed: {e}", exc_info=True)
        return {"status": "error", "message": str(e)}


def monitor_crisis_updates(
    crisis_id: Optional[str] = None,
    tool_context: Optional[Any] = None,
    tool_config: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Update Monitor Agent tool - monitors ongoing crises for updates.
    Monitors crisis/actionable/* and publishes to crisis/updates/[crisis_id]
    """
    log_id = "[CrisisTools:monitor_crisis_updates]"
    log.debug(f"{log_id} Starting update monitoring")
    
    try:
        ensure_data_dir()
        file_path = os.path.join(MOCK_DATA_DIR, "mock_crisis_updates.json")
        
        if not os.path.exists(file_path):
            log.warning(f"{log_id} File not found: {file_path}")
            return {"status": "error", "message": "Crisis updates file not found"}
        
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            updates = data.get("updates", [])
        
        # Filter by crisis_id if provided
        if crisis_id:
            updates = [u for u in updates if u.get("crisis_id") == crisis_id]
        
        # Simulate publishing to Solace topic: crisis/updates/[crisis_id]
        published = []
        for update in updates:
            topic = f"crisis/updates/{update.get('crisis_id')}"
            published.append({
                "topic": topic,
                "crisis_id": update.get("crisis_id"),
                "update_sequence": update.get("update_sequence"),
                "timestamp": update.get("timestamp"),
                "has_changes": bool(update.get("changes")),
                "status_change": update.get("status_change"),
            })
        
        log.info(f"{log_id} Monitored {len(published)} crisis updates")
        return {
            "status": "success",
            "count": len(published),
            "updates": published,
            "message": f"Monitored {len(published)} crisis updates"
        }
        
    except Exception as e:
        log.error(f"{log_id} Failed: {e}", exc_info=True)
        return {"status": "error", "message": str(e)}


def get_actionable_crises(
    limit: Optional[int] = None,
    tool_context: Optional[Any] = None,
    tool_config: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Get all actionable crises (for frontend consumption).
    Returns full crisis data with NGO campaigns.
    """
    log_id = "[CrisisTools:get_actionable_crises]"
    log.debug(f"{log_id} Loading actionable crises")
    
    try:
        ensure_data_dir()
        file_path = os.path.join(MOCK_DATA_DIR, "mock_actionable_crises.json")
        
        if not os.path.exists(file_path):
            log.warning(f"{log_id} File not found: {file_path}")
            return {"status": "error", "message": "Actionable crises file not found"}
        
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            crises = data.get("crises", [])
        
        # Sort by severity score (descending)
        crises.sort(key=lambda x: x.get("severity_score", 0), reverse=True)
        
        # Apply limit
        if limit:
            crises = crises[:limit]
        
        log.info(f"{log_id} Returning {len(crises)} actionable crises")
        return {
            "status": "success",
            "count": len(crises),
            "crises": crises
        }
        
    except Exception as e:
        log.error(f"{log_id} Failed: {e}", exc_info=True)
        return {"status": "error", "message": str(e)}
