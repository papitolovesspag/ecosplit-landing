"use client";

import React, { useRef } from "react";
import { useWebGL } from "../hooks/useWebGL";

export default function WebGLBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useWebGL(canvasRef);

  return <canvas id="webgl-background" ref={canvasRef} />;
}
