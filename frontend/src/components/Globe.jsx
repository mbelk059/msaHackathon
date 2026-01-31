import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { getSeverityColor } from '../services/crisisService'
import SeverityLegend from './SeverityLegend'

const colorMap = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#EAB308',
  low: '#22C55E'
}

export default function Globe({ crises = [], selectedCrisis, onCrisisSelect, loading }) {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const globeRef = useRef(null)
  const markersGroupRef = useRef(null)
  const raycasterRef = useRef(null)
  const mouseRef = useRef(new THREE.Vector2())
  const clockRef = useRef(new THREE.Clock())
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)
  const globeRadiusRef = useRef(100)

  // Convert lat/lng to 3D coordinates
  const latLngToVector3 = (lat, lng, radius) => {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lng + 180) * (Math.PI / 180)

    const x = -(radius * Math.sin(phi) * Math.cos(theta))
    const z = radius * Math.sin(phi) * Math.sin(theta)
    const y = radius * Math.cos(phi)

    return new THREE.Vector3(x, y, z)
  }

  // Create crisis marker
  const createCrisisMarker = (crisis, radius, currentSelectedCrisis) => {
    const position = latLngToVector3(
      crisis.location.lat,
      crisis.location.lng,
      radius
    )

    const severityColor = colorMap[getSeverityColor(crisis.severity_score)] || colorMap.medium
    const isSelected = currentSelectedCrisis?.crisis_id === crisis.crisis_id

    // Create marker group
    const markerGroup = new THREE.Group()
    markerGroup.userData = { crisis, position }

    // Main marker sphere
    const markerGeometry = new THREE.SphereGeometry(2, 16, 16)
    const markerMaterial = new THREE.MeshStandardMaterial({
      color: severityColor,
      emissive: severityColor,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.9
    })
    const marker = new THREE.Mesh(markerGeometry, markerMaterial)
    marker.position.copy(position.clone().multiplyScalar(1.01))
    marker.userData = { crisis, isMarker: true }
    markerGroup.add(marker)

    // Selection ring
    if (isSelected) {
      const ringGeometry = new THREE.RingGeometry(2.5, 3.5, 32)
      const ringMaterial = new THREE.MeshStandardMaterial({
        color: severityColor,
        emissive: severityColor,
        emissiveIntensity: 1,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
      })
      const ring = new THREE.Mesh(ringGeometry, ringMaterial)
      ring.position.copy(position.clone().multiplyScalar(1.01))
      ring.lookAt(0, 0, 0)
      ring.userData = { isRing: true }
      markerGroup.add(ring)
    }

    return markerGroup
  }

  // Add crises to the globe
  const updateCrises = (markersGroup, crisesToAdd, radius, currentSelectedCrisis) => {
    // Clear existing markers
    while (markersGroup.children.length > 0) {
      const child = markersGroup.children[0]
      // Dispose of geometries and materials
      child.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose()
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose())
          } else {
            obj.material.dispose()
          }
        }
      })
      markersGroup.remove(child)
    }

    crisesToAdd.forEach((crisis) => {
      const marker = createCrisisMarker(crisis, radius, currentSelectedCrisis)
      markersGroup.add(marker)
    })
  }

  // Effect to update markers when crises or selectedCrisis changes
  useEffect(() => {
    if (markersGroupRef.current && globeRadiusRef.current) {
      updateCrises(markersGroupRef.current, crises, globeRadiusRef.current, selectedCrisis)
    }
  }, [crises, selectedCrisis])

  // Main scene setup effect
  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    )
    camera.position.z = 400
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Load background texture
    const textureLoader = new THREE.TextureLoader()
    textureLoader.load(
      'https://cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png',
      (texture) => {
        scene.background = texture
      },
      undefined,
      () => {
        // Fallback to dark background
        scene.background = new THREE.Color(0x000011)
      }
    )

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
    directionalLight.position.set(-1, 1, 1)
    scene.add(directionalLight)

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4)
    directionalLight2.position.set(1, -0.5, -1)
    scene.add(directionalLight2)

    // Create globe
    const globeRadius = 100
    globeRadiusRef.current = globeRadius
    const globeGeometry = new THREE.SphereGeometry(globeRadius, 75, 75)

    // Load Earth night texture
    textureLoader.load(
      'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg',
      (texture) => {
        const globeMaterial = new THREE.MeshStandardMaterial({
          map: texture,
          metalness: 0.1,
          roughness: 0.9
        })
        
        const globe = new THREE.Mesh(globeGeometry, globeMaterial)
        globeRef.current = globe
        scene.add(globe)

        // Create markers group (attached to globe for rotation)
        const markersGroup = new THREE.Group()
        markersGroupRef.current = markersGroup
        globe.add(markersGroup)

        // Add crises if provided
        if (crises.length > 0) {
          updateCrises(markersGroup, crises, globeRadius, selectedCrisis)
        }
      },
      undefined,
      () => {
        // Fallback material
        const globeMaterial = new THREE.MeshStandardMaterial({
          color: 0x1a4d7a,
          metalness: 0.1,
          roughness: 0.9
        })
        
        const globe = new THREE.Mesh(globeGeometry, globeMaterial)
        globeRef.current = globe
        scene.add(globe)

        const markersGroup = new THREE.Group()
        markersGroupRef.current = markersGroup
        globe.add(markersGroup)

        // Add crises if provided
        if (crises.length > 0) {
          updateCrises(markersGroup, crises, globeRadius, selectedCrisis)
        }
      }
    )

    // Raycaster for marker interaction
    const raycaster = new THREE.Raycaster()
    raycasterRef.current = raycaster

    // Drag-to-rotate interaction
    let isDragging = false
    let previousMousePosition = { x: 0, y: 0 }
    let rotationSpeed = 0.005
    let autoRotate = true
    let autoRotateSpeed = 0.001

    const onMouseDown = (event) => {
      isDragging = true
      autoRotate = false
      previousMousePosition = { x: event.clientX, y: event.clientY }
      renderer.domElement.style.cursor = 'grabbing'
    }

    const onMouseMove = (event) => {
      // Update mouse position for raycaster
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1

      if (isDragging && globeRef.current) {
        const deltaX = event.clientX - previousMousePosition.x
        const deltaY = event.clientY - previousMousePosition.y

        // Rotate around Y axis (horizontal drag)
        globeRef.current.rotation.y += deltaX * rotationSpeed
        
        // Rotate around X axis (vertical drag) with limits to prevent flipping
        globeRef.current.rotation.x += deltaY * rotationSpeed
        
        // Limit vertical rotation to prevent flipping
        globeRef.current.rotation.x = Math.max(
          -Math.PI / 2,
          Math.min(Math.PI / 2, globeRef.current.rotation.x)
        )

        previousMousePosition = { x: event.clientX, y: event.clientY }
      }
    }

    const onMouseUp = (event) => {
      if (!isDragging) {
        // Check for marker click
        if (globeRef.current && markersGroupRef.current && cameraRef.current) {
          raycaster.setFromCamera(mouseRef.current, cameraRef.current)
          const intersects = raycaster.intersectObjects(markersGroupRef.current.children, true)
          
          if (intersects.length > 0) {
            const intersected = intersects[0].object
            // Traverse up to find the marker group with crisis data
            let current = intersected
            while (current && !current.userData.crisis) {
              current = current.parent
            }
            if (current && current.userData.crisis && onCrisisSelect) {
              onCrisisSelect(current.userData.crisis)
            }
          }
        }
      }
      
      isDragging = false
      autoRotate = true
      renderer.domElement.style.cursor = 'grab'
    }

    const onMouseLeave = () => {
      isDragging = false
      autoRotate = true
      renderer.domElement.style.cursor = 'grab'
    }

    // Touch support
    const onTouchStart = (event) => {
      if (event.touches.length > 0) {
        isDragging = true
        autoRotate = false
        previousMousePosition = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY
        }
        event.preventDefault()
      }
    }

    const onTouchMove = (event) => {
      if (isDragging && event.touches.length > 0 && globeRef.current) {
        const deltaX = event.touches[0].clientX - previousMousePosition.x
        const deltaY = event.touches[0].clientY - previousMousePosition.y

        globeRef.current.rotation.y += deltaX * rotationSpeed
        globeRef.current.rotation.x += deltaY * rotationSpeed
        
        globeRef.current.rotation.x = Math.max(
          -Math.PI / 2,
          Math.min(Math.PI / 2, globeRef.current.rotation.x)
        )

        previousMousePosition = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY
        }
        event.preventDefault()
      }
    }

    const onTouchEnd = () => {
      isDragging = false
      autoRotate = true
    }

    renderer.domElement.style.cursor = 'grab'
    renderer.domElement.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('mouseleave', onMouseLeave)
    renderer.domElement.addEventListener('touchstart', onTouchStart)
    renderer.domElement.addEventListener('touchmove', onTouchMove)
    renderer.domElement.addEventListener('touchend', onTouchEnd)

    // Animation
    let animationId
    const animate = () => {
      animationId = requestAnimationFrame(animate)

      const elapsedTime = clockRef.current.getElapsedTime()

      if (globeRef.current) {
        // Auto-rotate only when not dragging
        if (autoRotate && !isDragging) {
          globeRef.current.rotation.y += autoRotateSpeed
        }
      }

      // Animate markers (pulsing effect)
      if (markersGroupRef.current) {
        markersGroupRef.current.children.forEach((markerGroup) => {
          markerGroup.children.forEach((child) => {
            if (child.userData.isMarker) {
              const scale = 1 + Math.sin(elapsedTime * 2) * 0.2
              child.scale.setScalar(scale)
              
              const intensity = 0.5 + Math.sin(elapsedTime * 2) * 0.3
              if (child.material) {
                child.material.emissiveIntensity = intensity
              }
            }
          })
        })
      }

      renderer.render(scene, camera)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight
        cameraRef.current.updateProjectionMatrix()
        rendererRef.current.setSize(window.innerWidth, window.innerHeight)
      }
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      renderer.domElement.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('mouseleave', onMouseLeave)
      renderer.domElement.removeEventListener('touchstart', onTouchStart)
      renderer.domElement.removeEventListener('touchmove', onTouchMove)
      renderer.domElement.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationId)
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [onCrisisSelect])

  return (
    <div className="relative w-full h-full">
      <div 
        ref={containerRef} 
        className="w-full h-full"
      />
      <SeverityLegend />
    </div>
  )
}
