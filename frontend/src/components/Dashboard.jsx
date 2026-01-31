import { useState } from 'react'
import { X, MapPin, AlertCircle, Clock, CheckCircle2, ExternalLink, Heart } from 'lucide-react'
import { getSeverityColor, getSeverityLabel, formatNumber, formatTimeAgo } from '../services/crisisService'

const severityColorClasses = {
  critical: 'bg-critical',
  high: 'bg-high',
  medium: 'bg-medium',
  low: 'bg-low'
}

const severityTextClasses = {
  critical: 'text-critical',
  high: 'text-high',
  medium: 'text-medium',
  low: 'text-low'
}

const severityTrendColors = {
  increasing: 'text-red-400',
  stable: 'text-yellow-400',
  decreasing: 'text-green-400',
}

const severityTrendLabels = {
  increasing: 'Worsening',
  stable: 'Stable',
  decreasing: 'Improving',
}

export default function Dashboard({ crises, selectedCrisis, onCrisisSelect, onCrisisDeselect, loading }) {
  const [sortBy, setSortBy] = useState('severity')

  const sortedCrises = [...crises].sort((a, b) => {
    if (sortBy === 'severity') {
      return (b.severity_score || 0) - (a.severity_score || 0)
    }
    if (sortBy === 'time') {
      return new Date(b.timestamp_verified || 0) - new Date(a.timestamp_verified || 0)
    }
    return 0
  })

  if (loading) {
    return (
      <div className="w-96 bg-black/40 backdrop-blur-md border-l border-white/10 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/10 rounded"></div>
          <div className="h-32 bg-white/10 rounded"></div>
          <div className="h-32 bg-white/10 rounded"></div>
        </div>
      </div>
    )
  }

  if (selectedCrisis) {
    return <CrisisDetail crisis={selectedCrisis} onClose={onCrisisDeselect} />
  }

  return (
    <div className="w-96 bg-black/40 backdrop-blur-md border-l border-white/10 flex flex-col">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-xl font-bold text-white mb-4">Active Crises</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('severity')}
            className={`px-3 py-1 text-xs rounded ${
              sortBy === 'severity'
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Severity
          </button>
          <button
            onClick={() => setSortBy('time')}
            className={`px-3 py-1 text-xs rounded ${
              sortBy === 'time'
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Recent
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {sortedCrises.length === 0 ? (
          <div className="text-gray-400 text-sm p-4 text-center">
            No crises loaded. Check console. Ensure <code className="text-gray-300">public/data/crises/mock_actionable_crises.json</code> exists or run the crisis API on port 8001.
          </div>
        ) : (
          sortedCrises.map((crisis) => (
            <CrisisCard
              key={crisis.crisis_id}
              crisis={crisis}
              onClick={() => onCrisisSelect(crisis)}
            />
          ))
        )}
      </div>
    </div>
  )
}

function CrisisCard({ crisis, onClick }) {
  const severityColor = getSeverityColor(crisis.severity_score)
  const severityLabel = getSeverityLabel(crisis.severity_score)
  const bgClass = severityColorClasses[severityColor] || 'bg-medium'
  const textClass = severityTextClasses[severityColor] || 'text-medium'

  return (
    <div
      onClick={onClick}
      className="bg-white/5 rounded-lg p-4 border border-white/10 cursor-pointer hover:bg-white/10 transition-all hover:scale-[1.02]"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${bgClass}`}></div>
          <span className="text-sm font-semibold text-white capitalize">
            {crisis.type.replace('_', ' ')}
          </span>
        </div>
        <span className={`text-xs px-2 py-1 rounded ${bgClass}/20 ${textClass} font-medium`}>
          {severityLabel}
        </span>
      </div>
      
      <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
        <MapPin className="w-3 h-3" />
        <span>{crisis.location.city}, {crisis.location.country}</span>
      </div>
      
      <div className="flex items-center gap-4 text-xs text-gray-300">
        <div>
          <span className="text-gray-500">Deaths: </span>
          <span className="font-semibold text-red-400">{formatNumber(crisis.impact?.deaths || 0)}</span>
        </div>
        <div>
          <span className="text-gray-500">Affected: </span>
          <span className="font-semibold">{formatNumber(crisis.impact?.affected_total || 0)}</span>
        </div>
      </div>
    </div>
  )
}

function CrisisDetail({ crisis, onClose }) {
  const severityColor = getSeverityColor(crisis.severity_score)
  const severityLabel = getSeverityLabel(crisis.severity_score)
  const bgClass = severityColorClasses[severityColor] || 'bg-medium'
  const textClass = severityTextClasses[severityColor] || 'text-medium'

  return (
    <div className="w-96 bg-black/40 backdrop-blur-md border-l border-white/10 flex flex-col h-full">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2 capitalize">
              {crisis.type.replace('_', ' ')}
            </h2>
            <div className="flex items-center gap-2 text-gray-400 mb-3">
              <MapPin className="w-4 h-4" />
              <span>{crisis.location.city}, {crisis.location.country}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${bgClass}/20 ${textClass}`}>
                {severityLabel} Severity ({crisis.severity_score.toFixed(1)})
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                crisis.status === 'ongoing' ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'
              }`}>
                {crisis.status}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        {crisis.headline && (
          <p className="text-sm font-medium text-blue-200 mb-2">{crisis.headline}</p>
        )}
        <p className="text-sm text-gray-300 leading-relaxed">
          {crisis.description}
        </p>
        {crisis.severity_trend && (
          <p className="text-xs text-gray-400 mt-2">
            Severity trend: <span className={severityTrendColors[crisis.severity_trend] || 'text-gray-400'}>{severityTrendLabels[crisis.severity_trend] || crisis.severity_trend}</span>
          </p>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Impact Statistics */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Impact Statistics</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Deaths</div>
              <div className="text-2xl font-bold text-red-400">
                {formatNumber(crisis.impact?.deaths || 0)}
              </div>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Injured</div>
              <div className="text-2xl font-bold text-orange-400">
                {formatNumber(crisis.impact?.injured || 0)}
              </div>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Displaced</div>
              <div className="text-2xl font-bold text-yellow-400">
                {formatNumber(crisis.impact?.displaced || 0)}
              </div>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Total Affected</div>
              <div className="text-2xl font-bold text-blue-400">
                {formatNumber(crisis.impact?.affected_total || 0)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Timeline */}
        <div>
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Last updated: {formatTimeAgo(crisis.last_updated)}</span>
          </div>
        </div>
        
        {/* Verification Sources */}
        <div>
          <div className="flex items-center gap-2 text-gray-400 mb-3">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-semibold">Verified by:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {crisis.verified_sources?.map((source, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs"
              >
                {source}
              </span>
            ))}
          </div>
        </div>
        
        {/* How You Can Help */}
        <div>
          <div className="flex items-center gap-2 text-white mb-4">
            <AlertCircle className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold">How You Can Help</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Donate to verified humanitarian organizations actively responding to this crisis:
          </p>
          
          <div className="space-y-3">
            {crisis.ngo_campaigns?.map((ngo, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-4 hover:from-blue-600/30 hover:to-purple-600/30 transition-all hover:scale-[1.02]"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-white">{ngo.org_name}</h4>
                      {ngo.verified && (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{ngo.focus_area}</p>
                  </div>
                </div>
                <a
                  href={ngo.campaign_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full mt-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:from-blue-500 hover:to-purple-500 transition-all"
                >
                  <Heart className="w-4 h-4" />
                  Donate Now
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
