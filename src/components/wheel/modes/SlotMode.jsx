import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { sClunk, sTick } from '../audio';
import { clamp, easeOutCubic, irand, trunc } from '../utils';

const ROW = 64;
const N_BULBS = 9;

export const SlotMode = forwardRef(function SlotMode({ pool, muted }, ref) {
  const wrapRef = useRef(null);
  const bulbsRef = useRef([]);
  const stripsRef = useRef([]);
  const lightTimerRef = useRef(null);
  const rafsRef = useRef([]);
  const stoppedRef = useRef(false);

  const fillStrip = (strip, winner, fillerRows) => {
    strip.innerHTML = '';
    const items = [];
    for (let i = 0; i < fillerRows; i += 1) items.push(pool[irand(pool.length)]);
    items.push(winner);
    items.push(pool[irand(pool.length)]);
    items.forEach((name) => {
      const cell = document.createElement('div');
      cell.className = 'wheel-cell';
      cell.textContent = trunc(name, 14);
      cell.style.fontSize = `${clamp(300 / Math.max(6, name.length), 14, 24)}px`;
      strip.appendChild(cell);
    });
    return fillerRows;
  };

  const lights = (mode) => {
    clearInterval(lightTimerRef.current);
    if (mode === 'chase') {
      let k = 0;
      lightTimerRef.current = setInterval(() => {
        bulbsRef.current.forEach((b, i) => b.classList.toggle('is-on', (i + k) % 3 === 0));
        k += 1;
      }, 90);
    } else if (mode === 'all') {
      let on = true;
      lightTimerRef.current = setInterval(() => {
        bulbsRef.current.forEach((b) => b.classList.toggle('is-on', on));
        on = !on;
      }, 160);
    } else {
      bulbsRef.current.forEach((b) => b.classList.remove('is-on'));
    }
  };

  useEffect(() => {
    stoppedRef.current = false;
    const wrap = wrapRef.current;
    wrap.innerHTML = `
      <div class="wheel-slotcab">
        <div class="wheel-lights">${'<div class="wheel-bulb"></div>'.repeat(N_BULBS)}</div>
        <div class="wheel-reels">
          ${[0, 1, 2].map(() => '<div class="wheel-reel"><div class="wheel-strip"></div></div>').join('')}
        </div>
      </div>`;
    bulbsRef.current = [...wrap.querySelectorAll('.wheel-bulb')];
    stripsRef.current = [...wrap.querySelectorAll('.wheel-strip')];
    /* fillStrip не мемоизирована нарочно — пересоздаётся каждый рендер, добавлять её в deps незачем. */
    stripsRef.current.forEach((s) => fillStrip(s, pool[irand(pool.length)], 2));

    return () => {
      stoppedRef.current = true;
      // eslint-disable-next-line react-hooks/exhaustive-deps
      rafsRef.current.forEach((r) => r && cancelAnimationFrame(r));
      clearInterval(lightTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool]);

  useImperativeHandle(ref, () => ({
    spin(winner, done) {
      lights('chase');
      sClunk(muted);
      let finished = 0;
      stripsRef.current.forEach((strip, ri) => {
        const fillerRows = 16 + ri * 8;
        const winRow = fillStrip(strip, winner, fillerRows);
        const targetY = (winRow - 1) * ROW;
        const dur = 2100 + ri * 750;
        const t0 = performance.now();
        let lastRow = 0;
        const step = (now) => {
          const t = clamp((now - t0) / dur, 0, 1);
          const y = targetY * easeOutCubic(t);
          strip.style.transform = `translateY(${-y}px)`;
          const row = Math.floor(y / ROW);
          if (row !== lastRow) {
            sTick(muted);
            lastRow = row;
          }
          if (t < 1) {
            rafsRef.current[ri] = requestAnimationFrame(step);
          } else {
            sClunk(muted);
            finished += 1;
            if (finished === stripsRef.current.length && !stoppedRef.current) {
              lights('all');
              setTimeout(done, 700);
            }
          }
        };
        rafsRef.current[ri] = requestAnimationFrame(step);
      });
    },
    destroy() {
      stoppedRef.current = true;
      rafsRef.current.forEach((r) => r && cancelAnimationFrame(r));
      clearInterval(lightTimerRef.current);
    },
  }));

  return <div className="wheel-slotwrap" ref={wrapRef} />;
});

export default SlotMode;
