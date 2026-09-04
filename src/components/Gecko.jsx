import { useEffect, useRef, useState } from 'react';
import './Gecko.css';

const APPEAR_DELAY_MS = 6000; // ждём несколько секунд после старта отсчёта
const CRAWL_DURATION_MS = 1800; // совпадает с transition в Gecko.css
const MARGIN = { top: 90, right: 24, bottom: 48, left: 24 };

const randomBetween = (min, max) => min + Math.random() * (max - min);

const randomSpot = () => ({
  x: randomBetween(MARGIN.left, Math.max(MARGIN.left + 1, window.innerWidth - MARGIN.right)),
  y: randomBetween(MARGIN.top, Math.max(MARGIN.top + 1, window.innerHeight - MARGIN.bottom)),
});

/* Точка у самого края экрана — сюда геккон "прячется". */
const edgeSpot = () => {
  const h = window.innerHeight;
  const onLeft = Math.random() < 0.5;
  return {
    x: onLeft ? -6 : window.innerWidth - 18,
    y: randomBetween(MARGIN.top, Math.max(MARGIN.top + 1, h - MARGIN.bottom)),
  };
};

/* Маленький декоративный геккон: появляется через несколько секунд
   после начала отсчёта, бродит по странице, иногда замирает и как
   будто смотрит на пользователя, иногда прячется у края экрана.
   Полностью отключается при prefers-reduced-motion — блуждающая
   по экрану фауна как раз то, что таким пользователям мешает. */
export const Gecko = ({ active }) => {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState(() => ({ x: -20, y: -20 }));
  const [pose, setPose] = useState('crawl'); // 'crawl' | 'idle' | 'look' | 'hide'
  const [facing, setFacing] = useState(1); // 1 = вправо, -1 = влево
  const posRef = useRef(pos);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    clearTimeout(timeoutRef.current);

    if (!active || reducedMotion) {
      setVisible(false);
      return undefined;
    }

    timeoutRef.current = setTimeout(() => setVisible(true), APPEAR_DELAY_MS);
    return () => clearTimeout(timeoutRef.current);
  }, [active]);

  useEffect(() => {
    if (!visible) return undefined;
    let cancelled = false;

    const moveOnce = () => {
      const toEdge = Math.random() < 0.25;
      const next = toEdge ? edgeSpot() : randomSpot();

      setFacing(next.x >= posRef.current.x ? 1 : -1);
      posRef.current = next;
      setPos(next);
      setPose('crawl');

      timeoutRef.current = setTimeout(() => {
        if (cancelled) return;
        setPose(toEdge ? 'hide' : Math.random() < 0.45 ? 'look' : 'idle');

        timeoutRef.current = setTimeout(() => {
          if (!cancelled) moveOnce();
        }, randomBetween(2200, 4200));
      }, CRAWL_DURATION_MS);
    };

    moveOnce();
    return () => {
      cancelled = true;
      clearTimeout(timeoutRef.current);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={`gecko gecko-${pose}`}
      style={{ transform: `translate(${pos.x}px, ${pos.y}px) scaleX(${facing})` }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 64 34" width="34" height="18">
        <path
          className="gecko-tail"
          d="M4 22 C 10 26, 14 18, 20 20"
          fill="none"
          stroke="#6b5642"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <ellipse cx="38" cy="18" rx="16" ry="7" fill="#8a7355" />
        <ellipse cx="38" cy="20" rx="13" ry="4" fill="#a9906f" opacity="0.6" />
        <circle cx="54" cy="14" r="7" fill="#8a7355" />
        <circle className="gecko-eye" cx="57" cy="12" r="1.3" fill="#241f18" />
        <g className="gecko-legs" stroke="#6b5642" strokeWidth="2.4" strokeLinecap="round">
          <path d="M30 23 L26 30" />
          <path d="M44 23 L47 30" />
          <path d="M30 13 L25 8" />
          <path d="M46 13 L51 8" />
        </g>
      </svg>
    </div>
  );
};

export default Gecko;
