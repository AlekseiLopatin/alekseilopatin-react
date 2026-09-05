import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { sClunk, sTick } from '../audio';
import { clamp, colorOf, easeOutQuart, irand, makeCanvas, mod, rand, trunc } from '../utils';

/* Карнавальное колесо. Угол поворота (`rot`) — обычная переменная
   в замыкании, а не React state: обновлять состояние 60 раз в
   секунду означало бы 60 ре-рендеров всего дерева в секунду. */
export const WheelMode = forwardRef(function WheelMode({ pool, muted }, ref) {
  const stageRef = useRef(null);
  const drawRef = useRef(null);
  const rafRef = useRef(null);
  const rotRef = useRef(rand(0, Math.PI * 2));
  const geomRef = useRef(null);

  useEffect(() => {
    const stage = stageRef.current;
    stage.innerHTML = '';
    const { ctx, W, H } = makeCanvas(stage, 'wheel-canvas');
    const n = pool.length;
    const arc = (Math.PI * 2) / n;
    const cx = W / 2;
    const cy = H / 2 + 6;
    /* На доли секунды между переустановкой эффекта и пересчётом layout
       (двойной вызов эффектов в StrictMode) стенд может измериться
       нулевым — без ограничения снизу отрицательный радиус уронил бы
       canvas ("IndexSizeError"). Кадр с R=0 невидим и тут же сменится
       следующей перерисовкой с настоящими размерами. */
    const R = Math.max(0, Math.min(W, H) / 2 - 46);
    geomRef.current = { n, arc, cx, cy, R };

    const draw = (highlight = -1) => {
      const rot = rotRef.current;
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < n; i += 1) {
        const a0 = rot + i * arc;
        const a1 = a0 + arc;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, R, a0, a1);
        ctx.closePath();
        ctx.fillStyle = highlight >= 0 && i !== highlight ? '#33415588' : colorOf(i);
        ctx.fill();
        ctx.strokeStyle = '#141210';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(a0 + arc / 2);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        const fs = clamp(((2 * Math.PI * R * 0.8) / n) * 0.55, 9, 20);
        ctx.font = `700 ${fs}px Poppins, sans-serif`;
        ctx.shadowColor = '#0008';
        ctx.shadowBlur = 3;
        ctx.fillText(trunc(pool[i], 14), R - 14, 0);
        ctx.restore();
      }
      ctx.beginPath();
      ctx.arc(cx, cy, R + 5, 0, Math.PI * 2);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 8;
      ctx.stroke();
      for (let i = 0; i < n; i += 1) {
        const a = rot + i * arc;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * (R + 5), cy + Math.sin(a) * (R + 5), 4, 0, Math.PI * 2);
        ctx.fillStyle = '#fef3c7';
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(18, R * 0.09), 0, Math.PI * 2);
      ctx.fillStyle = '#e8dcc8';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(18, R * 0.09) - 6, 0, Math.PI * 2);
      ctx.fillStyle = '#d4a44b';
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx - 13, cy - R - 22);
      ctx.lineTo(cx + 13, cy - R - 22);
      ctx.lineTo(cx, cy - R + 14);
      ctx.closePath();
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#000a';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
    };
    drawRef.current = draw;
    draw();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [pool]);

  useImperativeHandle(ref, () => ({
    spin(winner, done) {
      const { n, arc } = geomRef.current;
      const draw = drawRef.current;
      const idxAtPointer = (r) => mod(Math.floor(mod(-Math.PI / 2 - r, Math.PI * 2) / arc), n);

      const w = pool.indexOf(winner);
      const desired = -Math.PI / 2 - (w + 0.5) * arc;
      const turns = 5 + irand(3);
      const start = rotRef.current;
      const target = start + turns * Math.PI * 2 + mod(desired - start, Math.PI * 2);
      const dur = 5200;
      const t0 = performance.now();
      let lastIdx = idxAtPointer(start);

      const step = (now) => {
        const t = clamp((now - t0) / dur, 0, 1);
        rotRef.current = start + (target - start) * easeOutQuart(t);
        const idx = idxAtPointer(rotRef.current);
        if (idx !== lastIdx) {
          sTick(muted);
          lastIdx = idx;
        }
        draw();
        if (t < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          draw(w);
          sClunk(muted);
          setTimeout(done, 500);
        }
      };
      rafRef.current = requestAnimationFrame(step);
    },
    destroy() {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
  }));

  return <div className="wheel-stage-inner" ref={stageRef} />;
});

export default WheelMode;
