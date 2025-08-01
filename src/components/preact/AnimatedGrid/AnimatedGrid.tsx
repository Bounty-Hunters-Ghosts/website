import { useEffect, useState, useRef, useCallback } from 'preact/hooks';
import './AnimatedGrid.scss';

type Direction = 'horizontal' | 'vertical';
type AnimationDirection = 'normal' | 'reverse';

interface Pulse {
  id: number;
  direction: Direction;
  lineIndex: number;
  animationDirection: AnimationDirection;
  animationDelay: number;
  color: string;
}

const MIN_PULSES = 3;
const MAX_PULSES = 8;
const ANIMATION_DURATION = 5;

export default function AnimatedGrid() {
  const idCounter = useRef(0);
  const [gridSize, setGridSize] = useState<number>(48);
  const [pulseSize, setPulseSize] = useState<number>(24);
  const [pulseThickness, setPulseThickness] = useState<number>(1);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  const [pulses, setPulses] = useState<Pulse[]>([]);

  const greenColor = 'rgba(0, 255, 0, 0.8)';
  const redColor = 'rgba(255, 0, 0, 0.8)';

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--grid-size', `${gridSize}px`);
    root.style.setProperty('--pulse-size', `${pulseSize}px`);
    root.style.setProperty('--pulse-thickness', `${pulseThickness}px`);
  }, [gridSize, pulseSize, pulseThickness]);

  useEffect(() => {
    function handleResize() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let newGridSize = Math.min(Math.max(vw * 0.04, 24), 64);
      let newPulseSize = newGridSize / 2;
      let newPulseThickness = newGridSize / 48;

      setGridSize(newGridSize);
      setPulseSize(newPulseSize);
      setPulseThickness(newPulseThickness);
      setWindowWidth(vw);
      setWindowHeight(vh);
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function getLineCount(direction: Direction) {
    if (direction === 'horizontal') {
      return Math.floor(windowHeight / gridSize);
    } else {
      return Math.floor(windowWidth / gridSize);
    }
  }

  function createPulse(): Pulse {
    const direction: Direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';
    const count = getLineCount(direction);
    const lineIndex = Math.floor(Math.random() * count);
    const animationDirection: AnimationDirection = Math.random() < 0.5 ? 'normal' : 'reverse';
    const animationDelay = Math.random() * ANIMATION_DURATION;
    const color = Math.random() < 0.1 ? redColor : greenColor; // 10% chance red, else green

    return {
      id: idCounter.current++,
      direction,
      lineIndex,
      animationDirection,
      animationDelay,
      color,
    };
  }

  useEffect(() => {
    if (gridSize) {
      const initialCount = Math.floor(Math.random() * (MAX_PULSES - MIN_PULSES + 1)) + MIN_PULSES;
      setPulses(Array.from({ length: initialCount }, () => createPulse()));
    }
  }, [gridSize, windowWidth, windowHeight]);

  const handleRef = useCallback(
    (id: number) => (el: HTMLElement | null) => {
      if (!el) return;

      function onAnimationIteration() {
        setPulses((currentPulses) =>
          currentPulses.map((pulse) =>
            pulse.id === id ? createPulse() : pulse
          )
        );
      }

      el.addEventListener('animationiteration', onAnimationIteration);

      return () => {
        el.removeEventListener('animationiteration', onAnimationIteration);
      };
    },
    [gridSize, windowWidth, windowHeight]
  );

  return (
    <>
      {pulses.map((pulse) => {
        const style: Record<string, string> = {};
        let pulseClass = 'pulse';

        if (pulse.direction === 'horizontal') {
          style.top = `${pulse.lineIndex * gridSize + gridSize / 2 - 1}px`;
          style.left = '0px';
          style.width = `${pulseSize}px`;
          style.height = `${pulseThickness}px`;
          pulseClass += ' horizontal';

          style.background = `linear-gradient(to right, transparent 0%, ${pulse.color} 40%, ${pulse.color} 60%, transparent 100%)`;
        } else {
          style.left = `${pulse.lineIndex * gridSize + gridSize / 2 - 2}px`;
          style.top = '0px';
          style.width = `${pulseThickness}px`;
          style.height = `${pulseSize}px`;
          pulseClass += ' vertical';

          style.background = `linear-gradient(to bottom, transparent 0%, ${pulse.color} 40%, ${pulse.color} 60%, transparent 100%)`;
        }

        const animNamePrefix = pulse.direction === 'horizontal' ? 'pulse-horizontal' : 'pulse-vertical';
        const animName = pulse.animationDirection === 'normal' ? animNamePrefix : `${animNamePrefix}-reverse`;

        style.animation = `${animName} ${ANIMATION_DURATION}s linear infinite`;
        style.animationDelay = `${pulse.animationDelay}s`;
        style.animationFillMode = 'none';

        style.filter = `drop-shadow(0 0 8px ${pulse.color}) drop-shadow(0 0 16px ${pulse.color}) drop-shadow(0 0 32px ${pulse.color})`;

        return (
          <div
            key={pulse.id}
            className={pulseClass}
            style={style}
            ref={handleRef(pulse.id)}
          />
        );
      })}
    </>
  );
}
