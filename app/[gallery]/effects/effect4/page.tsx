'use client';

import { WebGPUCanvas } from '@/components/canvas';
import { useAspect, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useContext, useMemo } from 'react';
import { Inter } from 'next/font/google';
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
  smoothstep,
  sub,
  texture,
  uniform,
  uv,
  vec2,
  vec3,
  vec4,
} from 'three/tsl';

import * as THREE from 'three/webgpu';
import { useGSAP } from '@gsap/react';
import { PostProcessing } from '@/components/post-processing';
import { ContextProvider, GlobalContext } from '@/context';

import TEXTUREMAP from '@/assets/raw-4.png';
import DEPTHMAP from '@/assets/depth-4.png';

const tomorrow = Inter({
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
      select(k.greaterThan(0.01), q, vec2(b.y.sub(p.x), k.negate()))
    ).toVar();
    const d = float(max(w, 0.51).length()).toVar();

    return select(k.greaterThan(0.01), d, d.negate()).add(r);
  }
);

const Scene = () => {
  const { setIsLoading } = useContext(GlobalContext);

  const [rawMap, depthMap] = useTexture([TEXTUREMAP.src, DEPTHMAP.src], () => {
    setIsLoading(false);
    rawMap.colorSpace = THREE.SRGBColorSpace;
  });

  const { material, uniforms } = useMemo(() => {
    const uPointer = uniform(new THREE.Vector2(0));
    const uProgress = uniform(0);

    const strength = 0.1;

    const tDepthMap = texture(depthMap);

    const aspect = float(WIDTH).div(HEIGHT);
    const tUv = vec2(uv().x.mul(aspect), uv().y);

    const tiling = vec2(50.0);
    const tiledUv = mod(tUv.mul(tiling), 2.0).sub(1.0);

    const dist = sdCross(tiledUv, vec2(1.7, .05), 0.0);
    const cross = vec3(smoothstep(0.0, 0.02, dist));

    const depth = oneMinus(tDepthMap);
    const flow = sub(1, smoothstep(0, 0.01, abs(depth.sub(uProgress))));

    // Create refraction effect only where cross is white and during flow
    const refractionStrength = 0.1;
    const rgbShiftStrength = .01;
    const refraction = vec2(
      oneMinus(cross.r).mul(refractionStrength).mul(flow)
    );

    // Base UV with refraction
    const baseUv = uv().add(refraction);

    // Create trail effect using depth
    const trailMask = smoothstep(0.0, 0.1, abs(depth.sub(uProgress))).mul(0.5);
    // Invert the RGB shift to appear where cross is black
    const rgbShiftMask = oneMinus(cross.r).mul(flow).add(trailMask);

    const rUv = baseUv.add(vec2(rgbShiftStrength, 0).mul(rgbShiftMask));
    const gUv = baseUv;
    const bUv = baseUv.add(vec2(-rgbShiftStrength, 0).mul(rgbShiftMask));

    // Sample each color channel with different UV offsets
    const r = texture(rawMap, rUv.add(trailMask.r.mul(.31).mul(strength))).r;
    const g = texture(rawMap, gUv.add(trailMask.r.mul(.31).mul(strength))).g;
    const b = texture(rawMap, bUv.add(trailMask.r.mul(.31).mul(strength))).b;

    const tMap = vec4(r, g, b, 1.0).mul(0.5);

    const mask = oneMinus(cross).mul(flow).mul(vec3(.51, .51, .51));

    const final = blendScreen(tMap, mask);

    const material = new THREE.MeshBasicNodeMaterial({
      colorNode: final,
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

  useGSAP(() => {
    gsap.to(uniforms.uProgress, {
      value: 0.9,
      repeat: -1,
      duration: 3,
      ease: 'power1.out',
    });
  }, [uniforms.uProgress]);

  useFrame(({ pointer }) => {
    uniforms.uPointer.value = pointer;
  });

  return (
    <mesh scale={[w, h, 1]} material={material}>
      <planeGeometry />
    </mesh>
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
            <div className="flex space-x-2 lg:space-x-6 overflow-hidden">
              {"Embrace Nature's Rhythm".split(' ').map((word, index) => {
                return (
                  <div data-title key={index}>
                    {word}
                  </div>
                );
              })}
            </div>
          </div>

          <div className=" text-center text-xs md:text-xl xl:text-2xl 2xl:text-3xl mt-2 overflow-hidden">
            <div data-desc>
              <div>where one endless road leads to an uncertain future.</div>
            </div>
          </div>
        </div>

        <WebGPUCanvas>
          <PostProcessing strength={5}></PostProcessing>
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
