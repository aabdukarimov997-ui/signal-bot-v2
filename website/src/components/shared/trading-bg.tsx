'use client';

import { useEffect, useRef } from 'react';

/**
 * Animated trading-chart background — candlesticks, grid, trend line, particles.
 * Pure Canvas, zero external deps. Matches the dark glassmorphism palette.
 */
export function TradingBg({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    let w = 0;
    let h = 0;

    /* ── candle data (randomised once) ── */
    interface Candle {
      x: number;
      open: number;
      close: number;
      high: number;
      low: number;
      w: number;
    }
    let candles: Candle[] = [];

    function buildCandles() {
      candles = [];
      const count = Math.floor(w / 48) + 2;
      let price = h * 0.45;
      for (let i = 0; i < count; i++) {
        const gap = 48;
        const x = i * gap + 24;
        const bodyH = Math.random() * 40 + 14;
        const bull = Math.random() > 0.42;
        const open = price;
        const close = bull ? price - bodyH : price + bodyH;
        const high = Math.min(open, close) - Math.random() * 28;
        const low = Math.max(open, close) + Math.random() * 28;
        price = close + (Math.random() - 0.48) * 16;
        candles.push({ x, open, close, high, low, w: 20 });
      }
    }

    /* ── particles ── */
    interface Dot {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      o: number;
    }
    let dots: Dot[] = [];

    function buildDots() {
      dots = [];
      const count = Math.floor((w * h) / 18000);
      for (let i = 0; i < count; i++) {
        dots.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.18,
          r: Math.random() * 1.4 + 0.4,
          o: Math.random() * 0.25 + 0.05,
        });
      }
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas!.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildCandles();
      buildDots();
    }

    /* ── draw helpers ── */
    function drawGrid() {
      ctx!.strokeStyle = 'rgba(192,192,192,0.035)';
      ctx!.lineWidth = 1;
      const stepX = 48;
      const stepY = 48;
      for (let x = 0; x < w; x += stepX) {
        ctx!.beginPath();
        ctx!.moveTo(x, 0);
        ctx!.lineTo(x, h);
        ctx!.stroke();
      }
      for (let y = 0; y < h; y += stepY) {
        ctx!.beginPath();
        ctx!.moveTo(0, y);
        ctx!.lineTo(w, y);
        ctx!.stroke();
      }
    }

    function drawCandles() {
      candles.forEach((c) => {
        const bull = c.close < c.open;
        // wick
        ctx!.strokeStyle = bull
          ? 'rgba(45,212,160,0.18)'
          : 'rgba(255,68,68,0.14)';
        ctx!.lineWidth = 1.2;
        ctx!.beginPath();
        ctx!.moveTo(c.x, c.high);
        ctx!.lineTo(c.x, c.low);
        ctx!.stroke();
        // body
        ctx!.fillStyle = bull
          ? 'rgba(45,212,160,0.12)'
          : 'rgba(255,68,68,0.09)';
        const top = Math.min(c.open, c.close);
        const bodyH = Math.abs(c.close - c.open);
        ctx!.fillRect(c.x - c.w / 2, top, c.w, bodyH);
      });
    }

    function drawTrendLine(t: number) {
      if (candles.length < 2) return;
      ctx!.beginPath();
      ctx!.strokeStyle = 'rgba(45,212,160,0.14)';
      ctx!.lineWidth = 1.5;
      ctx!.setLineDash([8, 6]);
      const offset = (t * 0.02) % (w * 2);
      const startX = -w + offset;
      const startY = h * 0.55 - Math.sin(offset * 0.003) * h * 0.2;
      const cpX = startX + w * 0.5;
      const cpY = h * 0.35 + Math.cos(offset * 0.002) * h * 0.15;
      const endX = startX + w;
      const endY = h * 0.45 - Math.sin(offset * 0.004 + 1) * h * 0.12;
      ctx!.moveTo(startX, startY);
      ctx!.quadraticCurveTo(cpX, cpY, endX, endY);
      ctx!.stroke();
      ctx!.setLineDash([]);

      // glow on the line
      ctx!.strokeStyle = 'rgba(45,212,160,0.04)';
      ctx!.lineWidth = 6;
      ctx!.beginPath();
      ctx!.moveTo(startX, startY);
      ctx!.quadraticCurveTo(cpX, cpY, endX, endY);
      ctx!.stroke();
    }

    function drawVolume(t: number) {
      const barW = 20;
      const gap = 48;
      const baseY = h;
      candles.forEach((c, i) => {
        const volH = (Math.sin(i * 0.7 + t * 0.0008) * 0.5 + 0.5) * 50 + 8;
        const bull = c.close < c.open;
        ctx!.fillStyle = bull
          ? 'rgba(45,212,160,0.04)'
          : 'rgba(255,68,68,0.03)';
        ctx!.fillRect(c.x - barW / 2, baseY - volH, barW, volH);
      });
    }

    function drawDots(t: number) {
      dots.forEach((d) => {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0) d.x = w;
        if (d.x > w) d.x = 0;
        if (d.y < 0) d.y = h;
        if (d.y > h) d.y = 0;
        const pulse = Math.sin(t * 0.001 + d.x * 0.01) * 0.1 + d.o;
        ctx!.beginPath();
        ctx!.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(45,212,160,${Math.max(0, pulse).toFixed(3)})`;
        ctx!.fill();
      });
    }

    function drawMovingAvg(t: number) {
      // Simple moving average line (smooth curve through candle closes)
      if (candles.length < 5) return;
      ctx!.beginPath();
      ctx!.strokeStyle = 'rgba(192,192,192,0.06)';
      ctx!.lineWidth = 1;
      const first = candles[0];
      ctx!.moveTo(first.x, first.close);
      for (let i = 1; i < candles.length; i++) {
        const prev = candles[i - 1];
        const curr = candles[i];
        const cpx = (prev.x + curr.x) / 2;
        ctx!.quadraticCurveTo(prev.x, prev.close, cpx, (prev.close + curr.close) / 2);
      }
      ctx!.stroke();
    }

    let start: number | null = null;
    function frame(ts: number) {
      if (!start) start = ts;
      const t = ts - start;
      ctx!.clearRect(0, 0, w, h);

      drawGrid();
      drawVolume(t);
      drawCandles();
      drawMovingAvg(t);
      drawTrendLine(t);
      drawDots(t);

      raf = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener('resize', resize);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 -z-10 ${className}`}
      style={{ width: '100%', height: '100%' }}
    />
  );
}