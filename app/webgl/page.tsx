'use client';

import { useEffect, useRef, useState, useContext } from 'react';
import { Tomorrow } from 'next/font/google';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { GlobalContext, ContextProvider } from '@/context';

const tomorrow = Tomorrow({
  weight: '600',
  subsets: ['latin'],
});

const WIDTH = 1600;
const HEIGHT = 900;

const vertexShader = `
  attribute vec2 aPosition;
  attribute vec2 aTexCoord;
  varying vec2 vTexCoord;
  
  void main() {
    vTexCoord = aTexCoord;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;
  
  uniform sampler2D uTexture;
  uniform sampler2D uDepthMap;
  uniform vec2 uPointer;
  uniform float uProgress;
  varying vec2 vTexCoord;
  
  void main() {
    vec2 uv = vTexCoord;
    
    // Get depth value
    float depth = texture2D(uDepthMap, uv).r;
    
    // Calculate flow effect
    float flow = 1.0 - smoothstep(0.0, 0.02, abs(depth - uProgress));
    
    // Apply pointer displacement
    vec2 displacedUV = uv + (texture2D(uDepthMap, uv).r * uPointer * 0.01);
    
    // Sample texture with displacement
    vec4 color = texture2D(uTexture, displacedUV);
    
    // Create scanning effect
    float scanLine = mod(uv.y * 120.0, 2.0) - 1.0;
    float scanBrightness = smoothstep(0.5, 0.49, length(scanLine));
    
    // Combine effects
    vec3 finalColor = color.rgb + vec3(10.0, 0.0, 0.0) * scanBrightness * flow;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

const Scene = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const { setIsLoading } = useContext(GlobalContext);
  const [textures, setTextures] = useState<{ texture: WebGLTexture | null; depthMap: WebGLTexture | null }>({
    texture: null,
    depthMap: null,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    glRef.current = gl;

    // Create and compile shaders
    const vertexShaderObj = gl.createShader(gl.VERTEX_SHADER)!;
    const fragmentShaderObj = gl.createShader(gl.FRAGMENT_SHADER)!;
    
    gl.shaderSource(vertexShaderObj, vertexShader);
    gl.shaderSource(fragmentShaderObj, fragmentShader);
    
    gl.compileShader(vertexShaderObj);
    gl.compileShader(fragmentShaderObj);

    // Create program and attach shaders
    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShaderObj);
    gl.attachShader(program, fragmentShaderObj);
    gl.linkProgram(program);
    gl.useProgram(program);
    
    programRef.current = program;

    // Create geometry
    const vertices = new Float32Array([
      -1, -1, 0, 0,
       1, -1, 1, 0,
       1,  1, 1, 1,
      -1,  1, 0, 1
    ]);

    const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);

    // Create buffers
    const vertexBuffer = gl.createBuffer();
    const indexBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    // Set up attributes
    const positionLocation = gl.getAttribLocation(program, 'aPosition');
    const texCoordLocation = gl.getAttribLocation(program, 'aTexCoord');

    gl.enableVertexAttribArray(positionLocation);
    gl.enableVertexAttribArray(texCoordLocation);

    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 16, 0);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 16, 8);

    // Load textures
    const loadTexture = (url: string): Promise<WebGLTexture> => {
      return new Promise((resolve, reject) => {
        const texture = gl.createTexture()!;
        const image = new Image();
        
        image.onload = () => {
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          resolve(texture);
        };
        
        image.onerror = reject;
        image.src = url;
      });
    };
    Promise.all([
      loadTexture('/raw-3.jpg'),
      loadTexture('/depth-3.png')
    ]).then(([texture, depthMap]) => {
      setTextures({ texture, depthMap });
      setIsLoading(false);
    });

    // Animation loop
    let progress = 0;
    const animate = () => {
      if (!gl || !program || !textures.texture || !textures.depthMap) return;

      gl.clear(gl.COLOR_BUFFER_BIT);
      
      // Bind textures
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textures.texture);
      gl.uniform1i(gl.getUniformLocation(program, 'uTexture'), 0);

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, textures.depthMap);
      gl.uniform1i(gl.getUniformLocation(program, 'uDepthMap'), 1);
      
      // Update uniforms
      const pointerLocation = gl.getUniformLocation(program, 'uPointer');
      const progressLocation = gl.getUniformLocation(program, 'uProgress');
      
      gl.uniform2f(pointerLocation, 0, 0); // Update with actual pointer position
      gl.uniform1f(progressLocation, progress);
      
      progress = (progress + 0.01) % 1.0;
      
      // Draw
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      
      requestAnimationFrame(animate);
    };

    if (textures.texture && textures.depthMap) {
      animate();
    }

    return () => {
      gl.deleteProgram(program);
      gl.deleteShader(vertexShaderObj);
      gl.deleteShader(fragmentShaderObj);
    };
  }, [textures]);

  return (
    <canvas
      ref={canvasRef}
      width={WIDTH}
      height={HEIGHT}
      style={{ width: '100%', height: '100%' }}
    />
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
        className="h-svh fixed z-90 bg-yellow-900 pointer-events-none w-full flex justify-center items-center"
        data-loader
      >
        <div className="w-6 h-6 bg-white animate-ping rounded-full"></div>
      </div>
      <div className="h-svh">
        <div className="h-svh uppercase items-center w-full absolute z-60 pointer-events-none px-10 flex justify-center flex-col">
          <div
            className="text-4xl md:text-7xl xl:text-8xl 2xl:text-9xl"
            style={{
              ...tomorrow.style,
            }}
          >
            <div className="flex space-x-2 lg:space-x-6 overflow-hidden">
              {'Crown of Fire'.split(' ').map((word, index) => {
                return (
                  <div data-title key={index}>
                    {word}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-xs md:text-xl xl:text-2xl 2xl:text-3xl mt-2 overflow-hidden">
            <div data-desc>The Majesty and Glory of the Young King</div>
          </div>
        </div>

        <Scene />
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <ContextProvider>
      <Html />
    </ContextProvider>
  );
} 