# WebGL Background Analysis and Design Strategy — Three.js Fluid Neon Particles

This document provides a detailed investigation and implementation strategy for the WebGL abstract background canvas using Three.js for the EcoSplit AI landing page.

---

## 1. Architectural Overview

The WebGL background system is designed as a self-contained, low-overhead visual overlay that sits fixed in the background of the landing page. It operates behind all content, reacting organically to user actions (mouse movement and page scrolling).

```
+-------------------------------------------------------------+
| Next.js Page / Layout (globals.css, dark background)        |
|  +-------------------------------------------------------+  |
|  | WebGLBackground.tsx Component (fixed, z-index: -1)     |  |
|  |  +-------------------------------------------------+  |  |
|  |  | <canvas ref={canvasRef}>                        |  |  |
|  |  |  +-------------------------------------------+  |  |  |
|  |  |  | WebGLManager Class (Three.js Lifecycle)   |  |  |  |
|  |  |  | - useWebGL.ts custom hook instantiation   |  |  |  |
|  |  |  | - Custom GLSL Shaders (Simplex Noise)     |  |  |  |
|  |  |  | - Eased mouse & scroll tracking           |  |  |  |
|  |  |  +-------------------------------------------+  |  |  |
|  |  +-------------------------------------------------+  |  |
|  +-------------------------------------------------------+  |
+-------------------------------------------------------------+
```

To bridge Next.js's React state lifecycle with Three.js's imperative rendering loop, we separate the logic into:
1. **`src/hooks/useWebGL.ts`**: A custom React hook that manages the lifecycle of a `WebGLManager` class instance.
2. **`WebGLManager` Class**: An imperative TypeScript class encapsulating the Three.js scene, camera, renderer, custom shader particles, and event bindings.
3. **`src/components/WebGLBackground.tsx`**: A client-side React component that mounts a canvas element, overlays it fixed in the background, and integrates the hook.

---

## 2. Dependencies and Setup

To support this implementation, the following npm packages must be added:
- `three`: Core 3D library.
- `@types/three`: TypeScript typings (installed as a devDependency).

```bash
npm install three
npm install -D @types/three
```

---

## 3. WebGL Manager and React Hook (`src/hooks/useWebGL.ts`)

### Code Design for `WebGLManager`

