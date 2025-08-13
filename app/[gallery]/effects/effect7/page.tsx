'use client';

import { WebGPUCanvas } from '@/components/canvas';
import { useAspect, useTexture, Environment } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useContext, useMemo, useRef } from 'react';
import { Tomorrow } from 'next/font/google';
import gsap from 'gsap';

import {
  abs,
  blendScreen,
  float,
  Fn,
  max,
  mod,
  oneMinus,
  select,
  ShaderNodeObject,
  sin,
  smoothstep,
  sub,
  texture,
  uniform,
  uv,
  vec2,
  vec3,
  attribute,
} from 'three/tsl';

import * as THREE from 'three/webgpu';
import { useGSAP } from '@gsap/react';
import { PostProcessing } from '@/components/post-processing';
import { ContextProvider, GlobalContext } from '@/context';

import TEXTUREMAP from '@/assets/raw-6.png';
import NORMALMAP from '@/assets/normal.png';
import DEPTHMAP from '@/assets/depth-6.png';

const tomorrow = Tomorrow({
  weight: '600',
  subsets: ['latin'],
});

const WIDTH = 1226;
const HEIGHT = 650;

const sdCross = Fn(
  ([p_immutable, b_immutable, r_immutable]: ShaderNodeObject<THREE.Node>[]) => {
    const r = float(r_immutable).toVar();
    const b = vec2(b_immutable).toVar();
    const p = vec2(p_immutable).toVar();
    p.assign(abs(p));
    p.assign(select(p.y.greaterThan(p.x), p.yx, p.xy));
    const q = vec2(p.sub(b)).toVar();
    const k = float(max(q.y, q.x)).toVar();
    const w = vec2(
      select(k.greaterThan(0.0), q, vec2(b.y.sub(p.x), k.negate()))
    ).toVar();
    const d = float(max(w, 0.0).length()).toVar();

    return select(k.greaterThan(0.01), d, d.negate()).add(r);
  }
);

