import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { sClunk, sWhir } from '../audio';
import { clamp, hashCode, makeCanvas, rand, trunc } from '../utils';

const RACERS = ['🐢','🐇','🦊','🐸','🚀','🐝','🦄','🐙','🦖','🐧','🦔','🐌','🐬','🦁','🐲','🛸'];

export const RaceMode = forwardRef(function RaceMode({ pool, muted }, ref) {
  const stageRef = useRef(null);
  const rafRef = useRef(null);
  const drawRef = useRef(null);
  const runnersRef = useRef([]);
  const geomRef = useRef(null);

  useEffect(() => {
    const stage = stageRef.current;
    stage.innerHTML = '';
    const { ctx, W, H } = makeCanvas(stage, 'wheel-canvas');
    const n = pool.length;
    const top = 16;
    const bottom = 76;
    const laneH = clamp((H - top - bottom) / n, 20, 60);
    const runners = pool.map((name, i) => ({
      name,
      emoji: RACERS[hashCode(name) % RACERS.length],
      p: 0,
      burst: 1,
      lane: i,
    }));
    runnersRef.current = runners;

    const nameFs = clamp(laneH * 0.5, 10, 15);
    ctx.font = `600 ${nameFs}px Poppins, sans-serif`;
    const labelW = clamp(
      Math.max(...pool.map((nm) => ctx.measureText(trunc(nm, 14)).width)) + 20,
      70,
      170,
    );
    const startX = labelW;
    const finishX = W - 70;
    geomRef.current = { n, top, laneH, startX, finishX, nameFs, W, H };

    const draw = (winnerIdx = -1) => {
      ctx.clearRect(0, 0, W, H);
      const sq = 8;
      for (let y = top; y < top + n * laneH; y += sq) {
        for (let k = 0; k < 2; k += 1) {
          ctx.fillStyle = (y / sq + k) % 2 < 1 ? '#a09080' : '#2c2620';
          ctx.fillRect(finishX + k * sq, y, sq, Math.min(sq, top + n * laneH - y));
        }
      }
      ctx.strokeStyle = '#ffffff30';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startX, top);
      ctx.lineTo(startX, top + n * laneH);
      ctx.stroke();

      runners.forEach((r, i) => {
        const y = top + i * laneH + laneH / 2;
        ctx.strokeStyle = '#ffffff10';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(8, y + laneH / 2);
        ctx.lineTo(W - 20, y + laneH / 2);
        ctx.stroke();
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
        if (i === winnerIdx) {
          ctx.fillStyle = 'rgba(212,164,75,0.18)';
          ctx.fillRect(0, y - laneH / 2, W, laneH);
        }
        ctx.fillStyle = i === winnerIdx ? '#e8b85c' : '#e8dcc8';
        ctx.font = `600 ${nameFs}px Poppins, sans-serif`;
        ctx.fillText(trunc(r.name, 14), 8, y + 1);
        const fs = clamp(laneH * 0.72, 14, 30);
        const x = startX + 6 + r.p * (finishX - startX - 6 - fs / 2);
        ctx.font = `${fs}px Poppins, sans-serif`;
        ctx.fillText(r.emoji, x, y + 1);
      });
    };
    drawRef.current = draw;
    draw();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [pool]);

  useImperativeHandle(ref, () => ({
    spin(winner, done) {
      const draw = drawRef.current;
      const runners = runnersRef.current;
      const wIdx = pool.indexOf(winner);
      const D = 6000;
      runners.forEach((r) => {
        r.p = 0;
        r.dur = r.name === winner ? D : D * rand(1.04, 1.35);
        r.burst = 1;
      });
      let lastT = performance.now();
      let lastBurst = 0;
      let whirT = 0;

      const step = (now) => {
        const dt = now - lastT;
        lastT = now;
        if (now - lastBurst > 350) {
          runners.forEach((r) => {
            r.burst = rand(0.45, 1.65);
          });
          lastBurst = now;
        }
        whirT += dt;
        if (whirT > 120) {
          sWhir(muted);
          whirT = 0;
        }
        let winnerDone = false;
        runners.forEach((r) => {
          r.p += (r.burst * dt) / r.dur;
          if (r.name === winner) {
            if (r.p >= 1) {
              r.p = 1;
              winnerDone = true;
            }
          } else {
            r.p = Math.min(r.p, 0.94);
          }
        });
        draw(winnerDone ? wIdx : -1);
        if (!winnerDone) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          sClunk(muted);
          setTimeout(done, 600);
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

export default RaceMode;