```typescript
import * as THREE from 'three';

export interface WebGLConfig {
  particleCount?: number;
  colorGreen?: string; // Hex format e.g. '#10b981'
  colorCyan?: string;  // Hex format e.g. '#06b6d4'
  themeMode?: 'light' | 'dark';
}

export class WebGLManager {
  private canvas: HTMLCanvasElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  
  // Particle System
  private particlesGeometry!: THREE.BufferGeometry;
  private particlesMaterial!: THREE.ShaderMaterial;
  private particles!: THREE.Points;
  
  // Animation Frame and Time
  private animationFrameId: number | null = null;
  private clock: THREE.Clock;
  
  // Interactive States
  private mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  private scroll = { current: 0, target: 0 };
  
  // Configuration
  private config: Required<WebGLConfig>;

  constructor(canvas: HTMLCanvasElement, config?: WebGLConfig) {
    this.canvas = canvas;
    this.clock = new THREE.Clock();
    
    this.config = {
      particleCount: config?.particleCount ?? 8000,
      colorGreen: config?.colorGreen ?? '#10b981',
      colorCyan: config?.colorCyan ?? '#06b6d4',
      themeMode: config?.themeMode ?? 'dark',
    };

    this.initThree();
    this.initParticles();
    this.bindEvents();
    this.startLoop();
  }

  private initThree() {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    // 1. Renderer Setup
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(width, height, false);
    
    // Performance optimization: Cap pixel ratio at 2.0 to avoid fill-rate bottlenecks on Retina screens
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 2. Scene Setup
    this.scene = new THREE.Scene();

    // 3. Camera Setup
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    this.camera.position.z = 8;
  }

  private initParticles() {
    const count = this.config.particleCount;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const randoms = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Box distribution spanning across view bounds
      positions[i * 3 + 0] = (Math.random() - 0.5) * 25; // X
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20; // Y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12; // Z

      // Random initial sizes
      sizes[i] = Math.random() * 2.5 + 0.5;

      // Unique coefficients to diversify noise movement per-particle
      randoms[i * 3 + 0] = Math.random();
      randoms[i * 3 + 1] = Math.random();
      randoms[i * 3 + 2] = Math.random();
    }

    this.particlesGeometry = new THREE.BufferGeometry();
    this.particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.particlesGeometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    this.particlesGeometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 3));

    // Colors mapped to float arrays
    const isDark = this.config.themeMode === 'dark';
    const cGreen = new THREE.Color(isDark ? this.config.colorGreen : '#047857');
    const cCyan = new THREE.Color(isDark ? this.config.colorCyan : '#0284c7');

    // Custom Shader Material for fluid neon simulation
    this.particlesMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending, // Additive for dark mode, normal blend for light mode
      uniforms: {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uResolution: { value: new THREE.Vector2(width, height) },
        uColorGreen: { value: new THREE.Vector3(cGreen.r, cGreen.g, cGreen.b) },
        uColorCyan: { value: new THREE.Vector3(cCyan.r, cCyan.g, cCyan.b) },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uScroll;
        uniform vec2 uMouse;
        attribute float aSize;
        attribute vec3 aRandom;
        varying vec3 vPosition;
        varying float vNoise;

        // Classic 3D Noise by Stefan Gustavson
        vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

        float snoise(vec3 v){
          const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
          const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

          vec3 i  = floor(v + dot(v, C.yyy) );
          vec3 x0 =   v - i + dot(i, C.xxx) ;

          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min( g.xyz, l.zxy );
          vec3 i2 = max( g.xyz, l.zxy );

          vec3 x1 = x0 - i1 + 1.0 * C.xxx;
          vec3 x2 = x0 - i2 + 2.0 * C.xxx;
          vec3 x3 = x0 - D.yyy;

          i = mod(i, 289.0 );
          vec4 p = permute( permute( permute(
                     i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                   + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                   + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

          float n_ = 0.142857142857; // 1.0/7.0
          vec3  ns = n_ * D.wyz - D.xzx;

          vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_ );

          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);

          vec4 b0 = vec4( x.xy, y.xy );
          vec4 b1 = vec4( x.zw, y.zw );

          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));

          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

          vec3 p0 = vec3(a0.xy,h.x);
          vec3 p1 = vec3(a0.zw,h.y);
          vec3 p2 = vec3(a1.xy,h.z);
          vec3 p3 = vec3(a1.zw,h.w);

          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;

          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                        dot(p2,x2), dot(p3,x3) ) );
        }

        void main() {
          vec3 pos = position;

          // 1. Organic Fluid Turbulence using Simplex Noise
          vec3 noiseInput = pos * 0.15 + vec3(0.0, uTime * 0.1, 0.0) + aRandom * 5.0;
          float noiseVal = snoise(noiseInput);
          vNoise = noiseVal;

          pos.x += noiseVal * 1.2 * aRandom.x;
          pos.y += noiseVal * 1.2 * aRandom.y;
          pos.z += noiseVal * 0.8 * aRandom.z;

          // 2. Vertical displacement driven by smooth page scroll
          pos.y -= uScroll * 1.5;

          // 3. Mouse repulsion physics in world coordinates
          // Map mouse to estimated screen plane coordinates
          vec3 mouseWorld = vec3(uMouse.x * 12.0, uMouse.y * 8.0, 0.0);
          float distToMouse = distance(pos.xy, mouseWorld.xy);
          if (distToMouse < 4.0) {
            float force = (1.0 - (distToMouse / 4.0)) * 2.0;
            vec2 repelDir = normalize(pos.xy - mouseWorld.xy);
            pos.xy += repelDir * force * aRandom.xy;
          }

          vPosition = pos;

          // Perspective scaling (Point Size Attenuation)
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = aSize * (350.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColorGreen;
        uniform vec3 uColorCyan;
        varying vec3 vPosition;
        varying float vNoise;

        void main() {
          // Force point to be drawn as a perfect circle
          float dist = distance(gl_PointCoord, vec2(0.5));
          if (dist > 0.5) discard;

          // Radial glow gradient: high intensity in center, soft glow outwards
          float glow = 1.0 - (dist * 2.0);
          glow = pow(glow, 2.0);

          // Color blend based on localized noise value
          float colorBlend = vNoise * 0.5 + 0.5;
          vec3 baseColor = mix(uColorGreen, uColorCyan, colorBlend);

          // Neon brightness booster (additive center glow)
          vec3 finalColor = baseColor + vec3(0.4, 0.4, 0.4) * glow;

          gl_FragColor = vec4(finalColor, glow * 0.7);
        }
      `,
    });

    this.particles = new THREE.Points(this.particlesGeometry, this.particlesMaterial);
    this.scene.add(this.particles);
  }

  private bindEvents() {
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('mousemove', this.handleMouseMove);
    
    // Performance optimization: WebGL Context Loss Handlers
    this.canvas.addEventListener('webglcontextlost', this.handleContextLost, false);
    this.canvas.addEventListener('webglcontextrestored', this.handleContextRestored, false);
  }

  private unbindEvents() {
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('webglcontextlost', this.handleContextLost);
    this.canvas.removeEventListener('webglcontextrestored', this.handleContextRestored);
  }

  private handleResize = () => {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height, false);
    this.particlesMaterial.uniforms.uResolution.value.set(width, height);
  };

  private handleMouseMove = (event: MouseEvent) => {
    // Map mouse position to [-1, 1] range
    this.mouse.targetX = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.targetY = -(event.clientY / window.innerHeight) * 2 + 1;
  };

  private handleContextLost = (event: Event) => {
    event.preventDefault();
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    console.warn('WebGL Context Lost.');
  };

  private handleContextRestored = () => {
    console.log('WebGL Context Restored.');
    this.renderer.dispose();
    this.initThree();
    this.initParticles();
    this.startLoop();
  };

  private startLoop() {
    const tick = () => {
      const elapsedTime = this.clock.getElapsedTime();

      // 1. Smoothly ease mouse coordinates (LERP)
      this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.08;
      this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.08;

      // 2. Smoothly ease scroll value (LERP)
      // Grabbing window scroll position inside the requestAnimationFrame loop is
      // significantly more performant than adding a scroll event listener.
      if (typeof window !== 'undefined') {
        const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight || 1);
        this.scroll.target = scrollPercent;
      }
      this.scroll.current += (this.scroll.target - this.scroll.current) * 0.06;

      // 3. Update Uniforms
      this.particlesMaterial.uniforms.uTime.value = elapsedTime;
      this.particlesMaterial.uniforms.uMouse.value.set(this.mouse.x, this.mouse.y);
      this.particlesMaterial.uniforms.uScroll.value = this.scroll.current;

      // 4. Subtle overall scene rotation
      this.particles.rotation.y = elapsedTime * 0.02;
      this.particles.rotation.x = this.scroll.current * 0.3;

      // Render
      this.renderer.render(this.scene, this.camera);

      // Loop
      this.animationFrameId = requestAnimationFrame(tick);
    };

    this.animationFrameId = requestAnimationFrame(tick);
  }

  public setThemeMode(themeMode: 'light' | 'dark') {
    this.config.themeMode = themeMode;
    const isDark = themeMode === 'dark';
    
    // Choose appropriate colors for light vs dark mode
    const cGreen = new THREE.Color(isDark ? this.config.colorGreen : '#047857');
    const cCyan = new THREE.Color(isDark ? this.config.colorCyan : '#0284c7');
    
    this.particlesMaterial.uniforms.uColorGreen.value.set(cGreen.r, cGreen.g, cGreen.b);
    this.particlesMaterial.uniforms.uColorCyan.value.set(cCyan.r, cCyan.g, cCyan.b);
    
    // Toggle blending mode for optimal visibility
    this.particlesMaterial.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
    this.particlesMaterial.needsUpdate = true;
  }

  public dispose() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    this.unbindEvents();

    // Explicit GPU Memory Cleanup
    if (this.particlesGeometry) {
      this.particlesGeometry.dispose();
    }
    if (this.particlesMaterial) {
      this.particlesMaterial.dispose();
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
    
    console.log('WebGLManager successfully disposed.');
  }
}
```

### React Custom Hook Implementation (`src/hooks/useWebGL.ts`)

```typescript
import { useEffect, useRef } from 'react';
import { WebGLManager, WebGLConfig } from './useWebGL'; // Assuming helper class is inline or separate in same folder

