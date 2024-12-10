import React, { useEffect, useRef } from 'react';
import { useThemeStore } from '../../store/themeStore';
import { themes } from '../../constants/theme';

const MatrixBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentTheme } = useThemeStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Matrix characters
    const chars = '01';
    const fontSize = 10;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    // Animation
    let animationFrame: number;
    const draw = () => {
      const color = themes[currentTheme].primary;
      ctx.fillStyle = `rgba(0, 0, 0, 0.05)`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = color;
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        
        ctx.fillText(char, x, y);

        if (y > canvas.height && Math.random() > 0.99) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      animationFrame = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrame);
    };
  }, [currentTheme]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-20"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default MatrixBackground;