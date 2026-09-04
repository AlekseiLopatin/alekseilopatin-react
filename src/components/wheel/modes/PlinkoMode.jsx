import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { sClunk, sTick } from '../audio';
import { clamp, makeCanvas, rand, trunc } from '../utils';

const PR = 5; // радиус колышка
const BR = 11; // радиус шарика

export const PlinkoMode = forwardRef(function PlinkoMode({ pool, muted }, ref) {
  const stageRef = useRef(null);
  const rafRef = useRef(null);
  const geomRef = useRef(null);
  const drawRef = useRef(null);
  const ballRef = useRef(null);
  const settledIdxRef = useRef(-1);

  useEffect(() => {
    const stage = stageRef.current;
    stage.innerHTML = '';
    const { ctx, W, H } = makeCanvas(stage, 'wheel-canvas');
    const n = pool.length;
    const slotW = W / n;
    const slotH = Math.min(110, H * 0.22);
    const floorY = H - slotH;
    const topPad = 30;
    const pegs = [];
    const avail = floorY - topPad - 40;
    const rows = clamp(Math.floor(avail / 36), 2, 9);
    const gapY = avail / rows;
    const gapX = clamp(W / 14, 44, 86);
    for (let r = 0; r < rows; r += 1) {
      const offset = r % 2 ? gapX / 2 : 0;
      for (let x = offset + gapX / 2; x < W - 10; x += gapX) {
        pegs.push({ x, y: topPad + 30 + r * gapY });
      }
    }
    geomRef.current = { n, slotW, slotH, floorY, pegs, W, H };
    ballRef.current = null;
    settledIdxRef.current = -1;

    const draw = () => {
      const { pegs: currentPegs } = geomRef.current;
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < n; i += 1) {
        ctx.fillStyle =
          i === settledIdxRef.current ? '#e8b85c' : i % 2 ? '#201c18' : '#2c2620';
        ctx.fillRect(i * slotW, floorY, slotW, slotH);
        ctx.strokeStyle = '#141210';
        ctx.strokeRect(i * slotW, floorY, slotW, slotH);
        ctx.save();
        ctx.translate(i * slotW + slotW / 2, H - 10);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = i === settledIdxRef.current ? '#141210' : '#e8dcc8';
        const fs = clamp(slotW * 0.5, 9, 15);
        ctx.font = `700 ${fs}px Poppins, sans-serif`;
        ctx.fillText(trunc(pool[i], Math.floor((slotH - 16) / (fs * 0.55))), 0, 0);
        ctx.restore();
      }
      ctx.fillStyle = '#a09080';
      for (const pg of currentPegs) {
        ctx.beginPath();
        ctx.arc(pg.x, pg.y, PR, 0, Math.PI * 2);
        ctx.fill();
      }
      const ball = ballRef.current;
      if (ball) {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BR, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(ball.x - 4, ball.y - 4, 2, ball.x, ball.y, BR);
        grad.addColorStop(0, '#fde68a');
        grad.addColorStop(1, '#f59e0b');
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    };
    drawRef.current = draw;
    draw();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [pool]);

  useImperativeHandle(ref, () => ({
    spin(winner, done) {
      const { slotW, floorY, pegs, W } = geomRef.current;
      const draw = drawRef.current;
      const w = pool.indexOf(winner);
      const targetX = clamp(w * slotW + slotW / 2, BR + 2, W - BR - 2);
      const ball = {
        x: clamp(targetX + rand(-W / 4, W / 4), 30, W - 30),
        y: 8,
        vx: rand(-40, 40),
        vy: 0,
      };
      ballRef.current = ball;
      settledIdxRef.current = -1;
      let lastT = performance.now();
      let doneCalled = false;
      const startT = lastT;
      let maxY = ball.y;
      let lastProgressT = lastT;
      let ghostUntil = 0;

      const settle = () => {
        ball.x = targetX;
        ball.y = floorY - BR - 2;
        ball.vx = 0;
        ball.vy = 0;
        settledIdxRef.current = w;
        draw();
        if (!doneCalled) {
          doneCalled = true;
          sClunk(muted);
          setTimeout(done, 600);
        }
      };

      const step = (now) => {
        const dt = clamp((now - lastT) / 1000, 0.005, 0.03);
        lastT = now;
        if (now - startT > 9000) {
          settle();
          return;
        }
        if (ball.y > maxY + 4) {
          maxY = ball.y;
          lastProgressT = now;
        } else if (now - lastProgressT > 900) {
          ghostUntil = now + 300;
          ball.vy = Math.max(ball.vy, 240);
          ball.vx = (targetX > ball.x ? 1 : -1) * rand(60, 130);
          lastProgressT = now;
        }
        ball.vy += 1300 * dt;
        const depth = clamp(ball.y / floorY, 0, 1);
        ball.vx += (targetX - ball.x) * depth * depth * 4.5 * dt * 10;
        ball.vx *= Math.exp(-1.5 * dt);
        ball.vx = clamp(ball.vx, -350, 350);
        ball.x += ball.vx * dt;
        ball.y += ball.vy * dt;

        if (ball.x < BR) {
          ball.x = BR;
          ball.vx = Math.abs(ball.vx) * 0.6;
        }
        if (ball.x > W - BR) {
          ball.x = W - BR;
          ball.vx = -Math.abs(ball.vx) * 0.6;
        }

        if (now >= ghostUntil) {
          for (const pg of pegs) {
            const dx = ball.x - pg.x;
            const dy = ball.y - pg.y;
            const d2 = dx * dx + dy * dy;
            const rr = BR + PR;
            if (d2 < rr * rr && d2 > 0.01) {
              const d = Math.sqrt(d2);
              ball.x = pg.x + (dx / d) * rr;
              ball.y = pg.y + (dy / d) * rr;
              if (ball.vy > 60) sTick(muted);
              if (dy < -1) {
                ball.vy = -Math.abs(ball.vy) * rand(0.25, 0.45);
                const towards = Math.sign(targetX - ball.x) || (Math.random() < 0.5 ? -1 : 1);
                const dir = Math.random() < 0.78 ? towards : -towards;
                ball.vx = dir * rand(70, 190);
              } else {
                ball.vy = Math.max(ball.vy * 0.5, 60);
              }
            }
          }
        }

        if (ball.y > floorY - BR - 2) {
          ball.y = floorY - BR - 2;
          ball.vx = 0;
          if (Math.abs(ball.x - targetX) > 3) {
            ball.x += clamp((targetX - ball.x) * 0.55, -34, 34);
            ball.vy = -120;
          } else if (Math.abs(ball.vy) > 130) {
            ball.vy = -Math.abs(ball.vy) * 0.4;
            sClunk(muted);
          } else {
            settle();
            return;
          }
        }
        draw();
        rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    },
    destroy() {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
  }));

  return <div className="wheel-stage-inner" ref={stageRef} />;
});

export default PlinkoMode;
