import { useState, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Preload, OrbitControls, useGLTF } from "@react-three/drei";
import * as random from "maath/random/dist/maath-random.esm";
import CanvasLoader from "../Loader";



const Earth = () => {
  const earth = useGLTF("./planet/scene.gltf");
  return <primitive object={earth.scene} scale={0.8} position={[0, 0, 0]} />;
};

const Scene = () => {
  return (
    <Canvas
      shadows
      frameloop='demand'
      dpr={[1, 2]}
      gl={{ preserveDrawingBuffer: true }}
      camera={{
        fov: 35,
        near: 0.1,
        far: 200,
        position: [0, 0, 10], // Ajuster la position de la caméra
      }}
    >
       <Suspense fallback={<CanvasLoader />}>
        {/* Add lights here */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <directionalLight
          position={[0, 10, 0]}
          intensity={1}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        
        <OrbitControls autoRotate enableZoom={false} />
        <Earth />
        <Preload all />
      </Suspense>
    </Canvas>
  );
};

export default Scene;
