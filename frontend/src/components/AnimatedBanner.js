'use client';
import { useState, useEffect } from 'react';

const categorias = ['Tecnología', 'Moda', 'Deportes', 'Hogar', 'Calzado', 'Ofertas'];

export default function AnimatedBanner() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState('visible'); // 'visible' | 'fade-out' | 'fade-in'

  useEffect(() => {
    const interval = setInterval(() => {
      setFade('fade-out');
      
      setTimeout(() => {
        setIndex((prevIndex) => (prevIndex + 1) % categorias.length);
        setFade('fade-in');
        
        // requestAnimationFrame to allow the browser to apply the 'fade-in' class before transitioning to 'visible'
        requestAnimationFrame(() => {
          setTimeout(() => {
            setFade('visible');
          }, 50);
        });
      }, 500); // duración del fade out
    }, 3500); // tiempo de muestra de cada palabra

    return () => clearInterval(interval);
  }, []);

  let transform = 'translateY(0)';
  let opacity = 1;

  if (fade === 'fade-out') {
    transform = 'translateY(-20px)';
    opacity = 0;
  } else if (fade === 'fade-in') {
    transform = 'translateY(20px)';
    opacity = 0;
  }

  return (
    <div className="hero-banner">
      <h1>
        Descubre lo mejor en{' '}
        <span 
          style={{ 
            display: 'inline-block',
            transition: fade === 'fade-in' ? 'none' : 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            opacity: opacity,
            transform: transform,
            background: 'var(--primary-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            padding: '0 5px' // evitar recortes en la animacion
          }}
        >
          {categorias[index]}
        </span>
      </h1>
    </div>
  );
}
