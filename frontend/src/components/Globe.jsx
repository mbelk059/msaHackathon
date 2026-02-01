import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, Stars, Sparkles } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import CrisisMarker from './CrisisMarker'
import SeverityLegend from './SeverityLegend'

// vertex shader for earth
const vertexShader = `
  uniform sampler2D elevTexture;
  uniform float elevScale;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vElevation;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    
    // Sample elevation from texture
    vec4 elevation = texture2D(elevTexture, uv);
    float elev = elevation.r;
    vElevation = elev;
    
    // Displace vertices based on elevation
    vec3 newPosition = position + normal * elev * elevScale;
    vPosition = newPosition;
    
    vec4 worldPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * worldPosition;
    
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = 2.0;
  }
`

// fragment shader for earth
const fragmentShader = `
  uniform sampler2D colorTexture;
  uniform sampler2D alphaTexture;
  uniform vec3 glowColor;
  uniform float atmosphereStrength;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vElevation;
  
  void main() {
    // Sample textures
    vec4 color = texture2D(colorTexture, vUv);
    vec4 alpha = texture2D(alphaTexture, vUv);
    
    // Fresnel effect for atmosphere
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    float fresnel = 1.0 - abs(dot(viewDirection, vNormal));
    fresnel = pow(fresnel, 3.0);
    
    // Combine color with atmospheric glow
    vec3 finalColor = color.rgb;
    finalColor += glowColor * fresnel * atmosphereStrength;
    
    // Use alpha map for land/water distinction
    float finalAlpha = alpha.r;
    
    gl_FragColor = vec4(finalColor, finalAlpha);
  }
`

function EarthGlobe() {
  const meshRef = useRef()
  const pointsRef = useRef()
  
  // globe textures
  const colorMap = useLoader(THREE.TextureLoader, 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg')
  const elevMap = useLoader(THREE.TextureLoader, 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg')
  
  // simple alpha map for land/water dist
  const alphaMap = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 2048
    canvas.height = 1024
    const ctx = canvas.getContext('2d')
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
    gradient.addColorStop(0, '#fff')
    gradient.addColorStop(1, '#aaa')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    return new THREE.CanvasTexture(canvas)
  }, [])
  
  const uniforms = useMemo(() => ({
    colorTexture: { value: colorMap },
    elevTexture: { value: elevMap },
    alphaTexture: { value: alphaMap },
    elevScale: { value: 0.02 },
    glowColor: { value: new THREE.Color('#4dd0e1') },
    atmosphereStrength: { value: 0.3 }
  }), [colorMap, elevMap, alphaMap])
  

  return (
    <group>
      {/* main globe mesh with shader */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 64]} />
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent={true}
        />
      </mesh>
      
      {/* point cloud overlay */}
      <points ref={pointsRef}>
        <icosahedronGeometry args={[1.005, 64]} />
        <pointsMaterial
          size={0.005}
          color="#7dd3fc"
          transparent
          opacity={0.6}
          sizeAttenuation={true}
        />
      </points>
      
      {/* atmospheric glow layers */}
      <mesh scale={1.05}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      <mesh scale={1.08}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#0ea5e9"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}

function GridLines() {
  const linesRef = useRef()
  
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const points = []
    
    // longitude lines
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j <= 64; j++) {
        const phi = (j / 64) * Math.PI
        const theta = (i / 24) * Math.PI * 2
        const x = 1.01 * Math.sin(phi) * Math.cos(theta)
        const y = 1.01 * Math.cos(phi)
        const z = 1.01 * Math.sin(phi) * Math.sin(theta)
        points.push(x, y, z)
      }
    }
    
    // latitude lines
    for (let i = 1; i < 12; i++) {
      const phi = (i / 12) * Math.PI
      for (let j = 0; j <= 64; j++) {
        const theta = (j / 64) * Math.PI * 2
        const x = 1.01 * Math.sin(phi) * Math.cos(theta)
        const y = 1.01 * Math.cos(phi)
        const z = 1.01 * Math.sin(phi) * Math.sin(theta)
        points.push(x, y, z)
      }
    }
    
    geo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
    return geo
  }, [])

  return (
    <lineSegments ref={linesRef} geometry={geometry}>
      <lineBasicMaterial color="#1e40af" opacity={0.08} transparent />
    </lineSegments>
  )
}

function AnimatedStars() {
  const starsRef = useRef()
  
  useFrame((state) => {
    if (starsRef.current) {
      starsRef.current.rotation.y = state.clock.elapsedTime * 0.01
    }
  })
  
  return (
    <group ref={starsRef}>
      <Stars 
        radius={150} 
        depth={80} 
        count={10000} 
        factor={5} 
        saturation={0} 
        fade 
        speed={0.3}
      />
    </group>
  )
}

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
    <div className="relative w-full h-full bg-gradient-to-b from-slate-950 via-blue-950 to-slate-900">
      <Canvas 
        camera={{ position: [0, 0, 2.8], fov: 45 }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        {/* lighting setup */}
        <ambientLight intensity={0.3} />
        <directionalLight 
          position={[5, 3, 5]} 
          intensity={1.2} 
          color="#ffffff" 
        />
        <directionalLight 
          position={[-5, -3, -5]} 
          intensity={0.4} 
          color="#0ea5e9" 
        />
        <pointLight 
          position={[10, 10, 10]} 
          intensity={0.8} 
          color="#bae6fd"
          distance={20}
        />
        
        {/* animated starfield */}
        <AnimatedStars />
        
        {/* atmospheric particles */}
        <Sparkles
          count={80}
          scale={4}
          size={1.5}
          speed={0.2}
          opacity={0.4}
          color="#60a5fa"
        />
        
        {/* earth w textures */}
        <EarthGlobe />
        
        {/* grid overlay */}
        <GridLines />
        
        {/* Crisis markers */}
        {markers.map((marker) => {
          const [x, y, z] = convertLatLngToVector3(
            marker.crisis.location.lat,
            marker.crisis.location.lng,
            1.12
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
          autoRotate={false}
          minDistance={1.8}
          maxDistance={5}
          dampingFactor={0.05}
          rotateSpeed={0.4}
        />
      </Canvas>
      
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full bg-gradient-radial from-transparent via-transparent to-slate-950/60" />
      </div>
      

      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="w-full h-full bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent animate-scan" />
      </div>
      
      <SeverityLegend />
      
      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .animate-scan {
          animation: scan 8s linear infinite;
        }
      `}</style>
    </div>
  )
}