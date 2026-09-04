import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { sClunk, sPop, sTick } from '../audio';
import { clamp, colorOf, irand, rand } from '../utils';

/* Гача-автомат целиком на DOM+CSS (как и в оригинале) — капсул
   немного, canvas тут не даёт выигрыша, а разметка проще для
   таких составных фигур (машина, ручка, лоток, половинки капсулы). */
export const GachaMode = forwardRef(function GachaMode({ pool, muted, burst }, ref) {
  const wrapRef = useRef(null);
  const machineRef = useRef(null);
  const knobRef = useRef(null);
  const outcapRef = useRef(null);
  const timersRef = useRef([]);

  useEffect(() => {
    const wrap = wrapRef.current;
    wrap.innerHTML = `
      <div class="wheel-machine">
        <div class="wheel-globe"></div>
        <div class="wheel-gbody">
          <div class="wheel-gknob">◧</div>
          <div class="wheel-gchute"></div>
        </div>
        <div class="wheel-outcap">
          <div class="wheel-half wheel-half-t"></div>
          <div class="wheel-half wheel-half-b"></div>
        </div>
      </div>`;
    const machine = wrap.querySelector('.wheel-machine');
    const globe = wrap.querySelector('.wheel-globe');
    const knob = wrap.querySelector('.wheel-gknob');
    const outcap = wrap.querySelector('.wheel-outcap');
    machineRef.current = machine;
    knobRef.current = knob;
    outcapRef.current = outcap;

    const gd = globe.clientWidth || 280;
    const count = clamp(pool.length, 10, 22);
    for (let i = 0; i < count; i += 1) {
      const cap = document.createElement('div');
      cap.className = 'wheel-caps';
      const sz = rand(30, 44);
      cap.style.width = `${sz}px`;
      cap.style.height = `${sz}px`;
      cap.style.left = `${rand(6, gd - sz - 12)}px`;
      cap.style.top = `${gd * 0.45 + rand(0, gd * 0.42 - sz)}px`;
      cap.style.background = `linear-gradient(180deg, #e8dcc8 48%, ${colorOf(i)} 52%)`;
      cap.style.animationDelay = `${rand(0, 0.2)}s`;
      cap.style.animationDuration = `${rand(0.16, 0.3)}s`;
      globe.appendChild(cap);
    }
    const capColor = colorOf(irand(6));
    outcap.querySelector('.wheel-half-t').style.background = capColor;

    return () => {
      /* timersRef хранит обычный массив (push, не переприсваивание),
         а не DOM-узел — React его не обнуляет, предупреждение линтера
         тут ложное. */
      // eslint-disable-next-line react-hooks/exhaustive-deps
      timersRef.current.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool]);

  useImperativeHandle(ref, () => ({
    spin(winner, done) {
      void winner;
      const machine = machineRef.current;
      const knob = knobRef.current;
      const outcap = outcapRef.current;
      machine.classList.add('is-shaking');
      knob.style.transform = 'translateX(-50%) rotate(720deg)';
      for (let i = 0; i < 16; i += 1) {
        timersRef.current.push(setTimeout(() => sTick(muted), 120 * i + rand(0, 60)));
      }
      timersRef.current.push(
        setTimeout(() => {
          machine.classList.remove('is-shaking');
          outcap.classList.add('is-dropped');
          sClunk(muted);
        }, 2100),
      );
      timersRef.current.push(
        setTimeout(() => {
          outcap.classList.add('is-open');
          sPop(muted);
          const rect = outcap.getBoundingClientRect();
          burst(rect.left + 23, rect.top + 40, 24, 5);
        }, 3100),
      );
      timersRef.current.push(setTimeout(done, 3650));
    },
    destroy() {
      timersRef.current.forEach(clearTimeout);
    },
  }));

  return <div className="wheel-gachawrap" ref={wrapRef} />;
});

export default GachaMode;
