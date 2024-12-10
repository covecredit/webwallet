import React, { useEffect, useRef } from 'react';

const FractalBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const drawFractal = (x: number, y: number, size: number, depth: number) => {
      if (depth <= 0 || size < 1) return;

      const opacity = depth * 0.1;
      const gradient = ctx.createLinearGradient(x - size, y - size, x + size, y + size);
      gradient.addColorStop(0, `rgba(255, 215, 0, ${opacity * 0.3})`);
      gradient.addColorStop(1, `rgba(230, 232, 230, ${opacity * 0.3})`);
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = depth * 0.5;

      ctx.beginPath();
      ctx.moveTo(x - size, y - size);
      ctx.lineTo(x + size, y - size);
      ctx.lineTo(x + size, y + size);
      ctx.lineTo(x - size, y + size);
      ctx.lineTo(x - size, y - size);
      ctx.stroke();

      drawFractal(x - size/2, y - size/2, size/2, depth - 1);
      drawFractal(x + size/2, y - size/2, size/2, depth - 1);
      drawFractal(x + size/2, y + size/2, size/2, depth - 1);
      drawFractal(x - size/2, y + size/2, size/2, depth - 1);
    };

    const animate = () => {
      ctx.fillStyle = '#1A1B26';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const size = Math.min(canvas.width, canvas.height) / 4;
      
      drawFractal(centerX, centerY, size, 5);
      requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
    />
  );
};

export default FractalBackground;