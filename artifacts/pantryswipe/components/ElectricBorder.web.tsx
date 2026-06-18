import React, { useRef, useEffect, useCallback } from "react";

interface ElectricBorderProps {
  children: React.ReactNode;
  color?: string;
  speed?: number;
  chaos?: number;
  borderRadius?: number;
  style?: object;
}

export function ElectricBorder({
  children,
  color = "#4CAF76",
  speed = 1,
  chaos = 0.12,
  borderRadius = 24,
  style,
}: ElectricBorderProps) {
  const containerRef = useRef<any>(null);
  const canvasRef = useRef<any>(null);
  const animRef = useRef<any>(null);
  const timeRef = useRef(0);
  const lastFrameRef = useRef(0);

  const random = useCallback((x: number) => {
    return (Math.sin(x * 12.9898) * 43758.5453) % 1;
  }, []);

  const noise2D = useCallback(
    (x: number, y: number) => {
      const i = Math.floor(x);
      const j = Math.floor(y);
      const fx = x - i;
      const fy = y - j;
      const a = random(i + j * 57);
      const b = random(i + 1 + j * 57);
      const c = random(i + (j + 1) * 57);
      const d = random(i + 1 + (j + 1) * 57);
      const ux = fx * fx * (3.0 - 2.0 * fx);
      const uy = fy * fy * (3.0 - 2.0 * fy);
      return (
        a * (1 - ux) * (1 - uy) +
        b * ux * (1 - uy) +
        c * (1 - ux) * uy +
        d * ux * uy
      );
    },
    [random]
  );

  const octavedNoise = useCallback(
    (
      x: number,
      octaves: number,
      lacunarity: number,
      gain: number,
      baseAmplitude: number,
      baseFrequency: number,
      time: number,
      seed: number,
      baseFlatness: number
    ) => {
      let y = 0;
      let amplitude = baseAmplitude;
      let frequency = baseFrequency;
      for (let i = 0; i < octaves; i++) {
        let octAmp = amplitude;
        if (i === 0) octAmp *= baseFlatness;
        y += octAmp * noise2D(frequency * x + seed * 100, time * frequency * 0.3);
        frequency *= lacunarity;
        amplitude *= gain;
      }
      return y;
    },
    [noise2D]
  );

  const getCornerPoint = useCallback(
    (
      cx: number,
      cy: number,
      r: number,
      startAngle: number,
      arcLength: number,
      progress: number
    ) => {
      const angle = startAngle + progress * arcLength;
      return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
    },
    []
  );

  const getRoundedRectPoint = useCallback(
    (t: number, left: number, top: number, width: number, height: number, radius: number) => {
      const sw = width - 2 * radius;
      const sh = height - 2 * radius;
      const ca = (Math.PI * radius) / 2;
      const perimeter = 2 * sw + 2 * sh + 4 * ca;
      const dist = t * perimeter;
      let acc = 0;

      if (dist <= acc + sw) {
        const p = (dist - acc) / sw;
        return { x: left + radius + p * sw, y: top };
      }
      acc += sw;

      if (dist <= acc + ca) {
        return getCornerPoint(left + width - radius, top + radius, radius, -Math.PI / 2, Math.PI / 2, (dist - acc) / ca);
      }
      acc += ca;

      if (dist <= acc + sh) {
        const p = (dist - acc) / sh;
        return { x: left + width, y: top + radius + p * sh };
      }
      acc += sh;

      if (dist <= acc + ca) {
        return getCornerPoint(left + width - radius, top + height - radius, radius, 0, Math.PI / 2, (dist - acc) / ca);
      }
      acc += ca;

      if (dist <= acc + sw) {
        const p = (dist - acc) / sw;
        return { x: left + width - radius - p * sw, y: top + height };
      }
      acc += sw;

      if (dist <= acc + ca) {
        return getCornerPoint(left + radius, top + height - radius, radius, Math.PI / 2, Math.PI / 2, (dist - acc) / ca);
      }
      acc += ca;

      if (dist <= acc + sh) {
        const p = (dist - acc) / sh;
        return { x: left, y: top + height - radius - p * sh };
      }
      acc += sh;

      const p = (dist - acc) / ca;
      return getCornerPoint(left + radius, top + radius, radius, Math.PI, Math.PI / 2, p);
    },
    [getCornerPoint]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const octaves = 10;
    const lacunarity = 1.6;
    const gain = 0.7;
    const amplitude = chaos;
    const frequency = 10;
    const baseFlatness = 0;
    const displacement = 60;
    const borderOffset = 60;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const w = rect.width + borderOffset * 2;
      const h = rect.height + borderOffset * 2;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);
      return { width: w, height: h };
    };

    let { width, height } = updateSize();
    let lastDpr = Math.min(window.devicePixelRatio || 1, 2);

    const draw = (currentTime: number) => {
      if (!canvas || !ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (dpr !== lastDpr) {
        lastDpr = dpr;
        const s = updateSize();
        width = s.width;
        height = s.height;
      }

      const dt = (currentTime - lastFrameRef.current) / 1000;
      timeRef.current += dt * speed;
      lastFrameRef.current = currentTime;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);

      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const left = borderOffset;
      const top = borderOffset;
      const bw = width - 2 * borderOffset;
      const bh = height - 2 * borderOffset;
      const maxR = Math.min(bw, bh) / 2;
      const r = Math.min(borderRadius, maxR);
      const approxPerim = 2 * (bw + bh) + 2 * Math.PI * r;
      const samples = Math.floor(approxPerim / 2);

      ctx.beginPath();
      for (let i = 0; i <= samples; i++) {
        const progress = i / samples;
        const pt = getRoundedRectPoint(progress, left, top, bw, bh, r);
        const xn = octavedNoise(progress * 8, octaves, lacunarity, gain, amplitude, frequency, timeRef.current, 0, baseFlatness);
        const yn = octavedNoise(progress * 8, octaves, lacunarity, gain, amplitude, frequency, timeRef.current, 1, baseFlatness);
        const dx = pt.x + xn * displacement;
        const dy = pt.y + yn * displacement;
        if (i === 0) ctx.moveTo(dx, dy);
        else ctx.lineTo(dx, dy);
      }
      ctx.closePath();
      ctx.stroke();

      animRef.current = requestAnimationFrame(draw);
    };

    const ro = new ResizeObserver(() => {
      const s = updateSize();
      width = s.width;
      height = s.height;
    });
    ro.observe(container);
    animRef.current = requestAnimationFrame(draw);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, [color, speed, chaos, borderRadius, octavedNoise, getRoundedRectPoint]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        borderRadius,
        overflow: "visible",
        isolation: "isolate",
        display: "block",
        ...(style as React.CSSProperties),
      }}
    >
      {/* Animated canvas border */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      >
        <canvas ref={canvasRef} style={{ display: "block" }} />
      </div>

      {/* Static glow layers */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius,
            border: `2px solid ${color}99`,
            filter: "blur(1px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius,
            border: `2px solid ${color}`,
            filter: "blur(5px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius,
            zIndex: -1,
            transform: "scale(1.08)",
            filter: "blur(28px)",
            opacity: 0.35,
            background: `linear-gradient(-30deg, ${color}, transparent, ${color})`,
          }}
        />
      </div>

      {/* Content */}
      <div style={{ position: "relative", borderRadius, zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}
