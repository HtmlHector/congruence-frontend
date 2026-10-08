"use client";

import React, { useEffect, useRef } from "react";

interface DotMatrixCanvasProps {
  className?: string;
}

export function DotMatrixCanvas({ className = "" }: DotMatrixCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth * window.devicePixelRatio || 800);
    let height = (canvas.height = canvas.offsetHeight * window.devicePixelRatio || 800);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth * window.devicePixelRatio || 800;
      height = canvas.height = canvas.offsetHeight * window.devicePixelRatio || 800;
    };

    window.addEventListener("resize", handleResize);

    let mouseX = width / 2;
    let mouseY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) * window.devicePixelRatio;
      mouseY = (e.clientY - rect.top) * window.devicePixelRatio;
    };

    window.addEventListener("mousemove", handleMouseMove);

    let t = 0;
    const spacing = 26 * window.devicePixelRatio;

    const render = () => {
      t += 0.02;
      ctx.clearRect(0, 0, width, height);

      // Pure crisp white background
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);

      const cols = Math.ceil(width / spacing) + 2;
      const rows = Math.ceil(height / spacing) + 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * spacing;
          const y = r * spacing;

          // Wave equation
          const dx = x - mouseX;
          const dy = y - mouseY;
          const distMouse = Math.sqrt(dx * dx + dy * dy);
          const mouseEffect = Math.max(0, 1 - distMouse / (260 * window.devicePixelRatio));

          const wave1 = Math.sin(x * 0.008 + t * 1.2) * Math.cos(y * 0.008 + t * 0.9);
          const wave2 = Math.sin((x + y) * 0.006 - t * 0.8) * 0.5;
          const wave = (wave1 + wave2 + mouseEffect * 1.5) / 2.5;

          const baseRadius = 1.8 * window.devicePixelRatio;
          const radius = Math.max(0.8, baseRadius * (1 + wave * 1.4));
          const alpha = Math.max(0.12, Math.min(0.85, 0.28 + wave * 0.55));

          // Charcoal & subtle emerald accents on wave peaks
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);

          if (wave > 0.45) {
            ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`; // Emerald peak
          } else if (wave > 0.2) {
            ctx.fillStyle = `rgba(37, 99, 235, ${alpha * 0.8})`; // Blue mid-tone
          } else {
            ctx.fillStyle = `rgba(24, 24, 27, ${alpha})`; // Deep charcoal dot
          }

          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`size-full block ${className}`}
      style={{ display: "block" }}
    />
  );
}
