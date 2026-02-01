import { Globe, AlertCircle, Users, Shield } from 'lucide-react'
import { formatNumber } from '../services/crisisService'

export default function Header({ stats }) {
  return (
    <div className="bg-black/90 backdrop-blur-md border-b border-white/10 flex flex-col lg:flex-row justify-center lg:justify-between px-4 lg:px-8 py-3 lg:py-4 gap-3">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Globe className="w-8 h-8 text-emerald-400" />
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-white">CrisisAI</h1>
            <p className="text-xs lg:text-sm text-gray-400">Real-time Global Emergency Monitoring</p>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center justify-start lg:justify-end gap-3 lg:gap-6">
        <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg border border-white/10">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <div>
            <div className="text-xs text-gray-400">Active Crises</div>
            <div className="text-lg font-bold text-white">{stats.totalCrises}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
          <Users className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="text-xs text-gray-400">People Affected</div>
            <div className="text-lg font-bold text-white">{formatNumber(stats.totalAffected)}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
          <Shield className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="text-xs text-gray-400">Aid Workers Deployed</div>
            <div className="text-lg font-bold text-white">{formatNumber(stats.aidWorkers)}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-300">Live</span>
        </div>
      </div>
    </div>
  )
}