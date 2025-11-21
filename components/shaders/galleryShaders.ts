/**
 * WebGL Shaders for Gallery Transitions
 * Contains vertex and fragment shaders with 6 glitch effects
 */

export const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fragmentShader = `
  uniform sampler2D uTexture1;
  uniform sampler2D uTexture2;
  uniform float uProgress;
  uniform vec2 uResolution;
  uniform vec2 uTexture1Size;
  uniform vec2 uTexture2Size;
  uniform float uTime;
  uniform int uEffectType;
  
  // Enhanced settings uniforms
  uniform float uGlobalIntensity;
  uniform float uSpeedMultiplier;
  uniform float uColorShiftAmount;
  uniform float uDistortionStrength;
  uniform float uNoiseLevel;
  
  // Datamosh uniforms
  uniform float uDatamoshBlockSize;
  uniform float uDatamoshCorruptionFreq;
  uniform float uDatamoshQuantization;
  uniform float uDatamoshDisplacement;
  uniform float uDatamoshTemporal;
  
  // Pixel Sort uniforms
  uniform float uPixelSortDirection;
  uniform float uPixelSortThreshold;
  uniform float uPixelSortBandWidth;
  uniform float uPixelSortSeparation;
  uniform float uPixelSortSensitivity;
  
  // Digital Static uniforms
  uniform float uStaticDensity;
  uniform float uStaticWaveSpeed;
  uniform float uStaticAnalogNoise;
  uniform float uStaticChannelShift;
  uniform float uStaticFlicker;
  
  // Static Sweep uniforms
  uniform float uSweepWidth;
  uniform float uSweepLayers;
  uniform float uSweepChromaticAberration;
  uniform float uSweepEdgeGlow;
  uniform float uSweepFadeTiming;
  
  // Glitch Wipe uniforms
  uniform float uWipeAngle;
  uniform float uWipeAberrationStrength;
  uniform float uWipeEdgeWidth;
  uniform float uWipeColorBleeding;
  uniform float uWipeTransitionCurve;
  
  // Analog Decay uniforms
  uniform float uAnalogGrain;
  uniform float uAnalogBleeding;
  uniform float uAnalogVSync;
  uniform float uAnalogDropout;
  uniform float uAnalogScanlines;
  uniform float uAnalogVignette;
  uniform float uAnalogJitter;
  uniform float uAnalogChroma;
  
  varying vec2 vUv;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  float random(float x) {
    return fract(sin(x) * 43758.5453123);
  }

  vec2 getCoverUV(vec2 uv, vec2 textureSize) {
    vec2 s = uResolution / textureSize;
    float scale = max(s.x, s.y);
    vec2 scaledSize = textureSize * scale;
    vec2 offset = (uResolution - scaledSize) * 0.5;
    return (uv * uResolution - offset) / scaledSize;
  }

  vec4 sampleTexture(sampler2D tex, vec2 uv, vec2 texSize) {
    vec2 coverUV = getCoverUV(uv, texSize);
    coverUV = clamp(coverUV, 0.0, 1.0);
    return texture2D(tex, coverUV);
  }

  vec4 applyWhiteGlitchOverlay(vec4 color, vec2 uv, float intensity, float effectType) {
    float time = uTime * uSpeedMultiplier * 2.0;
    
    float glitchSize = 1500.0;
    vec2 glitchUV = floor(uv * glitchSize) / glitchSize;
    float glitchRandom = random(glitchUV + floor(time * 12.0));
    
    float whiteGlitch = step(0.98, glitchRandom) * uNoiseLevel;
    
    float fineNoise = random(uv * 3000.0 + time * 0.5);
    float whiteNoise = step(0.995, fineNoise) * uNoiseLevel;
    
    float scanlineGlitch = 0.0;
    float scanY = floor(uv.y * 800.0);
    float scanRandom = random(vec2(scanY, floor(time * 8.0)));
    if (scanRandom > 0.99) {
      float scanlineNoise = random(uv * vec2(2000.0, 1.0) + time);
      scanlineGlitch = step(0.7, scanlineNoise) * 0.3 * uNoiseLevel;
    }
    
    float glitchIntensity = 0.4 * uGlobalIntensity;
    
    float totalWhiteGlitch = (whiteGlitch + whiteNoise + scanlineGlitch) * glitchIntensity * intensity;
    
    vec3 result = color.rgb;
    result = mix(result, vec3(1.0), totalWhiteGlitch * 0.6);
    
    float grain = (random(uv * 2500.0 + time * 0.1) - 0.5) * 0.03 * uNoiseLevel;
    result += vec3(grain) * glitchIntensity * intensity;
    
    return vec4(result, color.a);
  }

  // Enhanced Datamosh Effect
  vec4 datamoshEffect(vec2 uv, float progress) {
    vec4 img1 = sampleTexture(uTexture1, uv, uTexture1Size);
    vec4 img2 = sampleTexture(uTexture2, uv, uTexture2Size);
    
    float time = uTime * uSpeedMultiplier * 2.0 * uDatamoshTemporal;
    
    float corruptionIntensity;
    if (progress < 0.3) {
      corruptionIntensity = smoothstep(0.0, 0.3, progress);
    } else if (progress < 0.7) {
      corruptionIntensity = 1.0;
    } else {
      corruptionIntensity = 1.0 - smoothstep(0.7, 1.0, progress);
    }
    
    vec2 blockSize = vec2(32.0, 24.0) * uDatamoshBlockSize;
    vec2 blockUV = floor(uv * blockSize) / blockSize;
    float blockRand = random(blockUV);
    
    float corruptionThreshold = 1.0 - corruptionIntensity * 1.4 * uDatamoshCorruptionFreq;
    float isCorrupted = step(corruptionThreshold, blockRand) * corruptionIntensity;
    
    vec2 distortion = vec2(
      sin(blockRand * 6.28 + time * 3.0) * 0.075,
      cos(blockRand * 4.71 + time * 2.5) * 0.06
    ) * isCorrupted * uDatamoshDisplacement * uDistortionStrength;
    
    vec4 sourceImg = mix(img2, img1, step(progress, 0.5));
    vec4 corruptedImg;
    if (progress < 0.5) {
      corruptedImg = sampleTexture(uTexture1, uv + distortion, uTexture1Size);
    } else {
      corruptedImg = sampleTexture(uTexture2, uv + distortion, uTexture2Size);
    }
    
    if (isCorrupted > 0.1) {
      float colorCorrupt = random(blockUV.x + time * 0.1) * uColorShiftAmount;
      if (colorCorrupt < 0.3) {
        corruptedImg.rgb = corruptedImg.gbr;
      } else if (colorCorrupt < 0.6) {
        corruptedImg.rgb = corruptedImg.brg;
      }
      
      float quantLevels = 6.0 / uDatamoshQuantization;
      corruptedImg.rgb = floor(corruptedImg.rgb * quantLevels) / quantLevels;
    }
    
    vec4 result = mix(sourceImg, corruptedImg, isCorrupted);
    
    float finalBlend = smoothstep(0.0, 1.0, progress);
    if (corruptionIntensity < 0.1) {
      result = mix(img1, img2, finalBlend);
    }
    
    result = applyWhiteGlitchOverlay(result, uv, corruptionIntensity * 0.8 * uGlobalIntensity, 0.0);
    
    return result;
  }

  // Enhanced Pixel Sort Effect
  vec4 pixelSortEffect(vec2 uv, float progress) {
    vec4 img1 = sampleTexture(uTexture1, uv, uTexture1Size);
    vec4 img2 = sampleTexture(uTexture2, uv, uTexture2Size);
    
    float time = uTime * uSpeedMultiplier * 1.5;
    
    float sortIntensity;
    if (progress < 0.2) {
      sortIntensity = smoothstep(0.0, 0.2, progress);
    } else if (progress < 0.8) {
      sortIntensity = 1.0;
    } else {
      sortIntensity = 1.0 - smoothstep(0.8, 1.0, progress);
    }
    
    float bandHeight = 0.08 * uPixelSortBandWidth;
    float bandIndex = floor(uv.y / bandHeight);
    float bandRandom = random(bandIndex + floor(time * 0.5));
    
    float sortThreshold = 1.0 - sortIntensity * uPixelSortThreshold;
    float shouldSort = step(sortThreshold, bandRandom);
    
    float imageMorphProgress = smoothstep(0.0, 1.0, progress);
    vec4 baseImg = mix(img1, img2, imageMorphProgress);
    
    vec2 sortedUV = uv;
    vec4 result = baseImg;
    
    if (shouldSort > 0.5 && sortIntensity > 0.1) {
      vec4 sortingSample1 = sampleTexture(uTexture1, uv, uTexture1Size);
      vec4 sortingSample2 = sampleTexture(uTexture2, uv, uTexture2Size);
      vec4 sortingSample = mix(sortingSample1, sortingSample2, imageMorphProgress);
      
      float brightness = dot(sortingSample.rgb, vec3(0.299, 0.587, 0.114)) * uPixelSortSensitivity;
      
      float sortDirection = mix(-1.0, 1.0, uPixelSortDirection);
      float sortOffset = (brightness - 0.5) * 0.25 * sortIntensity * sortDirection * uDistortionStrength;
      sortOffset += sin(uv.y * 15.0 + time * 2.0) * 0.08 * sortIntensity;
      
      sortedUV.x += sortOffset;
      
      vec4 sortedImg1 = sampleTexture(uTexture1, sortedUV, uTexture1Size);
      vec4 sortedImg2 = sampleTexture(uTexture2, sortedUV, uTexture2Size);
      vec4 sortedImg = mix(sortedImg1, sortedImg2, imageMorphProgress);
      
      float separation = 0.015 * sortIntensity * uPixelSortSeparation;
      
      vec4 sample1_r = sampleTexture(uTexture1, sortedUV + vec2(separation, 0.0), uTexture1Size);
      vec4 sample2_r = sampleTexture(uTexture2, sortedUV + vec2(separation, 0.0), uTexture2Size);
      float r = mix(sample1_r.r, sample2_r.r, imageMorphProgress);
      
      vec4 sample1_g = sampleTexture(uTexture1, sortedUV, uTexture1Size);
      vec4 sample2_g = sampleTexture(uTexture2, sortedUV, uTexture2Size);
      float g = mix(sample1_g.g, sample2_g.g, imageMorphProgress);
      
      vec4 sample1_b = sampleTexture(uTexture1, sortedUV - vec2(separation, 0.0), uTexture1Size);
      vec4 sample2_b = sampleTexture(uTexture2, sortedUV - vec2(separation, 0.0), uTexture2Size);
      float b = mix(sample1_b.b, sample2_b.b, imageMorphProgress);
      
      sortedImg = vec4(r, g, b, 1.0);
      
      result = sortedImg;
    }
    
    if (sortIntensity < 0.1) {
      result = mix(img1, img2, imageMorphProgress);
    }
    
    result = applyWhiteGlitchOverlay(result, uv, sortIntensity * 0.6 * uGlobalIntensity, 1.0);
    
    return result;
  }

  // Enhanced Digital Static Effect
  vec4 digitalStaticEffect(vec2 uv, float progress) {
    vec4 img1 = sampleTexture(uTexture1, uv, uTexture1Size);
    vec4 img2 = sampleTexture(uTexture2, uv, uTexture2Size);
    
    float time = uTime * uSpeedMultiplier * 3.0 * uStaticWaveSpeed;
    
    float wavePos = progress * 1.4 - 0.2;
    float waveWidth = 0.3;
    float distanceFromWave = abs(uv.y - wavePos);
    float staticIntensity = 1.0 - smoothstep(0.0, waveWidth, distanceFromWave);
    
    float noise = random(uv * uResolution.xy + time * 0.1) * uStaticDensity;
    float staticMask = step(0.3, noise) * staticIntensity;
    
    float analogNoise = random(uv * 500.0 + time * 0.05) - 0.5;
    analogNoise *= staticIntensity * uStaticAnalogNoise;
    
    vec4 staticImg = img2;
    if (staticIntensity > 0.1) {
      staticImg.rgb = mix(staticImg.rgb, vec3(noise), staticMask * 0.8);
      staticImg.rgb += analogNoise * 0.3;
      
      float shift = sin(time + uv.y * 10.0) * 0.02 * staticIntensity * uStaticChannelShift;
      float r = sampleTexture(uTexture2, uv + vec2(shift, 0.0), uTexture2Size).r;
      float g = sampleTexture(uTexture2, uv, uTexture2Size).g;
      float b = sampleTexture(uTexture2, uv - vec2(shift, 0.0), uTexture2Size).b;
      staticImg = vec4(r, g, b, 1.0);
      
      // Gradually fade flicker based on wave position and intensity
      float flickerFade = staticIntensity * smoothstep(0.8, 0.2, progress);
      float flicker = sin(time * 30.0) * 0.1 * uStaticFlicker * flickerFade;
      staticImg.rgb *= (1.0 + flicker);
    }
    
    float reveal = step(uv.y, wavePos + waveWidth * 0.5);
    vec4 result = mix(img1, staticImg, reveal);
    
    result = applyWhiteGlitchOverlay(result, uv, staticIntensity * uGlobalIntensity, 2.0);
    
    return result;
  }

  // Enhanced Static Sweep Effect
  vec4 staticSweepEffect(vec2 uv, float progress) {
    vec4 img1 = sampleTexture(uTexture1, uv, uTexture1Size);
    vec4 img2 = sampleTexture(uTexture2, uv, uTexture2Size);
    
    if (progress < 0.01 || progress > 0.99) {
      return mix(img1, img2, smoothstep(0.0, 1.0, progress));
    }
    
    float time = uTime * uSpeedMultiplier * 2.5;
    
    float sweepPos = progress * 1.4 - 0.2;
    float isRevealed = step(uv.x, sweepPos);
    
    float distanceFromSweep = abs(uv.x - sweepPos);
    float effectZoneWidth = 0.25 * uSweepWidth;
    
    float adjustedProgress = pow(progress, uSweepFadeTiming);
    
    float masterIntensity;
    if (adjustedProgress < 0.15) {
      masterIntensity = smoothstep(0.0, 0.15, adjustedProgress) * 0.4;
    } else if (adjustedProgress < 0.35) {
      masterIntensity = 0.4 + smoothstep(0.15, 0.35, adjustedProgress) * 0.5;
    } else if (adjustedProgress < 0.65) {
      masterIntensity = 0.9 + sin(adjustedProgress * 20.0) * 0.1 * uSweepLayers;
    } else if (adjustedProgress < 0.85) {
      masterIntensity = 0.9 - smoothstep(0.65, 0.85, adjustedProgress) * 0.6;
    } else {
      masterIntensity = 0.3 - smoothstep(0.85, 1.0, adjustedProgress) * 0.25;
    }
    
    float baseEffectStrength = (1.0 - smoothstep(0.0, effectZoneWidth, distanceFromSweep)) * masterIntensity * uGlobalIntensity;
    
    float staticNoise1 = random(uv * 120.0 * uSweepLayers + time * 0.8);
    float staticNoise2 = random(uv * 200.0 + time * 1.3);
    float staticNoise3 = random(uv * 80.0 + time * 0.5);
    float combinedStatic = mix(mix(staticNoise1, staticNoise2, 0.6), staticNoise3, 0.3);
    
    float staticMask = step(0.3, combinedStatic) * baseEffectStrength;
    
    float analogNoise = (random(uv * 300.0 + time * 0.1) - 0.5) * 2.0;
    analogNoise *= random(vec2(time * 0.02)) * baseEffectStrength;
    
    float rgbSeparationAmount = 0.04 * baseEffectStrength * uSweepChromaticAberration;
    float rgbTimeOffset = time * 3.0 + uv.y * 12.0;
    
    vec2 rgbOffset1 = vec2(sin(rgbTimeOffset) * rgbSeparationAmount, 0.0);
    vec2 rgbOffset2 = vec2(-sin(rgbTimeOffset * 1.3) * rgbSeparationAmount * 0.7, 0.0);
    vec2 rgbOffset3 = vec2(cos(rgbTimeOffset * 0.8) * rgbSeparationAmount * 0.5, 0.0);
    
    vec4 currentImg = mix(img1, img2, isRevealed);
    
    if (baseEffectStrength > 0.05) {
      float r, g, b;
      
      if (isRevealed > 0.5) {
        r = sampleTexture(uTexture2, uv + rgbOffset1, uTexture2Size).r;
        g = sampleTexture(uTexture2, uv + rgbOffset2, uTexture2Size).g;
        b = sampleTexture(uTexture2, uv + rgbOffset3, uTexture2Size).b;
      } else {
        r = sampleTexture(uTexture1, uv + rgbOffset1, uTexture1Size).r;
        g = sampleTexture(uTexture1, uv + rgbOffset2, uTexture1Size).g;
        b = sampleTexture(uTexture1, uv + rgbOffset3, uTexture1Size).b;
      }
      
      vec4 glitchedImg = vec4(r, g, b, 1.0);
      
      glitchedImg.rgb = mix(glitchedImg.rgb, vec3(combinedStatic), staticMask * 0.7);
      glitchedImg.rgb += vec3(analogNoise) * 0.25;
      
      float edgeGlow = 1.0 - smoothstep(0.0, 0.02, distanceFromSweep);
      glitchedImg.rgb += vec3(0.8, 0.4, 1.0) * edgeGlow * 0.5 * masterIntensity * uSweepEdgeGlow;
      
      currentImg = mix(currentImg, glitchedImg, baseEffectStrength);
    }
    
    currentImg = applyWhiteGlitchOverlay(currentImg, uv, masterIntensity * 1.2 * uGlobalIntensity, 3.0);
    
    return currentImg;
  }

  // Enhanced Glitch Wipe Effect
  vec4 glitchWipeEffect(vec2 uv, float progress) {
    vec4 img1 = sampleTexture(uTexture1, uv, uTexture1Size);
    vec4 img2 = sampleTexture(uTexture2, uv, uTexture2Size);
    
    if (progress < 0.01 || progress > 0.99) {
      return mix(img1, img2, smoothstep(0.0, 1.0, progress));
    }
    
    float time = uTime * uSpeedMultiplier * 2.0;
    
    vec2 wipeUV = uv;
    float angleRad = radians(uWipeAngle);
    mat2 rotation = mat2(cos(angleRad), -sin(angleRad), sin(angleRad), cos(angleRad));
    wipeUV = rotation * (wipeUV - 0.5) + 0.5;
    
    float curvedProgress = pow(progress, uWipeTransitionCurve);
    
    float wipePos = curvedProgress * 1.2 - 0.1;
    float wipeEdge = wipePos + sin(wipeUV.y * 20.0 + time) * 0.02;
    float isRevealed = step(wipeUV.x, wipeEdge);
    
    float distanceFromWipe = abs(wipeUV.x - wipeEdge);
    
    float caIntensity;
    if (curvedProgress < 0.2) {
      caIntensity = smoothstep(0.0, 0.2, curvedProgress);
    } else if (curvedProgress < 0.75) {
      caIntensity = 1.0;
    } else {
      caIntensity = 1.0 - smoothstep(0.75, 0.95, curvedProgress);
    }
    
    float caZone = (1.0 - smoothstep(0.0, 0.12 * uWipeEdgeWidth, distanceFromWipe)) * caIntensity * uGlobalIntensity;
    
    vec4 currentImg = mix(img1, img2, isRevealed);
    
    if (caZone > 0.05) {
      float baseShift = sin(time * 3.0 + wipeUV.y * 15.0) * 0.035 * caZone * uWipeAberrationStrength;
      float secondaryShift = cos(time * 2.0 + wipeUV.x * 10.0) * 0.02 * caZone;
      
      float totalShift = baseShift + secondaryShift;
      
      float bleeding = uWipeColorBleeding;
      
      float r, g, b;
      if (isRevealed > 0.5) {
        r = sampleTexture(uTexture2, uv + vec2(totalShift * 2.5 * bleeding, totalShift * 0.5), uTexture2Size).r;
        g = sampleTexture(uTexture2, uv + vec2(totalShift * 0.5, -totalShift * 0.3), uTexture2Size).g;
        b = sampleTexture(uTexture2, uv - vec2(totalShift * 2.0 * bleeding, totalShift * 0.7), uTexture2Size).b;
      } else {
        r = sampleTexture(uTexture1, uv + vec2(totalShift * 2.5 * bleeding, totalShift * 0.5), uTexture1Size).r;
        g = sampleTexture(uTexture1, uv + vec2(totalShift * 0.5, -totalShift * 0.3), uTexture1Size).g;
        b = sampleTexture(uTexture1, uv - vec2(totalShift * 2.0 * bleeding, totalShift * 0.7), uTexture1Size).b;
      }
      
      vec4 chromaticImg = vec4(r, g, b, 1.0);
      
      float edgeGlow = 1.0 - smoothstep(0.0, 0.015, distanceFromWipe);
      chromaticImg.rgb += vec3(1.0, 0.6, 0.9) * edgeGlow * 0.4 * caIntensity;
      
      float digitalNoise = random(uv * 200.0 + time * 0.1) * uNoiseLevel;
      chromaticImg.rgb += vec3(digitalNoise - 0.5) * 0.1 * caZone;
      
      currentImg = mix(currentImg, chromaticImg, caZone);
    }
    
    currentImg = applyWhiteGlitchOverlay(currentImg, uv, caIntensity * 0.9 * uGlobalIntensity, 4.0);
    
    return currentImg;
  }

  // Analog Decay Effect
  vec4 analogDecayEffect(vec2 uv, float progress) {
    vec4 img1 = sampleTexture(uTexture1, uv, uTexture1Size);
    vec4 img2 = sampleTexture(uTexture2, uv, uTexture2Size);
    
    float time = uTime * uSpeedMultiplier * 1.8;
    
    // Basic image transition
    float transitionMask = smoothstep(0.4, 0.6, progress + sin(uv.y * 8.0 + time) * 0.1);
    vec4 baseImg = mix(img1, img2, transitionMask);
    
    // Analog Jitter - temporal instability
    vec2 jitteredUV = uv;
    if (uAnalogJitter > 0.1) {
      float jitterAmount = (random(vec2(floor(time * 60.0))) - 0.5) * 0.003 * uAnalogJitter;
      jitteredUV.x += jitterAmount;
      jitteredUV.y += (random(vec2(floor(time * 30.0) + 1.0)) - 0.5) * 0.001 * uAnalogJitter;
    }
    
    // VHS-style vertical sync roll
    if (uAnalogVSync > 0.1) {
      float vsyncRoll = sin(time * 2.0 + uv.y * 100.0) * 0.02 * uAnalogVSync;
      float vsyncChance = step(0.95, random(vec2(floor(time * 4.0))));
      jitteredUV.y += vsyncRoll * vsyncChance;
    }
    
    vec4 currentImg = mix(baseImg, mix(
      sampleTexture(uTexture1, jitteredUV, uTexture1Size),
      sampleTexture(uTexture2, jitteredUV, uTexture2Size),
      transitionMask
    ), 0.8);
    
    // Film grain
    if (uAnalogGrain > 0.1) {
      float grain = (random(uv * 1500.0 + time * 0.1) - 0.5) * 0.15 * uAnalogGrain;
      currentImg.rgb += vec3(grain);
    }
    
    // Color bleeding/channel separation
    if (uAnalogBleeding > 0.1) {
      float bleedAmount = 0.008 * uAnalogBleeding;
      float offsetPhase = time * 1.5 + uv.y * 20.0;
      
      vec2 redOffset = vec2(sin(offsetPhase) * bleedAmount, 0.0);
      vec2 blueOffset = vec2(-sin(offsetPhase * 1.1) * bleedAmount * 0.8, 0.0);
      
      float r = mix(
        sampleTexture(uTexture1, jitteredUV + redOffset, uTexture1Size).r,
        sampleTexture(uTexture2, jitteredUV + redOffset, uTexture2Size).r,
        transitionMask
      );
      float g = currentImg.g;
      float b = mix(
        sampleTexture(uTexture1, jitteredUV + blueOffset, uTexture1Size).b,
        sampleTexture(uTexture2, jitteredUV + blueOffset, uTexture2Size).b,
        transitionMask
      );
      
      currentImg = vec4(r, g, b, 1.0);
    }
    
    // Scanlines
    if (uAnalogScanlines > 0.1) {
      float scanlinePattern = sin(uv.y * 800.0) * 0.5 + 0.5;
      float scanlineIntensity = 0.05 * uAnalogScanlines;
      currentImg.rgb *= (1.0 - scanlinePattern * scanlineIntensity);
    }
    
    // Random dropouts (signal loss areas)
    if (uAnalogDropout > 0.1) {
      float dropoutSize = 100.0;
      vec2 dropoutUV = floor(uv * dropoutSize) / dropoutSize;
      float dropoutRandom = random(dropoutUV + floor(time * 8.0));
      
      float dropoutThreshold = 1.0 - uAnalogDropout * 0.02;
      float isDropout = step(dropoutThreshold, dropoutRandom);
      
      if (isDropout > 0.5) {
        float dropoutNoise = random(uv * 500.0 + time);
        currentImg.rgb = mix(currentImg.rgb, vec3(dropoutNoise * 0.3), 0.8);
      }
    }
    
    // Chromatic aberration
    if (uAnalogChroma > 0.1) {
      float chromaAmount = 0.01 * uAnalogChroma;
      float chromaPhase = time * 0.5 + uv.x * 5.0;
      
      vec2 chromaOffset = vec2(cos(chromaPhase) * chromaAmount, sin(chromaPhase) * chromaAmount * 0.5);
      
      float r = mix(
        sampleTexture(uTexture1, jitteredUV + chromaOffset, uTexture1Size).r,
        sampleTexture(uTexture2, jitteredUV + chromaOffset, uTexture2Size).r,
        transitionMask
      );
      float g = currentImg.g;
      float b = mix(
        sampleTexture(uTexture1, jitteredUV - chromaOffset, uTexture1Size).b,
        sampleTexture(uTexture2, jitteredUV - chromaOffset, uTexture2Size).b,
        transitionMask
      );
      
      currentImg = vec4(r, g, b, 1.0);
    }
    
    // Vignetting
    if (uAnalogVignette > 0.1) {
      vec2 vignetteUV = (uv - 0.5) * 2.0;
      float vignette = 1.0 - dot(vignetteUV, vignetteUV) * 0.3 * uAnalogVignette;
      currentImg.rgb *= vignette;
    }
    
    // Final analog-style overlay
    currentImg = applyWhiteGlitchOverlay(currentImg, uv, 0.3 * uGlobalIntensity, 5.0);
    
    return currentImg;
  }

  void main() {
    if (uEffectType == 0) {
      gl_FragColor = datamoshEffect(vUv, uProgress);
    } else if (uEffectType == 1) {
      gl_FragColor = pixelSortEffect(vUv, uProgress);
    } else if (uEffectType == 2) {
      gl_FragColor = digitalStaticEffect(vUv, uProgress);
    } else if (uEffectType == 3) {
      gl_FragColor = staticSweepEffect(vUv, uProgress);
    } else if (uEffectType == 4) {
      gl_FragColor = glitchWipeEffect(vUv, uProgress);
    } else {
      gl_FragColor = analogDecayEffect(vUv, uProgress);
    }
  }
`;

export function getEffectIndex(effectName: string): number {
  const effectMap: Record<string, number> = {
    datamosh: 0,
    pixelSort: 1,
    digitalStatic: 2,
    staticSweep: 3,
    glitchWipe: 4,
    analogDecay: 5,
  };
  return effectMap[effectName] || 0;
}
