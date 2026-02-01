import { useState, useEffect } from 'react'
import Globe from './components/Globe'
import Dashboard from './components/Dashboard'
import Header from './components/Header'
import { getActionableCrises } from './services/crisisService'

function App() {
  const [crises, setCrises] = useState([])
  const [selectedCrisis, setSelectedCrisis] = useState(null)
  const [globalStats, setGlobalStats] = useState({
    totalCrises: 0,
    totalAffected: 0,
    aidWorkers: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCrises()
    
    // Simulate real-time updates every 30 seconds
    const updateInterval = setInterval(() => {
      loadCrises()
    }, 30000)

    return () => clearInterval(updateInterval)
  }, [])

  useEffect(() => {
    // Calculate global stats
    const stats = {
      totalCrises: crises.length,
      totalAffected: crises.reduce((sum, c) => sum + (c.impact?.affected_total || 0), 0),
      aidWorkers: crises.reduce((sum, c) => {
        const affected = c.impact?.affected_total || 0
        return sum + Math.round(affected * 0.01) 
      }, 0)
    }
    setGlobalStats(stats)

    // Auto-select highest severity crisis if none selected
    if (!selectedCrisis && crises.length > 0) {
      const highestSeverity = crises.reduce((max, c) => 
        (c.severity_score || 0) > (max?.severity_score || 0) ? c : max
      )
      setSelectedCrisis(highestSeverity)
    }
  }, [crises])

  const loadCrises = async () => {
    try {
      const data = await getActionableCrises()
      if (data.status === 'success') {
        setCrises(data.crises || [])
      }
    } catch (error) {
      console.error('Failed to load crises:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCrisisSelect = (crisis) => {
    setSelectedCrisis(crisis)
  }

  const handleCrisisDeselect = () => {
    setSelectedCrisis(null)
  }

  return (
    <div className="w-screen h-screen bg-gray-950 overflow-hidden">
      <Header stats={globalStats} />
  
      {/* Main content */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
        
        {/* Globe */}
        <div className="flex-1 relative min-h-[300px]">
          <Globe 
            crises={crises} 
            selectedCrisis={selectedCrisis}
            onCrisisSelect={handleCrisisSelect}
            loading={loading}
          />
        </div>
  
        {/* Dashboard */}
        <div className="
          w-full 
          lg:w-[420px] 
          xl:w-[480px]
          flex-shrink-0
          border-t lg:border-t-0 lg:border-l
          border-slate-800
          overflow-y-auto
        ">
          <Dashboard 
            crises={crises}
            selectedCrisis={selectedCrisis}
            onCrisisSelect={handleCrisisSelect}
            onCrisisDeselect={handleCrisisDeselect}
            loading={loading}
          />
        </div>
  
      </div>
    </div>
  )
  
}

export default App