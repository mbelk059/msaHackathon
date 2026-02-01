import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Sphere } from '@react-three/drei'
import { useMemo } from 'react'
import CrisisMarker from './CrisisMarker'
import SeverityLegend from './SeverityLegend'

export default function Globe({ crises, selectedCrisis, onCrisisSelect, loading }) {
  const markers = useMemo(() => {
    return crises.map(crisis => ({
      id: crisis.crisis_id,
      position: [
        crisis.location.lng * (Math.PI / 180),
        crisis.location.lat * (Math.PI / 180),
        0
      ],
      crisis: crisis
    }))
  }, [crises])

  const convertLatLngToVector3 = (lat, lng, radius = 1) => {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lng + 180) * (Math.PI / 180)
    
    const x = -radius * Math.sin(phi) * Math.cos(theta)
    const y = radius * Math.cos(phi)
    const z = radius * Math.sin(phi) * Math.sin(theta)
    
    return [x, y, z]
  }

  return (
    <div className="relative w-full h-full">
      <Canvas camera={{ position: [0, 0, 2.5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.3} />
        
        {/* Stars background */}
        <Stars radius={300} depth={50} count={5000} factor={4} fade speed={1} />
        
        {/* Earth sphere */}
        <Sphere args={[1, 64, 64]}>
          <meshStandardMaterial
            color="#1e3a8a"
            roughness={0.8}
            metalness={0.2}
            transparent
            opacity={0.7}
          />
        </Sphere>
        
        {/* Grid lines */}
        <gridHelper args={[2.2, 20, '#4a5568', '#2d3748']} />
        
        {/* Crisis markers */}
        {markers.map((marker) => {
          const [x, y, z] = convertLatLngToVector3(
            marker.crisis.location.lat,
            marker.crisis.location.lng,
            1.02
          )
          return (
            <CrisisMarker
              key={marker.id}
              position={[x, y, z]}
              crisis={marker.crisis}
              isSelected={selectedCrisis?.crisis_id === marker.crisis.crisis_id}
              onClick={() => onCrisisSelect(marker.crisis)}
            />
          )
        })}
        
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          autoRotate={true}
          autoRotateSpeed={0.5}
          minDistance={2}
          maxDistance={4}
        />
      </Canvas>
      
      <SeverityLegend />
    </div>
  )
}
