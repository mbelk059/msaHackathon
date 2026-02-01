import { Canvas, useLoader } from '@react-three/fiber'
import { OrbitControls, Stars, Sphere } from '@react-three/drei'
import { useMemo, useEffect, useState } from 'react'
import * as THREE from 'three'
import CrisisMarker from './CrisisMarker'
import SeverityLegend from './SeverityLegend'

// convert lat/lng (degrees) to a point on a unit sphere of given radius
function latLngToVector3(lat, lng, radius = 1) {
  const phi   = (90 - lat)  * (Math.PI / 180)
  const theta = lng          * (Math.PI / 180)

  const x =  radius * Math.sin(phi) * Math.sin(theta)
  const y =  radius * Math.cos(phi)
  const z =  radius * Math.sin(phi) * Math.cos(theta)

  return [x, y, z]
}

// render country borders
function CountryBorders({ geoData }) {
  const linesGeometry = useMemo(() => {
    if (!geoData) return null

    const points = []
    const radius = 1.005 // Slightly above sphere surface

    geoData.features.forEach(feature => {
      const coordinates = feature.geometry.coordinates

      const processCoordinates = (coords, isPolygon = false) => {
        if (isPolygon) {
          coords.forEach(ring => {
            ring.forEach(([lng, lat], i) => {
              const [x, y, z] = latLngToVector3(lat, lng, radius)
              points.push(new THREE.Vector3(x, y, z))
              
              // Connect back to first point to close the polygon
              if (i === ring.length - 1 && ring.length > 0) {
                const [x0, y0, z0] = latLngToVector3(ring[0][1], ring[0][0], radius)
                points.push(new THREE.Vector3(x0, y0, z0))
              }
            })
          })
        } else {
          coords.forEach(([lng, lat]) => {
            const [x, y, z] = latLngToVector3(lat, lng, radius)
            points.push(new THREE.Vector3(x, y, z))
          })
        }
      }

      if (feature.geometry.type === 'Polygon') {
        processCoordinates(feature.geometry.coordinates, true)
      } else if (feature.geometry.type === 'MultiPolygon') {
        feature.geometry.coordinates.forEach(polygon => {
          processCoordinates(polygon, true)
        })
      }
    })

    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    return geometry
  }, [geoData])

  if (!linesGeometry) return null

  return (
    <lineSegments geometry={linesGeometry}>
      <lineBasicMaterial 
        color="#60a5fa" 
        transparent 
        opacity={0.4}
        linewidth={1}
      />
    </lineSegments>
  )
}

// adding earth textures
function TexturedEarth() {

  const colorMap = useLoader(THREE.TextureLoader, 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg')
  const bumpMap = useLoader(THREE.TextureLoader, 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg')
  
  // align with countries
  colorMap.wrapS = colorMap.wrapT = THREE.RepeatWrapping
  bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping
  
  // align textures
  colorMap.offset.x = -0.0005 
  bumpMap.offset.x = -0.0005
  
  return (
    <Sphere args={[1, 64, 64]} rotation={[0, -Math.PI / 2, 0]}>
      <meshStandardMaterial
        map={colorMap}
        bumpMap={bumpMap}
        bumpScale={0.02}
        roughness={0.9}
        metalness={0.1}
      />
    </Sphere>
  )
}

export default function Globe({ crises, selectedCrisis, onCrisisSelect, loading }) {
  const [geoData, setGeoData] = useState(null)

  useEffect(() => {
    // world countries GeoJSON
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(res => res.json())
      .then(data => {
        // convert TopoJSON to GeoJSON
        const countries = data.objects.countries
        const geoJson = {
          type: 'FeatureCollection',
          features: countries.geometries.map(geom => ({
            type: 'Feature',
            geometry: geom,
            properties: {}
          }))
        }
        
        // TopoJSON arc decoding
        const arcs = data.arcs
        const transform = data.transform
        
        const decodedFeatures = geoJson.features.map(feature => {
          const decodeArc = (arc) => {
            const coordinates = []
            let x = 0, y = 0
            
            arcs[Math.abs(arc)].forEach(([dx, dy]) => {
              x += dx
              y += dy
              coordinates.push([
                x * transform.scale[0] + transform.translate[0],
                y * transform.scale[1] + transform.translate[1]
              ])
            })
            
            return arc < 0 ? coordinates.reverse() : coordinates
          }

          if (feature.geometry.type === 'Polygon') {
            feature.geometry.coordinates = feature.geometry.arcs.map(ring =>
              ring.map(arc => decodeArc(arc)).flat()
            )
          } else if (feature.geometry.type === 'MultiPolygon') {
            feature.geometry.coordinates = feature.geometry.arcs.map(polygon =>
              polygon.map(ring =>
                ring.map(arc => decodeArc(arc)).flat()
              )
            )
          }
          
          return feature
        })

        setGeoData({ type: 'FeatureCollection', features: decodedFeatures })
      })
      .catch(err => {
        console.error('Failed to load country borders:', err)
        // if fail go back to simpler GeoJSON
        fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
          .then(res => res.json())
          .then(data => setGeoData(data))
          .catch(e => console.error('Fallback also failed:', e))
      })
  }, [])

  const markers = useMemo(() => {
    return crises.map(crisis => {
      const [x, y, z] = latLngToVector3(
        crisis.location.lat,
        crisis.location.lng,
        1.02
      )
      return { crisis, position: [x, y, z] }
    })
  }, [crises])

  return (
    <div className="relative w-full h-full">
      <Canvas camera={{ position: [0, 0.3, 2.8], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.2} />
        <directionalLight position={[-10, -10, -5]} intensity={0.4} />

        <Stars radius={300} depth={50} count={5000} factor={4} fade speed={1} />

        {/* use textured earth instead of plain Sphere */}
        <TexturedEarth />

        {/* country borders */}
        {geoData && <CountryBorders geoData={geoData} />}

        {/* crisis markers */}
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