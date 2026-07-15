import Link from 'next/link';

export default function Lanzamientos() {
  return (
    <div className="main-content" style={{ padding: '60px 30px', textAlign: 'center' }}>
      <h1 className="hero-title">Nuevos <span>Lanzamientos</span></h1>
      <p className="hero-desc" style={{ margin: '0 auto 40px', maxWidth: '600px' }}>
        Descubre los productos más recientes agregados a nuestro catálogo. Mantente a la vanguardia con lo último.
      </p>
      
      <div className="products-grid" style={{ marginTop: '40px' }}>
        {/* Aquí se cargarán los productos más nuevos en el futuro */}
        <div style={{ padding: '40px', border: '1px dashed #ccc', borderRadius: '12px', gridColumn: '1 / -1' }}>
          <p style={{ color: '#666' }}>Próximamente: Colección Invierno 2024</p>
        </div>
      </div>
    </div>
  );
}
