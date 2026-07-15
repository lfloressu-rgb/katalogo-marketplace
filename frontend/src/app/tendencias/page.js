import Link from 'next/link';

export default function Tendencias() {
  return (
    <div className="main-content" style={{ padding: '60px 30px', textAlign: 'center' }}>
      <h1 className="hero-title">Colecciones en <span>Tendencia</span></h1>
      <p className="hero-desc" style={{ margin: '0 auto 40px', maxWidth: '600px' }}>
        Los artículos más populares y buscados de nuestro catálogo. Únete a la tendencia mundial.
      </p>
      
      <div className="products-grid" style={{ marginTop: '40px' }}>
        {/* Aquí se cargarán los productos más vendidos en el futuro */}
        <div style={{ padding: '40px', border: '1px dashed #ccc', borderRadius: '12px', gridColumn: '1 / -1' }}>
          <p style={{ color: '#666' }}>Cargando tendencias globales...</p>
        </div>
      </div>
    </div>
  );
}
