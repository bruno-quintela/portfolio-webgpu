'use client';

import { WebGPUCanvas } from '@/components/canvas';
import { useAspect, useTexture, Environment } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useContext, useMemo, useRef, useEffect } from 'react';
import { Tomorrow } from 'next/font/google';
import gsap from 'gsap';

import {
  abs,
  blendScreen,
  float,
  Fn,
  max,
  mod,
  cos,
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
  vec4,
  attribute,
} from 'three/tsl';

import * as THREE from 'three/webgpu';
import { useGSAP } from '@gsap/react';
import { PostProcessing } from '@/components/post-processing';
import { ContextProvider, GlobalContext } from '@/context';

import TEXTUREMAP from '@/assets/raw-transparent-14.png';
import TEXTUREMAP2 from '@/assets/background-14.png';
import NORMALMAP from '@/assets/normal.png';
import DEPTHMAP from '@/assets/depth-color-14.webp';
import TEXTUREMAP3 from '@/assets/background-14.png'; // Add your third texture
import TEXTUREMAP4 from '@/assets/background-14.png'; // Add your fourth texture

const tomorrow = Tomorrow({
  weight: '600',
  subsets: ['latin'],
});

const WIDTH = 1376;
const HEIGHT = 768;

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
  const meshRef2 = useRef<THREE.Mesh>(null); // Add ref for second mesh
  const meshRef3 = useRef<THREE.Mesh>(null);
  const meshRef4 = useRef<THREE.Mesh>(null);
  const scrollRef = useRef(0);
  const targetScrollRef = useRef(0);
  const lastScrollRef = useRef(0);
  const scrollVelocityRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      targetScrollRef.current = 
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [rawMap, rawMap2, depthMap, normalMap, rawMap3, rawMap4] = useTexture(
    [TEXTUREMAP.src, TEXTUREMAP2.src, DEPTHMAP.src, NORMALMAP.src, TEXTUREMAP3.src, TEXTUREMAP4.src], 
    () => {
      setIsLoading(false);
      rawMap.colorSpace = THREE.SRGBColorSpace;
      rawMap2.colorSpace = THREE.SRGBColorSpace;
      rawMap3.colorSpace = THREE.SRGBColorSpace;
      rawMap4.colorSpace = THREE.SRGBColorSpace;
    }
  );

  const { material, material2, material3, material4, uniforms } = useMemo(() => {
    const uPointer = uniform(new THREE.Vector2(0));
    const uProgress = uniform(0);
    const uScrollVelocity = uniform(0); // Add scroll velocity uniform

    const strength = 0.01; // Increased for more noticeable effect
    const maxRGBShift = float(.1);
    const depthParallaxStrength = float(strength); // Specific strength for depth parallax

    const aspect = float(WIDTH).div(HEIGHT);
    const tUv = vec2(uv().x.mul(aspect), uv().y);

    // Extract depth from RGB channels with proper weights
    const getRGBDepth = (depthSample: any) => {
      // Use all RGB channels with standard grayscale weights
      return depthSample.r.mul(0.33)
        .add(depthSample.g.mul(0.33))
        .add(depthSample.b.mul(0.33));
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
    const scanWidth = float(0.05);
    const flow = sub(1, smoothstep(0, scanWidth, abs(depth.sub(uProgress))));

    // Enhance ripple effect with parallax-affected depth
    const rippleFreq = float(1.0);
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

    // Calculate tilt direction
    const pointerLength = uPointer.length();
    const tiltDirection = vec2(
        abs(uPointer.x).div(pointerLength.add(0.0002)),  // Horizontal weight
        abs(uPointer.y).div(pointerLength.add(0.0002))   // Vertical weight
    );

    // Dynamic RGB Shift based on depth-aware parallax strength and tilt direction
    const scrollBasedShift = float(uScrollVelocity).mul(0.001); // Adjust multiplier for intensity
    const rgbShiftAmount = maxRGBShift
      .mul(parallaxStrength)
      .mul(depth)
      .add(abs(scrollBasedShift)); // Add scroll-based shift

    // Update the RGB offset calculation
    const rgbOffset = vec2(
      rgbShiftAmount.mul(tiltDirection.x).mul(2.0),
      rgbShiftAmount.mul(tiltDirection.y).add(scrollBasedShift).mul(2.0) // Add vertical shift based on scroll
    );

    // Multi-sample blur based on parallax strength
    const blurStrength = parallaxStrength.pow(2).mul(1); // Adjust blur intensity
    let finalColor = vec4(0); // Change to vec4 to include alpha

    // Add heat distortion parameters
    const heatTime = uniform(0); // Time uniform for animation
    const heatIntensity = float(0.0); // Adjust for stronger/weaker effect
    
    // Define bandpass parameters
    const bandpassLow = float(0.4);  // Lower threshold
    const bandpassHigh = float(0.99); // Upper threshold
    const bandpassSmooth = float(0.15); // Smoothing factor

    // Create bandpass mask
    const depthBandpass = smoothstep(bandpassLow, bandpassLow.add(bandpassSmooth), depth)
        .mul(oneMinus(smoothstep(bandpassHigh.sub(bandpassSmooth), bandpassHigh, depth)));
    
    // Add heat distortion calculation with bandpass
    const heat = sin(
      tUv.x.mul(10.0) // X frequency
        .add(tUv.y.mul(3000.0)) // Y frequency
        .add(heatTime.mul(1.5)) // Time-based animation
    ).mul(
      sin(
        tUv.y.mul(15.0)
          .add(heatTime.mul(1.5))
      )
    ).mul(heatIntensity)
     .mul(depthBandpass); // Replace depth.pow(1.0) with depthBandpass

    // Apply heat distortion to the displaced UV
    const heatedUv = displacedUv.add(
      vec2(
        heat.mul(sin(heatTime)),
        heat.mul(cos(heatTime))
      )
    );

    // Create a box blur effect with directional RGB shift
    const maxBlurSamples = 1; // Number of samples for blur
    for (let i = 0; i < maxBlurSamples; i++) {
      const offset = float(i - maxBlurSamples / 2).mul(blurStrength).div(maxBlurSamples);
      const sampleUv = heatedUv.add(vec2(offset)); // Use heatedUv instead of displacedUv

      // Apply RGB shift based on tilt direction
      const redSample = texture(rawMap, sampleUv.add(rgbOffset));
      const greenSample = texture(rawMap, sampleUv);
      const blueSample = texture(rawMap, sampleUv.sub(rgbOffset));

      // Combine channels with alpha from the center sample
      const sampleColor = vec4(
        redSample.r,
        greenSample.g,
        blueSample.b,
        greenSample.a // Use alpha from center sample
      );
      finalColor = finalColor.add(sampleColor);
    }

    const tMap = finalColor.div(maxBlurSamples);
    const tiling = vec2(200.0);
    const tiledUv = mod(tUv.mul(tiling), 2.0).sub(1.0);

    const dist = sdCross(tiledUv, vec2(0.2, 0.01), 0.0);
    const cross = vec3(smoothstep(0.0, 0.02, dist));
    const mask = oneMinus(cross).mul(flow).mul(vec3(2, 2, 2));

    // Update mask to include alpha from texture
    const mask4 = vec4(mask, tMap.a);
    // Preserve alpha in final blend
    const final = blendScreen(tMap, mask4).mul(vec4(1, 1, 1, tMap.a));

    const material = new THREE.MeshBasicNodeMaterial({
      colorNode: final,
      transparent: true,
      depthTest: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    // Create second material with only heat effect
    let finalColor2 = vec4(0);

    // Create proper UV coordinates for material2 without aspect ratio correction
    const baseUv2 = uv();

    // Create smoke-like heat effect for material2
    const heat2 = sin(
        baseUv2.x.mul(5.0)                        // Reduced horizontal frequency
            .add(
                baseUv2.y.mul(10.0)               // Reduced vertical frequency
                .add(heatTime.mul(1.0))           // Slower upward movement
            )
    ).mul(
        sin(
            baseUv2.y.mul(7.0)                    // Reduced vertical distortion
                .sub(heatTime.mul(0.5))           // Slower variation
                .add(
                    sin(baseUv2.x.mul(3.0))       // Reduced horizontal waves
                    .mul(0.3)
                )
        )
    ).mul(0.02);                                  // Reduced intensity

    // Create upward movement vector
    const upwardFlow = vec2(
        sin(heatTime.mul(0.25)).mul(0.005),      // Reduced horizontal drift
        sin(heatTime).mul(-0.1)                 // Reduced upward movement
    );

    // Apply heat distortion to UV coordinates for material2
    const heatedUv2 = baseUv2.add(
        vec2(
            heat2.mul(sin(heatTime.mul(0.25))),  // Slower horizontal distortion
            heat2.add(upwardFlow.y)              // Add gentle upward movement
        )
    );

    // Simple texture sampling with unmodified UV coordinates
    const textureSample = texture(rawMap2, heatedUv2);
    finalColor2 = vec4(textureSample.rgb, textureSample.g);

    const final2 = finalColor2;

    const material2 = new THREE.MeshBasicNodeMaterial({
        colorNode: final2,
        opacity: 1,
        transparent: true,
        depthTest: true,
        depthWrite: true,
        side: THREE.DoubleSide,
    });

    // Material 3 - based on material2
    let finalColor3 = vec4(0);
    const baseUv3 = uv();

    const textureSample3 = texture(rawMap3, baseUv3);
    finalColor3 = vec4(textureSample3.rgb, textureSample3.a);

    const material3 = new THREE.MeshBasicNodeMaterial({
      colorNode: finalColor3,
      transparent: false,
      depthTest: false,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    // Material 4 - based on material2
    let finalColor4 = vec4(0);
    const baseUv4 = uv();
    const heat4 = sin(
      baseUv4.x.mul(4.0)
        .add(baseUv4.y.mul(6.0).add(heatTime.mul(1.2)))
    ).mul(
      sin(
        baseUv4.y.mul(9.0)
          .sub(heatTime.mul(1.4))
          .add(sin(baseUv4.x.mul(4.0)).mul(0.4))
      )
    ).mul(0.025);

    const heatedUv4 = baseUv4.add(
      vec2(
        heat4.mul(sin(heatTime.mul(0.3))),
        heat4.add(sin(heatTime).mul(-0.08))
      )
    );

    const textureSample4 = texture(rawMap4, heatedUv4);
    finalColor4 = vec4(textureSample4.rgb, textureSample4.r);

    const material4 = new THREE.MeshBasicNodeMaterial({
      colorNode: finalColor4,
      opacity: 0.1,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    return {
      material,
      material2,
      material3,
      material4,
      uniforms: {
        uPointer,
        uProgress,
        uScrollVelocity, // Add new uniform
        heatTime, // Add new uniform
      },
    };
  }, [rawMap, rawMap2, rawMap3, rawMap4, depthMap]);

  const [w, h, aspect] = useAspect(WIDTH, HEIGHT);

  const pointerRef = useRef(new THREE.Vector2());

  useGSAP(() => {
    gsap.to(uniforms.uProgress, {
      value: 0.9,
      repeat: -1,
      duration: 3,
      ease: 'power1.out',
    });
  }, [uniforms.uProgress]);

  useFrame((state, delta) => {
    // Add scroll velocity calculation at the start of useFrame
    const scrollDelta = scrollRef.current - lastScrollRef.current;
    scrollVelocityRef.current = THREE.MathUtils.lerp(
      scrollVelocityRef.current,
      scrollDelta / delta, // Scale by delta time for consistent speed
      0.1
    );
    lastScrollRef.current = scrollRef.current;

    // Update scroll velocity uniform
    uniforms.uScrollVelocity.value = scrollVelocityRef.current;

    // Update heat time
    uniforms.heatTime.value += delta * 0.5; // Adjust speed by changing multiplier

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
        pointerRef.current.x * -0.01,
        0.1
      );

       meshRef.current.rotation.x = rotX;
       meshRef.current.rotation.y = rotY;
       meshRef4.current.rotation.x = rotX*1.5;
       meshRef4.current.rotation.y = rotY*1.5;
    }

    // Make both lights follow mouse
    // if (lightRef.current && pointLightRef.current) {
    //   // Convert pointer values to world space coordinates
    //   const x = pointerRef.current.x * 8;
    //   const y = pointerRef.current.y * 8;

    //   // Update spotlight
    //   lightRef.current.position.x = x;
    //   lightRef.current.position.y = y;
    //   lightRef.current.position.z = 4.5;
    //   lightRef.current.lookAt(0, 0, 0);

    //   // Update point light
    //   pointLightRef.current.position.x = x;
    //   pointLightRef.current.position.y = y;
    //   pointLightRef.current.position.z = 5;
    // }

    // Smooth scroll interpolation
    scrollRef.current = THREE.MathUtils.lerp(
      scrollRef.current,
      targetScrollRef.current,
      0.1
    );

    // Update mesh position based on scroll
    if (meshRef.current) {
      const maxOffset = h; // Maximum scroll offset based on height
      const scrollOffset = -maxOffset * scrollRef.current + h / 2; // Center the image initially
      meshRef.current.position.y = -scrollOffset/2; // Adjust for aspect ratio
    }

    // Add parallax effect for background plane
    if (meshRef2.current) {
      const maxOffset = h;
      const scrollOffset = -maxOffset * scrollRef.current + h / 2; // Define scrollOffset here
      
      const translateX = THREE.MathUtils.lerp(
        meshRef2.current.position.x,
        pointerRef.current.x * -.5, // Inverse movement
        0.05
      );
      const translateY = THREE.MathUtils.lerp(
        meshRef2.current.position.y,
        -scrollOffset/3 + pointerRef.current.y * -0.25, // Now scrollOffset is defined
        0.05
      );

      meshRef2.current.position.x = translateX;
      meshRef2.current.position.y = translateY;
      meshRef3.current.position.x = translateX*1.5;
      meshRef3.current.position.y = translateY*1.5;
      meshRef4.current.position.x = translateX*1.2;
      meshRef4.current.position.y = translateY*1.2;
    }

    // Animate new planes
    if (meshRef3.current) {
      const time = uniforms.heatTime.value;
      //meshRef3.current.position.x = translateX;
      //meshRef3.current.position.y = translateY;
      //meshRef3.current.position.z = -1.5;
      //meshRef3.current.rotation.z = Math.sin(time * 0.1) * 0.05;
    }

    if (meshRef4.current) {
      const time = uniforms.heatTime.value;
      //meshRef4.current.position.x =translateX;
      //meshRef4.current.position.y = translateY;
      //meshRef4.current.position.z = -1.8;
      //meshRef4.current.rotation.z = Math.cos(time * 0.1) * -0.05;
    }
  });

  return (
    <>
      <ambientLight intensity={5} color="#ffffff" />
      {/*front plane */}
      <mesh
        ref={meshRef4}
        scale={[1.*w, 1.*h, 1]}
        position={[0, 0, 1.75]}
        material={material4}
      >
        <planeGeometry args={[1, 1, 1, 1]} />
      </mesh>
       {/* Main plane (existing) */}
       <mesh
        ref={meshRef}
        scale={[1.5*w, 1.5*h, 1]}
        position={[0, 0, 0.1]}
        material={material}
        receiveShadow
      >
        <planeGeometry args={[1, 1, 1, 1]} />
      </mesh>
      {/* Background plane */}
      <mesh
        ref={meshRef2}
        scale={[1.5*w, 1.5*h, 1]} // Slightly larger scale
        position={[0, 0, -1]} // Position behind the main plane
        material={material2}
      >
        <planeGeometry args={[1, 1, 1, 1]} />
      </mesh>
      {/* Background plane 2 */}
      <mesh
        ref={meshRef3}
        scale={[2.*w, 2.*h, 1]}
        position={[0, 0, -1.5]}
        material={material3}
      >
        <planeGeometry args={[1, 1, 1, 1]} />
      </mesh>

      
    </>
  );
};

const Html = () => {
  const { isLoading } = useContext(GlobalContext);
  const containerHeight = useMemo(() => {
    // Calculate container height based on aspect ratio
    // Adding 100vh to account for the viewport height and ensure full scroll range
    return `${(HEIGHT / WIDTH * 100) + 300}vh`;
  }, []);

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
      {/* Add tall container to enable scrolling */}
      <div style={{ height: containerHeight }}> {/* Replace the h-[300vh] class */}
        {/* Make canvas container sticky */}
        <div className="h-svh sticky top-0">
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
            <PostProcessing strength={10.25}></PostProcessing>
            <Scene></Scene>
          </WebGPUCanvas>
        </div>
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