import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { DoubleSide } from 'three'
import { getSeverityColor } from '../services/crisisService'

const colorMap = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#EAB308',
  low: '#22C55E'
}

export default function CrisisMarker({ position, crisis, isSelected, onClick }) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)
  
  const severityColor = colorMap[getSeverityColor(crisis.severity_score)] || colorMap.medium
  
  useFrame((state) => {
    if (meshRef.current) {
      // Pulsing animation
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.2
      meshRef.current.scale.setScalar(scale)
      
      // Glow effect
      const intensity = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.3
      if (meshRef.current.material) {
        meshRef.current.material.emissiveIntensity = intensity
      }
    }
  })

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshStandardMaterial
          color={severityColor}
          emissive={severityColor}
          emissiveIntensity={0.5}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Glow ring */}
      {isSelected && (
        <mesh>
          <ringGeometry args={[0.03, 0.05, 32]} />
          <meshStandardMaterial
            color={severityColor}
            emissive={severityColor}
            emissiveIntensity={1}
            transparent
            opacity={0.6}
            side={DoubleSide}
          />
        </mesh>
      )}
      
      {/* Hover tooltip would go here in a more advanced implementation */}
    </group>
  )
}
