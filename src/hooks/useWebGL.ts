"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function useWebGL(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const requestRef = useRef<number | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 1. Initialize Scene, Camera, and Renderer inside a try-catch
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
      });
    } catch (error) {
      console.warn("WebGL is not supported or was blocked on this device/browser:", error);
      // Exit early: does not register scroll/mousemove listeners, observers, or requestAnimationFrame.
      // This prevents runtime crashes in headless environments or non-WebGL browsers.
      return;
    }

    const scene = new THREE.Scene();
    
    // Position camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Handle context loss events gracefully
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
      console.warn("WebGL context lost. Rendering loop paused.");
    };
    canvas.addEventListener("webglcontextlost", handleContextLost, false);

    // 2. Initialize Particles Geometry
    const count = 1500;
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Position particles in a 3D box
      positions[i * 3 + 0] = (Math.random() - 0.5) * 15; // X
      positions[i * 3 + 1] = (Math.random() - 0.5) * 15; // Y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10; // Z

      // Random multipliers for independent movement
      randoms[i * 3 + 0] = Math.random() * 2 - 1;
      randoms[i * 3 + 1] = Math.random() * 2 - 1;
      randoms[i * 3 + 2] = Math.random() * 2 - 1;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("random", new THREE.BufferAttribute(randoms, 3));

    // 3. Uniforms and Shader Material
    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uScroll: { value: 0 },
      uThemeMode: { value: 0.0 }, // 0.0 = dark, 1.0 = light
    };

    const vertexShader = `
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uScroll;
      attribute vec3 random;
      varying vec3 vPosition;
      varying float vRandom;

      void main() {
        vPosition = position;
        vRandom = random.x;

        // Subtle organic float animation
        vec3 pos = position;
        pos.x += sin(uTime * 0.2 + random.x * 6.28) * 0.4;
        pos.y += cos(uTime * 0.2 + random.y * 6.28) * 0.4;
        pos.z += sin(uTime * 0.2 + random.z * 6.28) * 0.2;

        // Interactive mouse displacement
        float mouseDist = distance(pos.xy, uMouse * 8.0);
        if (mouseDist < 3.0) {
          vec2 dir = normalize(pos.xy - uMouse * 8.0);
          float force = (3.0 - mouseDist) / 3.0;
          pos.xy += dir * force * 1.5;
        }

        // Scroll reactivity - move background vertically based on scroll
        pos.y += uScroll * 4.0;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;

        // Size attenuation
        gl_PointSize = (12.0 / -mvPosition.z) * (1.5 + sin(uTime * 0.5 + random.y * 6.28) * 0.5);
      }
    `;

    const fragmentShader = `
      uniform float uThemeMode;
      varying vec3 vPosition;
      varying float vRandom;

      void main() {
        // Circular particles
        vec2 circ = gl_PointCoord - vec2(0.5);
        if (dot(circ, circ) > 0.25) {
          discard;
        }

        // Dark mode primary: green (#10b981) -> vec3(0.0627, 0.7255, 0.5059)
        // Dark mode secondary: cyan (#06b6d4) -> vec3(0.0235, 0.7137, 0.8314)
        // Light mode primary: green (#059669) -> vec3(0.0196, 0.5882, 0.4118)
        // Light mode secondary: cyan (#0891b2) -> vec3(0.0314, 0.5686, 0.698)

        vec3 darkGreen = vec3(0.0627, 0.7255, 0.5059);
        vec3 darkCyan = vec3(0.0235, 0.7137, 0.8314);
        vec3 lightGreen = vec3(0.0196, 0.5882, 0.4118);
        vec3 lightCyan = vec3(0.0314, 0.5686, 0.698);

        vec3 colorGreen = mix(darkGreen, lightGreen, uThemeMode);
        vec3 colorCyan = mix(darkCyan, lightCyan, uThemeMode);

        // Mix between colors based on position and randomness
        float mixVal = clamp((vPosition.x + 5.0) / 10.0 + vRandom * 0.2, 0.0, 1.0);
        vec3 color = mix(colorGreen, colorCyan, mixVal);

        // Adjust particle opacity based on theme (subtler in light mode)
        float baseAlpha = mix(0.7, 0.45, uThemeMode);
        float alpha = baseAlpha * (0.6 + sin(vPosition.y + vRandom * 10.0) * 0.4);

        gl_FragColor = vec4(color, alpha);
      }
    `;

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // 4. Handle Interactivity & Scroll
    const mouse = new THREE.Vector2(0, 0);
    const targetMouse = new THREE.Vector2(0, 0);

    const handleMouseMove = (event: MouseEvent) => {
      // Normalize mouse coordinates (-1 to 1)
      targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    let targetScroll = 0;
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0) {
        targetScroll = window.scrollY / maxScroll;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);

    // 5. Theme Transition & MutationObserver
    let targetThemeMode = 0.0;
    
    // Initial check
    const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
    targetThemeMode = currentTheme === "light" ? 1.0 : 0.0;
    uniforms.uThemeMode.value = targetThemeMode;

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === "data-theme") {
          const theme = document.documentElement.getAttribute("data-theme") || "dark";
          targetThemeMode = theme === "light" ? 1.0 : 0.0;
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    observerRef.current = observer;

    // 6. Handle Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener("resize", handleResize);

    // 7. Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      uniforms.uTime.value = elapsedTime;

      // Smooth mouse LERP
      mouse.x += (targetMouse.x - mouse.x) * 0.08;
      mouse.y += (targetMouse.y - mouse.y) * 0.08;
      uniforms.uMouse.value.copy(mouse);

      // Smooth scroll LERP
      uniforms.uScroll.value += (targetScroll - uniforms.uScroll.value) * 0.1;

      // Smooth theme transition LERP
      uniforms.uThemeMode.value += (targetThemeMode - uniforms.uThemeMode.value) * 0.06;

      // Gentle rotation of points
      points.rotation.y = elapsedTime * 0.02;
      points.rotation.x = elapsedTime * 0.01;

      renderer.render(scene, camera);
      requestRef.current = requestAnimationFrame(animate);
    };

    animate();

    // 8. Cleanup
    return () => {
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }

      // Dispose resources safely
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [canvasRef]);
}
