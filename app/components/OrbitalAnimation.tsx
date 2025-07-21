import React, { useEffect, useRef, useState } from 'react';

type Item = {
  id: number;
  src?: string;
  color?: string;
  size?: number;
  angle: number;
  radius: number;
};

const OrbitalAnimation: React.FC = () => {
  const [stage, setStage] = useState<'idle' | 'rotate' | 'in' | 'out'>('idle');
  const [cycleCount, setCycleCount] = useState(0);
  const [angleShift, setAngleShift] = useState(0);
  const centerRef = useRef<HTMLDivElement | null>(null);

  const baseImages: Item[] = [
    { id: 1, src: '/1.jpg', angle: 0, radius: 240 },
    { id: 2, src: '/2.jpg', angle: 120, radius: 240 },
    { id: 3, src: '/3.jpg', angle: 240, radius: 240 }
  ];

  const baseBubbles: Item[] = [
    { id: 4, color: 'bg-green-400', size: 40, angle: 45, radius: 200 },
    { id: 5, color: 'bg-yellow-400', size: 48, angle: 135, radius: 200 },
    { id: 6, color: 'bg-purple-400', size: 44, angle: 225, radius: 200 },
    { id: 7, color: 'bg-cyan-400', size: 36, angle: 315, radius: 200 }
  ];

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];

    const runCycle = () => {
      setStage('rotate');
      setAngleShift((prev) => prev + 15);

      timeouts.push(setTimeout(() => {
        setStage('in');
      }, 1000)); // after rotation

      timeouts.push(setTimeout(() => {
        setStage('out');
        setCycleCount((prev) => prev + 1);
      }, 4000)); // after move to center

      timeouts.push(setTimeout(() => {
        setStage('idle');
      }, 7000)); // reset
    };

    runCycle();
    const interval = setInterval(runCycle, 7000);

    return () => {
      timeouts.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, []);

  const getPosition = (angleDeg: number, radius: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    const x = Math.cos(rad) * radius;
    const y = Math.sin(rad) * radius;
    return { x, y };
  };

  const effectiveAngle = (base: number) =>
    ((cycleCount % 2 === 0 ? base : (base + 180)) + angleShift) % 360;

  const modifiedImages = baseImages.map((img) => ({
    ...img,
    angle: effectiveAngle(img.angle)
  }));

  const modifiedBubbles = baseBubbles.map((b) => ({
    ...b,
    angle: effectiveAngle(b.angle)
  }));

  return (
    <div className="relative w-[800px] h-[800px] overflow-hidden rounded-xl shadow-lg flex justify-center">
      <div className="relative w-[600px] h-[600px]">
        <div className="absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2" ref={centerRef}>
          <div className="w-28 h-28 p-4 bg-white rounded-3xl flex items-center justify-center shadow-2xl transition-transform duration-[3000ms]">
            <div className="text-4xl animate-pulse">
              <img src='/4.png' alt="images" className="w-full h-full object-cover" />
            </div>
          </div>
          {stage === 'in' && (
            <div className="absolute inset-0 bg-red-500 rounded-2xl opacity-20 animate-ping" />
          )}
        </div>

        {modifiedImages.map((item) => {
          const radius = stage === 'in' ? 0 : item.radius;
          const { x, y } = getPosition(item.angle, radius);
          return (
            <div
              key={item.id}
              className="absolute z-10 w-14 h-14 p-2 rounded-2xl overflow-hidden shadow-lg bg-white transition-all duration-[1000ms]"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(${x}px, ${y}px)`
              }}
            >
              <img src={item.src} alt={`person-${item.id}`} className="w-full h-full object-cover rounded-full" />
            </div>
          );
        })}

        {modifiedBubbles.map((bubble) => {
          const radius = stage === 'out' ? 0 : bubble.radius;
          const { x, y } = getPosition(bubble.angle, radius);
          return (
            <div
              key={bubble.id}
              className={`absolute ${bubble.color} rounded-full transition-all duration-[1000ms]`}
              style={{
                width: bubble.size,
                height: bubble.size,
                left: '50%',
                top: '50%',
                transform: `translate(${x}px, ${y}px)`,
                filter: 'blur(5px)',
                boxShadow: '0 0 15px rgba(0,0,0,0.1)',
                opacity: 0.6
              }}
            />
          );
        })}

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`w-72 h-72 border border-white/10 rounded-full transition-all duration-[1000ms] ${
            stage === 'in' ? 'scale-75 opacity-30' : 'scale-100 opacity-10'
          }`} />
          <div className={`absolute w-48 h-48 border border-white/5 rounded-full transition-all duration-[1000ms] ${
            stage === 'in' ? 'scale-50 opacity-20' : 'scale-100 opacity-5'
          }`} />
        </div>
      </div>
    </div>
  );
};

export default OrbitalAnimation;
