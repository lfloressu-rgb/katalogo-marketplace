'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function HeroSection({ stats, featuredProducts = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (featuredProducts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredProducts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [featuredProducts]);

  const currentProduct = featuredProducts[currentIndex];
  return (
    <div className="hero-section">
      <div className="hero-content">
        <span className="badge">● MERCADO GLOBAL</span>
        <h1 className="hero-title">
          Todo lo que imaginas, en <span>un solo lugar</span>
        </h1>
        <p className="hero-desc">
          Experimenta un mercado fluido diseñado para productos de moda,
          hogar, tecnología y estilo de vida. La mejor selección con calidad inigualable.
        </p>
        <div className="hero-actions">
          <Link href="/explorar" className="btn-primary">Explorar Ahora</Link>
          <Link href="/registro" className="btn-outline">Crear Cuenta</Link>
        </div>
        
        <div className="hero-stats">
          <div className="stat-item">
            <h3>{stats?.productos ? stats.productos : '24M+'}</h3>
            <p>PRODUCTOS</p>
          </div>
          <div className="stat-item">
            <h3>{stats?.marcas ? stats.marcas : '140k'}</h3>
            <p>MARCAS</p>
          </div>
        </div>
      </div>
      
      <div className="hero-image-container">
        {currentProduct ? (
          <div key={currentProduct.id} className="hero-card" style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '12px', background: 'rgba(255,255,255,0.05)' }}>
              {currentProduct.imagen_url && currentProduct.imagen_url.startsWith('http') ? (
                <img src={currentProduct.imagen_url} alt={currentProduct.nombre} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <span style={{ fontSize: '100px' }}>{currentProduct.imagen_url || '📦'}</span>
              )}
            </div>
            <div className="hero-price-tag" style={{ marginTop: '20px' }}>
              <div className="price-info">
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>{currentProduct.nombre}</span>
                <strong>
                  S/ {Number(currentProduct.precio).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </strong>
              </div>
              <Link href={`/producto/${currentProduct.id}`} className="btn-outline" style={{ background: '#f3f4f6', color: '#111827', border: 'none', textDecoration: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold' }}>VER</Link>
            </div>
          </div>
        ) : (
          <div className="hero-card">
            <div className="hero-price-tag">
              <div className="price-info">
                <span>Precio Especial</span>
                <strong>S/ 299.99</strong>
              </div>
              <button className="btn-outline" style={{ background: '#f3f4f6', color: '#111827', border: 'none' }}>COMPRAR</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
