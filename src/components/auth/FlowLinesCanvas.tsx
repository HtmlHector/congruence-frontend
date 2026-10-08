"use client";

import React, { useEffect, useRef } from "react";

interface FlowLinesCanvasProps {
  className?: string;
}

export function FlowLinesCanvas({ className = "" }: FlowLinesCanvasProps) {
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

    let t = 0;
    const lineCount = 38;

    const render = () => {
      t += 0.006;
      ctx.clearRect(0, 0, width, height);

      // Detect dark vs light canvas
      const isDark =
        document.documentElement.classList.contains("dark") ||
        (window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches &&
          !document.documentElement.classList.contains("light"));

      ctx.lineWidth = 1.25 * window.devicePixelRatio;

      for (let i = 0; i < lineCount; i++) {
        const progress = i / lineCount;
        ctx.beginPath();

        const alpha = Math.sin(progress * Math.PI) * 0.45 + 0.05;

        // Gradient line colors
        if (isDark) {
          // Coral to Emerald to Indigo tones
          const r = Math.floor(100 + 132 * (1 - progress));
          const g = Math.floor(140 + 60 * progress);
          const b = Math.floor(220 * progress + 80);
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.75})`;
        } else {
          // Paper charcoal / deep sapphire
          const ink = Math.floor(30 + 50 * progress);
          ctx.strokeStyle = `rgba(${ink}, ${ink + 20}, ${ink + 40}, ${alpha * 0.6})`;
        }

        const baseAmplitude = height * 0.14;
        const baseY = height * 0.2 + progress * (height * 0.65);

        for (let x = 0; x <= width; x += 12 * window.devicePixelRatio) {
          const normX = x / width;
          const wave1 = Math.sin(normX * 4 + t + progress * 3.5) * baseAmplitude;
          const wave2 = Math.cos(normX * 2.5 - t * 0.8 + progress * 2) * (baseAmplitude * 0.6);
          const wave3 = Math.sin(normX * 6 + t * 1.2) * (baseAmplitude * 0.25);
          
          const y = baseY + wave1 + wave2 + wave3;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`size-full pointer-events-none block ${className}`}
      style={{ display: "block" }}
    />
  );
}
