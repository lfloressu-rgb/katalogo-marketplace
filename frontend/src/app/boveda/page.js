import Link from 'next/link';

export default function Boveda() {
  return (
    <div className="main-content" style={{ padding: '60px 30px', textAlign: 'center' }}>
      <h1 className="hero-title">La <span>Bóveda</span></h1>
      <p className="hero-desc" style={{ margin: '0 auto 40px', maxWidth: '600px' }}>
        Accede a productos exclusivos, ediciones limitadas y ofertas secretas solo para miembros.
      </p>
      
      <div className="products-grid" style={{ marginTop: '40px' }}>
        {/* Aquí se cargarán los productos exclusivos en el futuro */}
        <div style={{ padding: '40px', border: '1px dashed #ccc', borderRadius: '12px', gridColumn: '1 / -1', background: '#111827', color: '#fff' }}>
          <p>Se requiere nivel VIP para ver el contenido de la bóveda.</p>
        </div>
      </div>
    </div>
  );
}
