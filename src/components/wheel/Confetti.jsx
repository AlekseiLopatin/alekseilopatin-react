import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { PALETTE, clamp, irand, rand } from './utils';

/* Полноэкранный канвас с конфетти поверх всей страницы. Управляется
   императивно через ref.celebrate() — сама анимация никогда не
   проходит через React state, только через requestAnimationFrame
   и мутацию локального массива частиц. */
export const Confetti = forwardRef(function Confetti(_, ref) {
  const canvasRef = useRef(null);
  const partsRef = useRef([]);
  const runningRef = useRef(false);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const burst = (x, y, n = 40, spread = 7) => {
    for (let i = 0; i < n; i += 1) {
      partsRef.current.push({
        x, y,
        vx: rand(-spread, spread),
        vy: rand(-spread * 1.4, -1),
        w: rand(5, 10), h: rand(3, 6),
        rot: rand(0, Math.PI * 2), vr: rand(-0.25, 0.25),
        c: PALETTE[irand(PALETTE.length)],
        life: rand(60, 110),
      });
    }
    if (!runningRef.current) {
      runningRef.current = true;
      rafRef.current = requestAnimationFrame(loop);
    }
  };

  const loop = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    partsRef.current = partsRef.current.filter(
      (p) => p.life > 0 && p.y < window.innerHeight + 30,
    );
    for (const p of partsRef.current) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.22;
      p.vx *= 0.99;
      p.rot += p.vr;
      p.life -= 1;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      ctx.globalAlpha = clamp(p.life / 30, 0, 1);
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (partsRef.current.length) {
      rafRef.current = requestAnimationFrame(loop);
    } else {
      runningRef.current = false;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  };

  useImperativeHandle(ref, () => ({
    burst,
    celebrate() {
      burst(window.innerWidth * 0.5, window.innerHeight * 0.35, 70, 9);
      setTimeout(() => burst(window.innerWidth * 0.25, window.innerHeight * 0.3, 50, 8), 180);
      setTimeout(() => burst(window.innerWidth * 0.75, window.innerHeight * 0.3, 50, 8), 360);
    },
  }));

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  return <canvas ref={canvasRef} className="wheel-fx" aria-hidden="true" />;
});

export default Confetti;