const Scene = () => {
  const { setIsLoading } = useContext(GlobalContext);
  const lightRef = useRef<THREE.SpotLight>(null);
  const pointLightRef = useRef<THREE.PointLight>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  const [rawMap, depthMap, normalMap] = useTexture([TEXTUREMAP.src, DEPTHMAP.src, NORMALMAP.src], () => {
    setIsLoading(false);
    rawMap.colorSpace = THREE.SRGBColorSpace;
  });

  const { material, uniforms } = useMemo(() => {
    const uPointer = uniform(new THREE.Vector2(0));
    const uProgress = uniform(0);

    const strength = 0.014;

    const aspect = float(WIDTH).div(HEIGHT);
    const tUv = vec2(uv().x.mul(aspect), uv().y);

    // First sample depth map with original UV
    const initialDepth = texture(depthMap, uv());
    
    // Create base UV with parallax from initial depth sample
    const baseUv = uv().add(initialDepth.r.mul(uPointer).mul(strength));
    
    // Sample depth map again with parallaxed UV
    const tDepthMap = texture(depthMap, baseUv);

    const depth = oneMinus(tDepthMap);
    const scanWidth = 0.15;
    const flow = sub(1, smoothstep(0, scanWidth, abs(depth.sub(uProgress))));

    // --- Ripple effect ---
    const rippleFreq = 2.0;
    const rippleAmp = 0.005;
    const ripple = sin(tUv.y.mul(rippleFreq).add(uProgress.mul(1.0))).mul(rippleAmp).mul(flow.r);

    // Displace UV with ripple and parallax
    const displacedUv = baseUv.add(vec2(0.0, ripple));

    // RGB Shift effect
    const rgbShiftAmount = 0.005;
    const redUv = displacedUv.add(vec2(rgbShiftAmount, 0).mul(flow.r));
    const blueUv = displacedUv.sub(vec2(rgbShiftAmount, 0).mul(flow.r));

    // Sample texture with RGB shift
    const redChannel = texture(rawMap, redUv).r;
    const greenChannel = texture(rawMap, displacedUv).g;
    const blueChannel = texture(rawMap, blueUv).b;

    const tMap = vec3(redChannel, greenChannel, blueChannel).mul(0.5);

    const tiling = vec2(70.0);
    const tiledUv = mod(tUv.mul(tiling), 2.0).sub(1.0);

    const dist = sdCross(tiledUv, vec2(0.2, 0.01), 0.0);
    const cross = vec3(smoothstep(0.0, 0.02, dist));

    const mask = oneMinus(cross).mul(flow).mul(vec3(2, 2, 2));

    const final = blendScreen(tMap, mask);

    // Add elevation from depth map
    const elevation = tDepthMap.r.mul(0.0); // Adjust multiplier to control displacement amount
    const positionLocal = attribute('position');
    const position = positionLocal.add(vec3(0, elevation, 0));

    const material = new THREE.MeshStandardNodeMaterial({
      colorNode: final,
      roughness: 0.5, // Reduced from 1
      metalness: 0.2, // Reduced from 1
      envMapIntensity: 1.0, // Add this
    });
    material.positionNode = position;

    return {
      material,
      uniforms: {
        uPointer,
        uProgress,
      },
    };
  }, [rawMap, depthMap]);

  const [w, h] = useAspect(WIDTH, HEIGHT);

  const pointerRef = useRef(new THREE.Vector2());

  useGSAP(() => {
    gsap.to(uniforms.uProgress, {
      value: 0.9,
      repeat: -1,
      duration: 3,
      ease: 'power1.out',
    });
  }, [uniforms.uProgress]);

  useFrame((state) => {
    // Lerp the pointer value for smoothness
    pointerRef.current.lerp(state.pointer, 0.021);
    uniforms.uPointer.value.copy(pointerRef.current);

    // Add mesh rotation based on pointer
    if (meshRef.current) {
      const rotX = THREE.MathUtils.lerp(
        meshRef.current.rotation.x,
        -pointerRef.current.y * -0.02,
        0.1
      );
      const rotY = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        pointerRef.current.x * -0.02,
        0.1
      );
      
      meshRef.current.rotation.x = rotX;
      meshRef.current.rotation.y = rotY;
    }

    // Make both lights follow mouse
    if (lightRef.current && pointLightRef.current) {
      // Convert pointer values to world space coordinates
      const x = pointerRef.current.x * 8;
      const y = pointerRef.current.y * 8;
      
      // Update spotlight
      lightRef.current.position.x = x;
      lightRef.current.position.y = y;
      lightRef.current.position.z = 14.5;
      lightRef.current.lookAt(0, 0, 0);

      // Update point light
      pointLightRef.current.position.x = x;
      pointLightRef.current.position.y = y;
      pointLightRef.current.position.z = 10;
    }
  });

  return (
    <>
      <ambientLight intensity={5} color="#ffffff" /> {/* Reduced from 10000.2 */}
      <spotLight
        ref={lightRef}
        position={[0, 0, 10]}
        intensity={10.5} // Reduced from 2000.5
        angle={0.5}
        penumbra={0.15}
        distance={10}
        decay={2}
        color="#ffffff"
        castShadow // Uncommented this
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      />
      <pointLight
        ref={pointLightRef}
        position={[0, 0, 4]}
        intensity={100.8} // Reduced from 50.8
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
        distance={10}
        decay={2}
      />
      <mesh 
        ref={meshRef}
        scale={[w, h, 1]} 
        position={[0, 0, 0.2]} 
        material={material}
        receiveShadow
      >
        <planeGeometry args={[1, 1, 256, 256]} />
      </mesh>
    </>
  );
};

const Html = () => {
  const { isLoading } = useContext(GlobalContext);

  useGSAP(() => {
    if (!isLoading) {
      gsap
        .timeline()
        .to('[data-loader]', {
          opacity: 0,
        })
        .from('[data-title]', {
          yPercent: -100,
          stagger: {
            each: 0.15,
          },
          ease: 'power1.out',
        })
        .from('[data-desc]', {
          opacity: 0,
          yPercent: 100,
        });
    }
  }, [isLoading]);

  return (
    <div>
      <div
        className="h-svh fixed z-90 bg-gray-500 pointer-events-none w-full flex justify-center items-center"
        data-loader
      >
        <div className="w-6 h-6 bg-white animate-ping rounded-full"></div>
      </div>
      <div className="h-svh">
        <div className="h-svh uppercase items-center w-full absolute z-60 pointer-events-none px-10 flex justify-center flex-col">
          <div
            className="text-xl md:text-4xl xl:text-6xl 2xl:text-7xl"
            style={{
              ...tomorrow.style,
            }}
          >
           
          </div>

          <div className=" text-center text-xs md:text-xl xl:text-2xl 2xl:text-3xl mt-2 overflow-hidden">
            
          </div>
        </div>

        <WebGPUCanvas>
          <PostProcessing strength={1}></PostProcessing>
          <Scene></Scene>
        </WebGPUCanvas>
      </div>
    </div>
  );
};

export default function Page() {
  return (
    <ContextProvider>
      <Html></Html>
    </ContextProvider>
  );
}