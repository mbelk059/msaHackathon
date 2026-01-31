// Mock service to load crisis data
// In production, this would connect to Solace topics or API endpoints

// Try static file first (always works when serving from frontend); then API
const STATIC_CRISES_PATH = '/data/crises/mock_actionable_crises.json'
const API_CRISES_PATH = '/api/crises'

export async function getActionableCrises() {
  // 1) Static file (no backend needed)
  try {
    const r = await fetch(STATIC_CRISES_PATH)
    if (r.ok) {
      const data = await r.json()
      const crises = data.crises || []
      if (crises.length > 0) return { status: 'success', crises }
    }
  } catch (_) {}
  // 2) Backend API (port 8001)
  try {
    const r = await fetch(API_CRISES_PATH)
    if (r.ok) {
      const data = await r.json()
      const crises = data.crises || []
      if (crises.length > 0) return { status: 'success', crises }
    }
  } catch (_) {}
  // 3) Fallback so UI never shows empty
  console.warn('CrisisAI: Using fallback data. Run crisis API (port 8001) or ensure public/data/crises exists.')
  return { status: 'success', crises: getFallbackCrises() }
}

function getFallbackCrises() {
  return [
    {
      crisis_id: 'fallback_1',
      type: 'humanitarian_crisis',
      location: { country: 'Palestine', city: 'Gaza', lat: 31.4, lng: 34.5 },
      severity_score: 9.5,
      impact: { deaths: 35000, injured: 78000, displaced: 1900000, affected_total: 2300000 },
      status: 'ongoing',
      description: 'Humanitarian crisis with critical needs. Load mock data from public/data/crises for full list.',
      ngo_campaigns: [{ org_name: 'UNICEF', campaign_url: 'https://www.unicef.org', verified: true, focus_area: 'Emergency relief' }]
    }
  ]
}

export function getSeverityColor(score) {
  if (score >= 9) return 'critical'
  if (score >= 7) return 'high'
  if (score >= 5) return 'medium'
  return 'low'
}

export function getSeverityLabel(score) {
  if (score >= 9) return 'Critical'
  if (score >= 7) return 'High'
  if (score >= 5) return 'Medium'
  return 'Low'
}

export function formatNumber(num) {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

export function formatTimeAgo(timestamp) {
  const now = new Date()
  const then = new Date(timestamp)
  const diffMs = now - then
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }
  if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  }
  return 'Just now'
}
