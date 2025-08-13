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

import TEXTUREMAP from '@/assets/raw-9.png';
import NORMALMAP from '@/assets/normal.png';
import DEPTHMAP from '@/assets/color-depth-9.webp';

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

    const strength = 0.05; // Increased for more noticeable effect
    const maxRGBShift = float(0.05);
    const depthParallaxStrength = float(0.015); // Specific strength for depth parallax

    const aspect = float(WIDTH).div(HEIGHT);
    const tUv = vec2(uv().x.mul(aspect), uv().y);

    // Extract depth from RGB channels with proper weights
    const getRGBDepth = (depthSample: any) => {
      return depthSample.r.mul(.299)
        .add(depthSample.g.mul(0.387))
        .add(depthSample.b.mul(0.314));
    };

    // Create parallax mask based on depth
    const getParallaxMask = (depth: any, pointerStrength: any) => {
      const maskStrength = depth.mul(pointerStrength);
      return vec2(
        maskStrength.mul(uPointer.x),
        maskStrength.mul(uPointer.y)
      );
    };

    // Initial depth sample with original UV
    const initialDepthRGB = texture(depthMap, uv());
    const initialDepth = getRGBDepth(initialDepthRGB);

    // Calculate initial parallax mask
    const initialParallaxMask = getParallaxMask(initialDepth, depthParallaxStrength);

    // Sample depth again with parallax offset
    const depthUv = uv().add(initialParallaxMask);
    const secondaryDepthRGB = texture(depthMap, depthUv);
    const secondaryDepth = getRGBDepth(secondaryDepthRGB);

    // Calculate final parallax strength using both depth samples
    const parallaxStrength = secondaryDepth
      .mul(uPointer.length())
      .mul(strength);

    // Create final UV offset with accumulated parallax
    const finalParallaxMask = getParallaxMask(secondaryDepth, depthParallaxStrength);
    const baseUv = depthUv.add(finalParallaxMask);

    // Sample depth one final time for the visual effect
    const tDepthMapRGB = texture(depthMap, baseUv);
    const tDepthMap = getRGBDepth(tDepthMapRGB);
    const depth = oneMinus(tDepthMap);

    // Enhanced scan effect with parallax-affected depth
    const scanWidth = float(0.005);
    const flow = sub(1, smoothstep(0, scanWidth, abs(depth.sub(uProgress))));

    // Enhance ripple effect with parallax-affected depth
    const rippleFreq = float(2.0);
    const rippleAmp = float(0.003);
    const ripple = sin(tUv.y.mul(rippleFreq).add(uProgress.mul(2.0)))
      .mul(rippleAmp)
      .mul(flow)
      .mul(depth.mul(2.0))
      .mul(parallaxStrength.add(1.0)); // Add parallax influence to ripple

    // Displace UV with enhanced depth-aware ripple
    const displacedUv = baseUv.add(
      vec2(
        ripple.mul(uPointer.x),
        ripple.mul(uPointer.y)
      )
    );

    // Dynamic RGB Shift based on depth-aware parallax strength
    const rgbShiftAmount = maxRGBShift.mul(parallaxStrength).mul(depth);

    // Multi-sample blur based on parallax strength
    const blurStrength = parallaxStrength.mul(0.5); // Adjust blur intensity
    let finalColor = vec3(0);

    // Create a box blur effect with RGB shift
    const maxBlurSamples = 1; // Number of samples for blur
    for (let i = 0; i < maxBlurSamples; i++) {
      const offset = float(i - maxBlurSamples / 2).mul(blurStrength).div(maxBlurSamples);
      const sampleUv = displacedUv.add(vec2(offset));

      // Sample each color channel with stronger offset
      const redSample = texture(rawMap, sampleUv.add(vec2(rgbShiftAmount.mul(2.0), 0)));
      const greenSample = texture(rawMap, sampleUv);
      const blueSample = texture(rawMap, sampleUv.sub(vec2(rgbShiftAmount.mul(2.0), 0)));

      // Combine channels explicitly
      const sampleColor = vec3(redSample.r, greenSample.g, blueSample.b);
      finalColor = finalColor.add(sampleColor);
    }

    // Increase the intensity of the final color
    const tMap = finalColor.div(maxBlurSamples);

    const tiling = vec2(70.0);
    const tiledUv = mod(tUv.mul(tiling), 2.0).sub(1.0);

    const dist = sdCross(tiledUv, vec2(0.2, 0.01), 0.0);
    const cross = vec3(smoothstep(0.0, 0.02, dist));

    const mask = oneMinus(cross).mul(flow).mul(vec3(2, 1, 1));

    const final = blendScreen(tMap, mask);

    const material = new THREE.MeshStandardNodeMaterial({
      colorNode: final,
      roughness: 0.5, // Reduced from 1
      metalness: 0.2, // Reduced from 1
      envMapIntensity: 1.0, // Add this
    });

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
      duration: 10,
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
        position={[0, 0, 0.]}
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