export function useWebGL(themeMode: 'light' | 'dark' = 'dark', config?: WebGLConfig) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const managerRef = useRef<WebGLManager | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Instantiate manager on mounting
    const manager = new WebGLManager(canvas, { ...config, themeMode });
    managerRef.current = manager;

    // Clean up on component unmount
    return () => {
      manager.dispose();
      managerRef.current = null;
    };
  }, [config]); // We recreate the manager only if config changes

  // Update theme mode when it changes without destroying the scene
  useEffect(() => {
    if (managerRef.current) {
      managerRef.current.setThemeMode(themeMode);
    }
  }, [themeMode]);

  return canvasRef;
}
```

---

## 4. WebGL Background Component (`src/components/WebGLBackground.tsx`)

This component mounts the canvas element and applies CSS fixed positioning so that it overlays underneath all sections.

### Dynamic Import Strategy (SSR Safe)
Since WebGL and Three.js require access to client APIs (`window`, `navigator`, `HTMLCanvasElement`), rendering this component on the server during Next.js build time will fail. A `"use client"` directive is required. 

To prevent hydration issues and speed up the page, the component should be imported dynamically inside `src/app/page.tsx` with SSR disabled:

```typescript
import dynamic from 'next/dynamic';

const WebGLBackground = dynamic(() => import('@/components/WebGLBackground'), {
  ssr: false,
});
```

### Component Code Design

```tsx
'use client';

