import Link from 'next/link';

export default async function BuscarPage({ searchParams }) {
  const query = searchParams?.q || '';
  
  let products = [];
  try {
    const res = await fetch(`http://localhost:5000/api/productos?search=${encodeURIComponent(query)}`, { 
      cache: 'no-store' 
    });
    if (res.ok) {
      products = await res.json();
    }
  } catch (error) {
    console.error('Error fetching search results:', error);
  }

  return (
    <div style={{ marginTop: '30px' }}>
      <h2 className="section-title">
        Resultados para: <strong>{query}</strong>
      </h2>

      <div style={{ display: 'flex', gap: '30px' }}>
        
        {/* Sidebar de Filtros Avanzados (UI) */}
        <aside style={{ width: '250px', flexShrink: 0, backgroundColor: 'var(--glass-bg)', padding: '25px', borderRadius: '16px', boxShadow: 'var(--float-shadow)', height: 'fit-content' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '20px', color: 'var(--text-primary)' }}>Filtros</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--text-secondary)' }}>Condición</h4>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', cursor: 'pointer' }}><input type="checkbox" /> Nuevo</label>
            <label style={{ display: 'block', fontSize: '14px', cursor: 'pointer' }}><input type="checkbox" /> Usado</label>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--text-secondary)' }}>Precio</h4>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="number" placeholder="Mín" style={{ width: '100%', padding: '8px', border: '1px solid var(--glass-border)', borderRadius: '6px', background: 'rgba(255,255,255,0.5)' }} />
              <input type="number" placeholder="Máx" style={{ width: '100%', padding: '8px', border: '1px solid var(--glass-border)', borderRadius: '6px', background: 'rgba(255,255,255,0.5)' }} />
            </div>
            <button className="btn-primary" style={{ width: '100%', padding: '8px', fontSize: '14px', marginTop: '10px' }}>Aplicar</button>
          </div>

          <div>
            <h4 style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--text-secondary)' }}>Beneficios</h4>
            <label style={{ display: 'block', fontSize: '14px', cursor: 'pointer' }}><input type="checkbox" /> Envío Gratis 🚀</label>
            <label style={{ display: 'block', fontSize: '14px', cursor: 'pointer', marginTop: '8px' }}><input type="checkbox" /> En Oferta 🔥</label>
          </div>
        </aside>

        {/* Grilla de Resultados */}
        <div style={{ flex: 1 }}>
          {products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px', backgroundColor: 'var(--glass-bg)', borderRadius: '16px' }}>
              No se encontraron productos para esta búsqueda.
            </div>
          ) : (
            <div className="products-grid">
              {products.map((product) => (
                <Link href={`/producto/${product.id}`} key={product.id} style={{ textDecoration: 'none' }}>
                  <div className="product-card">
                    <div className="product-image">
                      <span style={{ fontSize: '80px' }}>{product.imagen_url || '📦'}</span>
                    </div>
                    <div className="product-info">
                      <div className="product-price">$ {Number(product.precio).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                      <div className="product-title">{product.nombre}</div>
                      <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '5px' }}>Por {product.tienda || 'Tienda Oficial'}</div>
                      <div className="free-shipping">Envío gratis</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
