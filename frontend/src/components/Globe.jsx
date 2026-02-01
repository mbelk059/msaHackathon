import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Sphere } from '@react-three/drei'
import { useMemo } from 'react'
import CrisisMarker from './CrisisMarker'
import SeverityLegend from './SeverityLegend'

// Converts lat/lng (degrees) to a point on a unit sphere of given radius.
// Standard spherical → Cartesian conversion aligned to Three.js Y-up axes:
//   phi   = polar angle from +Y (north pole)
//   theta = azimuthal angle from +Z toward +X (longitude)
function latLngToVector3(lat, lng, radius = 1) {
  const phi   = (90 - lat)  * (Math.PI / 180)   // 90° at equator, 0° at north pole
  const theta = lng          * (Math.PI / 180)   // 0° at prime meridian

  const x =  radius * Math.sin(phi) * Math.sin(theta)
  const y =  radius * Math.cos(phi)
  const z =  radius * Math.sin(phi) * Math.cos(theta)

  return [x, y, z]
}

export default function Globe({ crises, selectedCrisis, onCrisisSelect, loading }) {
  // Pre-compute marker positions so we don't redo trig every render
  const markers = useMemo(() => {
    return crises.map(crisis => {
      const [x, y, z] = latLngToVector3(
        crisis.location.lat,
        crisis.location.lng,
        1.02  // slightly above the sphere surface
      )
      return { crisis, position: [x, y, z] }
    })
  }, [crises])

  return (
    <div className="relative w-full h-full">
      {/* Camera starts on +Z axis so the prime meridian / Atlantic faces us.
          Most crises (Middle East, Africa, Europe) are visible immediately. */}
      <Canvas camera={{ position: [0, 0.3, 2.8], fov: 50 }}>
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

        {/* Crisis markers */}
        {markers.map(({ crisis, position }) => (
          <CrisisMarker
            key={crisis.crisis_id}
            position={position}
            crisis={crisis}
            isSelected={selectedCrisis?.crisis_id === crisis.crisis_id}
            onClick={() => onCrisisSelect(crisis)}
          />
        ))}

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