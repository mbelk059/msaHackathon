import { Globe, AlertCircle, Users, Heart } from 'lucide-react'
import { formatNumber } from '../services/crisisService'

export default function Header({ stats }) {
  return (
    <div className="h-20 bg-slate-900 border-b border-white/10 flex items-center justify-between px-8">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Globe className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">CrisisAI</h1>
            <p className="text-xs text-gray-400">Real-time Global Emergency Monitoring</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <div>
            <div className="text-xs text-gray-400">Active Crises</div>
            <div className="text-lg font-bold text-white">{stats.totalCrises}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
          <Users className="w-5 h-5 text-blue-400" />
          <div>
            <div className="text-xs text-gray-400">People Affected</div>
            <div className="text-lg font-bold text-white">{formatNumber(stats.totalAffected)}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
          <Heart className="w-5 h-5 text-red-400" />
          <div>
            <div className="text-xs text-gray-400">Total Deaths</div>
            <div className="text-lg font-bold text-white">{formatNumber(stats.totalDeaths)}</div>
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
