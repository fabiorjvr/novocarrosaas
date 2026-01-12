'use client';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Float, Sparkles, ContactShadows, useGLTF, Stage } from '@react-three/drei';
import { useRef, Suspense } from 'react';
import * as THREE from 'three';

function RealisticCar() {
  const gltf = useGLTF('/car.glb');
  const group = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (group.current) {
      // Gentle rotation for showcase
      group.current.rotation.y = state.clock.getElapsedTime() * 0.15;
    }
  });

  return (
    <group ref={group}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.2}>
        <primitive 
          object={gltf.scene} 
          scale={1.8} 
          position={[0, -0.5, 0]} 
          rotation={[0, Math.PI / 4, 0]}
        />
      </Float>
    </group>
  );
}

function Loader() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="hotpink" wireframe />
    </mesh>
  );
}

export default function Hero3D() {
  return (
    <div className="absolute inset-0 z-0 bg-[#050510]">
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, toneMapping: THREE.ReinhardToneMapping, toneMappingExposure: 1.5 }}>
        <PerspectiveCamera makeDefault position={[4, 2, 5]} fov={45} />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          minPolarAngle={Math.PI / 3} 
          maxPolarAngle={Math.PI / 2}
          autoRotate={false}
        />
        
        <Suspense fallback={<Loader />}>
          {/* Professional Studio Lighting Environment */}
          <Environment preset="studio" blur={0.6} background={false} />
          
          <RealisticCar />

          {/* Floor Reflections - High Quality */}
          <ContactShadows 
            resolution={1024} 
            scale={50} 
            blur={2} 
            opacity={0.6} 
            far={10} 
            color="#000000" 
          />
        </Suspense>
        
        {/* Cinematic Lighting Accents */}
        <spotLight position={[10, 10, 10]} angle={0.5} penumbra={1} intensity={200} color="#3b82f6" castShadow />
        <spotLight position={[-10, 5, -10]} angle={0.5} penumbra={1} intensity={200} color="#ef4444" />
        
        {/* Atmosphere */}
        <fog attach="fog" args={['#050510', 5, 25]} />
        <Sparkles count={50} scale={10} size={4} speed={0.4} opacity={0.4} color="#ffffff" />
      </Canvas>
    </div>
  );
}
