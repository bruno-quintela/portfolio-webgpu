/**
 * WebGL Renderer for Gallery
 * Handles Three.js scene setup, texture loading, and rendering
 */

import * as THREE from "three";
import { vertexShader, fragmentShader, getEffectIndex } from "../shaders/galleryShaders";
import { GalleryConfig } from "./galleryUtils";

export interface RendererRefs {
  renderer: THREE.WebGLRenderer | null;
  scene: THREE.Scene | null;
  camera: THREE.OrthographicCamera | null;
  shaderMaterial: THREE.ShaderMaterial | null;
  slideTextures: THREE.Texture[];
  startTime: number;
}

export class GalleryRenderer {
  refs: RendererRefs = {
    renderer: null,
    scene: null,
    camera: null,
    shaderMaterial: null,
    slideTextures: [],
    startTime: Date.now(),
  };

  async initialize(canvas: HTMLCanvasElement, config: GalleryConfig, imageSources: string[]) {
    // Setup scene
    this.refs.scene = new THREE.Scene();
    this.refs.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.refs.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: false,
      alpha: false,
    });
    
    this.refs.renderer.setSize(window.innerWidth, window.innerHeight);
    this.refs.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create shader material
    this.refs.shaderMaterial = new THREE.ShaderMaterial({
      uniforms: this.createUniforms(config),
      vertexShader,
      fragmentShader,
    });

    // Create plane geometry
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, this.refs.shaderMaterial);
    this.refs.scene.add(mesh);

    // Load textures
    for (let i = 0; i < imageSources.length; i++) {
      try {
        const texture = await this.loadImageTexture(imageSources[i]);
        this.refs.slideTextures.push(texture);
      } catch (error) {
        console.warn(`Failed to load image ${i}:`, error);
      }
    }

    // Set initial textures
    if (this.refs.slideTextures.length >= 2) {
      this.refs.shaderMaterial.uniforms.uTexture1.value = this.refs.slideTextures[0];
      this.refs.shaderMaterial.uniforms.uTexture2.value = this.refs.slideTextures[1];
      this.refs.shaderMaterial.uniforms.uTexture1Size.value =
        (this.refs.slideTextures[0] as any).userData.size;
      this.refs.shaderMaterial.uniforms.uTexture2Size.value =
        (this.refs.slideTextures[1] as any).userData.size;
    }

    return this.refs;
  }

  createUniforms(config: GalleryConfig) {
    return {
      uTexture1: { value: null },
      uTexture2: { value: null },
      uProgress: { value: 0.0 },
      uTime: { value: 0.0 },
      uResolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
      uTexture1Size: { value: new THREE.Vector2(1, 1) },
      uTexture2Size: { value: new THREE.Vector2(1, 1) },
      uEffectType: { value: getEffectIndex(config.currentEffect) },
      // Global uniforms
      uGlobalIntensity: { value: config.globalIntensity },
      uSpeedMultiplier: { value: config.speedMultiplier },
      uColorShiftAmount: { value: config.colorShiftAmount },
      uDistortionStrength: { value: config.distortionStrength },
      uNoiseLevel: { value: config.noiseLevel },
      // Datamosh uniforms
      uDatamoshBlockSize: { value: config.datamoshBlockSize },
      uDatamoshCorruptionFreq: { value: config.datamoshCorruptionFreq },
      uDatamoshQuantization: { value: config.datamoshQuantization },
      uDatamoshDisplacement: { value: config.datamoshDisplacement },
      uDatamoshTemporal: { value: config.datamoshTemporal },
      // Pixel Sort uniforms
      uPixelSortDirection: { value: config.pixelSortDirection },
      uPixelSortThreshold: { value: config.pixelSortThreshold },
      uPixelSortBandWidth: { value: config.pixelSortBandWidth },
      uPixelSortSeparation: { value: config.pixelSortSeparation },
      uPixelSortSensitivity: { value: config.pixelSortSensitivity },
      // Digital Static uniforms
      uStaticDensity: { value: config.staticDensity },
      uStaticWaveSpeed: { value: config.staticWaveSpeed },
      uStaticAnalogNoise: { value: config.staticAnalogNoise },
      uStaticChannelShift: { value: config.staticChannelShift },
      uStaticFlicker: { value: config.staticFlicker },
      // Static Sweep uniforms
      uSweepWidth: { value: config.sweepWidth },
      uSweepLayers: { value: config.sweepLayers },
      uSweepChromaticAberration: { value: config.sweepChromaticAberration },
      uSweepEdgeGlow: { value: config.sweepEdgeGlow },
      uSweepFadeTiming: { value: config.sweepFadeTiming },
      // Glitch Wipe uniforms
      uWipeAngle: { value: config.wipeAngle },
      uWipeAberrationStrength: { value: config.wipeAberrationStrength },
      uWipeEdgeWidth: { value: config.wipeEdgeWidth },
      uWipeColorBleeding: { value: config.wipeColorBleeding },
      uWipeTransitionCurve: { value: config.wipeTransitionCurve },
      // Analog Decay uniforms
      uAnalogGrain: { value: config.analogGrain },
      uAnalogBleeding: { value: config.analogBleeding },
      uAnalogVSync: { value: config.analogVSync },
      uAnalogDropout: { value: 0.0 },
      uAnalogScanlines: { value: config.analogScanlines },
      uAnalogVignette: { value: config.analogVignette },
      uAnalogJitter: { value: config.analogJitter },
      uAnalogChroma: { value: config.analogChroma },
    };
  }

  loadImageTexture(src: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      const loader = new THREE.TextureLoader();
      const timeout = setTimeout(() => reject(new Error("Timeout")), 10000);
      loader.load(
        src,
        (texture) => {
          clearTimeout(timeout);
          texture.minFilter = texture.magFilter = THREE.LinearFilter;
          (texture as any).userData = {
            size: new THREE.Vector2(
              (texture.image as any).width,
              (texture.image as any).height
            ),
          };
          resolve(texture);
        },
        undefined,
        (error) => {
          clearTimeout(timeout);
          reject(error);
        }
      );
    });
  }

  startRenderLoop() {
    const render = () => {
      requestAnimationFrame(render);
      if (this.refs.shaderMaterial) {
        this.refs.shaderMaterial.uniforms.uTime.value =
          (Date.now() - this.refs.startTime) * 0.001;
      }
      if (this.refs.renderer && this.refs.scene && this.refs.camera) {
        this.refs.renderer.render(this.refs.scene, this.refs.camera);
      }
    };
    render();
  }

  handleResize() {
    if (this.refs.renderer && this.refs.shaderMaterial) {
      this.refs.renderer.setSize(window.innerWidth, window.innerHeight);
      this.refs.shaderMaterial.uniforms.uResolution.value.set(
        window.innerWidth,
        window.innerHeight
      );
    }
  }

  updateShaderUniforms(config: GalleryConfig) {
    if (!this.refs.shaderMaterial) return;
    
    const uniforms = this.refs.shaderMaterial.uniforms;
    if (uniforms.uGlobalIntensity) uniforms.uGlobalIntensity.value = config.globalIntensity;
    if (uniforms.uSpeedMultiplier) uniforms.uSpeedMultiplier.value = config.speedMultiplier;
    if (uniforms.uColorShiftAmount) uniforms.uColorShiftAmount.value = config.colorShiftAmount;
    if (uniforms.uDistortionStrength) uniforms.uDistortionStrength.value = config.distortionStrength;
    if (uniforms.uNoiseLevel) uniforms.uNoiseLevel.value = config.noiseLevel;
    
    // Datamosh
    if (uniforms.uDatamoshBlockSize) uniforms.uDatamoshBlockSize.value = config.datamoshBlockSize;
    if (uniforms.uDatamoshCorruptionFreq) uniforms.uDatamoshCorruptionFreq.value = config.datamoshCorruptionFreq;
    if (uniforms.uDatamoshQuantization) uniforms.uDatamoshQuantization.value = config.datamoshQuantization;
    if (uniforms.uDatamoshDisplacement) uniforms.uDatamoshDisplacement.value = config.datamoshDisplacement;
    if (uniforms.uDatamoshTemporal) uniforms.uDatamoshTemporal.value = config.datamoshTemporal;
    
    // Pixel Sort
    if (uniforms.uPixelSortDirection) uniforms.uPixelSortDirection.value = config.pixelSortDirection;
    if (uniforms.uPixelSortThreshold) uniforms.uPixelSortThreshold.value = config.pixelSortThreshold;
    if (uniforms.uPixelSortBandWidth) uniforms.uPixelSortBandWidth.value = config.pixelSortBandWidth;
    if (uniforms.uPixelSortSeparation) uniforms.uPixelSortSeparation.value = config.pixelSortSeparation;
    if (uniforms.uPixelSortSensitivity) uniforms.uPixelSortSensitivity.value = config.pixelSortSensitivity;
    
    // Digital Static
    if (uniforms.uStaticDensity) uniforms.uStaticDensity.value = config.staticDensity;
    if (uniforms.uStaticWaveSpeed) uniforms.uStaticWaveSpeed.value = config.staticWaveSpeed;
    if (uniforms.uStaticAnalogNoise) uniforms.uStaticAnalogNoise.value = config.staticAnalogNoise;
    if (uniforms.uStaticChannelShift) uniforms.uStaticChannelShift.value = config.staticChannelShift;
    if (uniforms.uStaticFlicker) uniforms.uStaticFlicker.value = config.staticFlicker;
    
    // Static Sweep
    if (uniforms.uSweepWidth) uniforms.uSweepWidth.value = config.sweepWidth;
    if (uniforms.uSweepLayers) uniforms.uSweepLayers.value = config.sweepLayers;
    if (uniforms.uSweepChromaticAberration) uniforms.uSweepChromaticAberration.value = config.sweepChromaticAberration;
    if (uniforms.uSweepEdgeGlow) uniforms.uSweepEdgeGlow.value = config.sweepEdgeGlow;
    if (uniforms.uSweepFadeTiming) uniforms.uSweepFadeTiming.value = config.sweepFadeTiming;
    
    // Glitch Wipe
    if (uniforms.uWipeAngle) uniforms.uWipeAngle.value = config.wipeAngle;
    if (uniforms.uWipeAberrationStrength) uniforms.uWipeAberrationStrength.value = config.wipeAberrationStrength;
    if (uniforms.uWipeEdgeWidth) uniforms.uWipeEdgeWidth.value = config.wipeEdgeWidth;
    if (uniforms.uWipeColorBleeding) uniforms.uWipeColorBleeding.value = config.wipeColorBleeding;
    if (uniforms.uWipeTransitionCurve) uniforms.uWipeTransitionCurve.value = config.wipeTransitionCurve;
    
    // Analog Decay
    if (uniforms.uAnalogGrain) uniforms.uAnalogGrain.value = config.analogGrain;
    if (uniforms.uAnalogBleeding) uniforms.uAnalogBleeding.value = config.analogBleeding;
    if (uniforms.uAnalogVSync) uniforms.uAnalogVSync.value = config.analogVSync;
    if (uniforms.uAnalogScanlines) uniforms.uAnalogScanlines.value = config.analogScanlines;
    if (uniforms.uAnalogVignette) uniforms.uAnalogVignette.value = config.analogVignette;
    if (uniforms.uAnalogJitter) uniforms.uAnalogJitter.value = config.analogJitter;
    if (uniforms.uAnalogChroma) uniforms.uAnalogChroma.value = config. analogChroma;
  }

  cleanup() {
    if (this.refs.renderer) {
      this.refs.renderer.dispose();
    }
    this.refs.slideTextures.forEach(texture => texture.dispose());
  }
}
