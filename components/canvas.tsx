import * as THREE from 'three/webgpu';
import { Canvas, CanvasProps, extend } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';

extend(THREE as any);

export const WebGPUCanvas = (props: CanvasProps) => {
  return (
    <Canvas
      {...props}
     
      gl={async (props) => {
        const renderer = new THREE.WebGPURenderer(props as any);
        await renderer.init();
        return renderer;
      }}
    >
      <PerspectiveCamera makeDefault position={[0, 0, 2]} fov={50} near={0.1} far={100} />
      {props.children}
    </Canvas>
  );
};