import React from 'react';
import { useWebGL } from '@/hooks/useWebGL';

interface WebGLBackgroundProps {
  themeMode?: 'light' | 'dark';
  particleCount?: number;
  colorGreen?: string;
  colorCyan?: string;
}

export default function WebGLBackground({
  themeMode = 'dark',
  particleCount = 7000,
  colorGreen = '#10b981',
  colorCyan = '#06b6d4',
}: WebGLBackgroundProps) {
  const canvasRef = useWebGL(themeMode, {
    particleCount,
    colorGreen,
    colorCyan,
  });

  return (
    <div className={`webgl-background-container ${themeMode}`}>
      <canvas ref={canvasRef} className="webgl-background-canvas" />
    </div>
  );
}
```

### CSS Styling Proposal (to be added to `globals.css` or scoped CSS modules)
```css
.webgl-background-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -2; /* Ensure it stays behind glassmorphic layout and all elements */
  pointer-events: none; /* Let all mouse/scroll events fall through to interactive sections */
  transition: background-color 0.5s ease;
  overflow: hidden;
}

.webgl-background-container.dark {
  background-color: #030712; /* Deep dark fallback slate-950 */
}

.webgl-background-container.light {
  background-color: #f9fafb; /* Slate-50 fallback for light mode */
}

.webgl-background-canvas {
  display: block;
  width: 100%;
  height: 100%;
}
```

---

## 5. Key Performance Optimizations

1. **Pixel Ratio Clamping**: Capping `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` prevents mobile retina screens or high-res 4K screens from rendering at 3x or 4x, which leads to heavy GPU fill-rate throttling.
2. **BufferGeometry & Attributes**: Storing custom sizes (`aSize`) and noise randomizers (`aRandom`) directly in Float32 arrays bound as WebGL attributes allows the GPU to compute positions and vertex movement concurrently instead of sending data from CPU to GPU on every frame.
3. **No Scroll Event Listeners**: We extract scroll percentage (`window.scrollY`) directly in the `requestAnimationFrame` loop. This avoids the overhead of triggering scroll listeners, which can thrash the main thread and degrade rendering performance.
4. **Additive Blending & Depth Disabling**: Specifying `depthWrite: false` prevents Three.js from checking the z-buffer depth and sorting particles. Additive blending (`THREE.AdditiveBlending`) yields a beautiful electric neon glow while rendering with very low overhead.
5. **No Textures (Procedural Shapes)**: Drawing particles as circular glows directly inside the fragment shader via `distance(gl_PointCoord, vec2(0.5))` avoids loading external image textures, saving bandwidth and GPU memory.
6. **Graceful Cleanup (Disposal)**: Calling `.dispose()` on geometries, materials, and renderer, alongside event listener removal and `cancelAnimationFrame()`, guarantees zero memory leaks upon SPA route transitions.
7. **WebGL Context Loss Handler**: Prevents crashes or blank canvas issues if the system goes to sleep or memory is reclaimed.

---

## 6. Verification and Testing Plan

To ensure the system works as intended, the E2E and visual tests should verify:
1. **WebGL Canvas Mounts**: The DOM contains the `<canvas>` element with class `webgl-background-canvas` and it has absolute width/height.
2. **Interactive Event Tracking**: Moving the mouse coordinates and scrolling triggers updates in uniforms (can be tested visually by observing particle displacements).
3. **Memory Leak Test**: Verifying that navigating away or unmounting the component deletes the canvas and cleans up the WebGL context without leaving orphaned event listeners.
