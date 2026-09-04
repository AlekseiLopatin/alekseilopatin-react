import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { sPop } from '../audio';
import { clamp, colorOf, irand, rand, shuffle } from '../utils';

export const BalloonMode = forwardRef(function BalloonMode({ pool, muted, burst }, ref) {
  const stageRef = useRef(null);
  const wrapRef = useRef(null);
  const balloonsRef = useRef({});
  const timersRef = useRef([]);

  useEffect(() => {
    const stage = stageRef.current;
    stage.innerHTML = '<div class="wheel-balloonwrap"></div>';
    const wrap = stage.querySelector('.wheel-balloonwrap');
    wrapRef.current = wrap;
    const W = stage.clientWidth;
    const H = stage.clientHeight - 70;
    const n = pool.length;
    const cols = Math.ceil(Math.sqrt((n * W) / Math.max(H, 1)));
    const rows = Math.ceil(n / cols);
    const cellW = W / cols;
    const cellH = H / rows;
    const size = clamp(Math.min(cellW, cellH) * 0.78, 56, 130);
    const balloons = {};

    shuffle(pool).forEach((name, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const b = document.createElement('div');
      b.className = 'wheel-balloon wheel-bob';
      b.style.width = `${size}px`;
      b.style.height = `${size * 1.15}px`;
      const x = col * cellW + (cellW - size) / 2 + rand(-cellW * 0.08, cellW * 0.08);
      const y = row * cellH + (cellH - size * 1.15) / 2 + rand(-cellH * 0.06, cellH * 0.06);
      b.style.left = `${clamp(x, 4, W - size - 4)}px`;
      b.style.top = `${clamp(y, 4, H - size)}px`;
      const c = colorOf(irand(6));
      b.style.background = `radial-gradient(circle at 32% 28%, ${c}dd, ${c} 60%, ${c}aa)`;
      b.style.fontSize = `${clamp(size / Math.max(5, name.length * 0.72), 10, 17)}px`;
      b.style.animationDuration = `${rand(2.2, 3.6)}s`;
      b.style.animationDelay = `${rand(0, 2)}s`;
      b.innerHTML = `<div class="wheel-shine"></div><span>${name.replace(/</g, '&lt;')}</span>`;
      wrap.appendChild(b);
      balloons[name] = b;
    });
    balloonsRef.current = balloons;

    return () => {
      /* timersRef хранит обычный массив, не DOM-узел — React его
         не обнуляет, предупреждение линтера тут ложное. */
      // eslint-disable-next-line react-hooks/exhaustive-deps
      timersRef.current.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool]);

  useImperativeHandle(ref, () => ({
    spin(winner, done) {
      const balloons = balloonsRef.current;
      const stage = stageRef.current;
      const order = shuffle(pool.filter((x) => x !== winner));
      let i = 0;
      const popNext = () => {
        if (i >= order.length) {
          const b = balloons[winner];
          const r = b.getBoundingClientRect();
          const s = stage.getBoundingClientRect();
          b.classList.remove('wheel-bob');
          b.classList.add('wheel-bwin');
          const dx = s.left + s.width / 2 - (r.left + r.width / 2);
          const dy = s.top + s.height / 2 - 30 - (r.top + r.height / 2);
          const scale = clamp(220 / parseFloat(b.style.width), 1.5, 3);
          b.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
          timersRef.current.push(setTimeout(done, 900));
          return;
        }
        const name = order[i];
        i += 1;
        const b = balloons[name];
        const r = b.getBoundingClientRect();
        b.classList.add('wheel-popped');
        sPop(muted);
        burst(r.left + r.width / 2, r.top + r.height / 2, 10, 4);
        const interval = Math.max(120, 620 * 0.87 ** i);
        timersRef.current.push(setTimeout(popNext, interval));
      };
      timersRef.current.push(setTimeout(popNext, 400));
    },
    destroy() {
      timersRef.current.forEach(clearTimeout);
    },
  }));

  return <div className="wheel-stage-inner" ref={stageRef} />;
});

export default BalloonMode;
