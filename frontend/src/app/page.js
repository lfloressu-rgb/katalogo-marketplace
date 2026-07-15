import Link from 'next/link';
import HeroSection from '@/components/HeroSection';

export default async function Home() {
  // Fetch products from backend
  let trendingProducts = [];
  try {
    const res = await fetch('http://10.159.200.34/api/productos', { cache: 'no-store' });
    if (res.ok) {
      trendingProducts = await res.json();
    }
  } catch (err) {
    console.error('Error fetching products:', err);
  }

  // Fetch categories from backend
  let categories = [];
  try {
    const res = await fetch('http://10.159.200.34/api/productos/categorias', { cache: 'no-store' });
    if (res.ok) {
      categories = await res.json();
    }
  } catch (err) {
    console.error('Error fetching categories:', err);
  }

  // Fetch stats from backend
  let stats = null;
  try {
    const res = await fetch('http://10.159.200.34/api/productos/stats', { cache: 'no-store' });
    if (res.ok) {
      stats = await res.json();
    }
  } catch (err) {
    console.error('Error fetching stats:', err);
  }

  // Fallback to minimal mock data if backend fails
  if (trendingProducts.length === 0) {
    trendingProducts = [
      { id: 'mock1', nombre: 'Bolso de Cuero Atelier', precio: 450.00, categoria: 'MODA', descripcion_detallada: 'Diseño elegante y artesanal con acabados premium.', imagen_url: '👜' },
    ];
  }

  if (categories.length === 0) {
    categories = [{ nombre: 'Moda', icon: '👗' }];
  }

  return (
    <>
      <HeroSection stats={stats} featuredProducts={trendingProducts} />

      <div className="section-header">
        <div className="section-title-wrap">
          <h2>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
            Colecciones en Tendencia
          </h2>
          <p>Los artículos más populares de nuestro catálogo diverso.</p>
        </div>
        <Link href="/tendencias" className="link-all">VER TODAS <span>&rarr;</span></Link>
      </div>

      <div className="products-grid">
        {trendingProducts.map((product) => (
          <Link href={`/producto/${product.id}`} key={product.id} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="product-card">
              <div className="product-image">
                <span className="category-tag">{product.categoria || 'N/A'}</span>
                {product.imagen_url && product.imagen_url.startsWith('http') ? (
                  <img src={product.imagen_url} alt={product.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '80px' }}>{product.imagen_url || '📦'}</span>
                )}
              </div>
              <div className="product-info">
                <h3 className="product-title">{product.nombre}</h3>
                <p className="product-desc">{product.descripcion_detallada}</p>
                <div className="product-footer">
                  <div>
                    <span className="price-label">Precio</span>
                    <div className="product-price">S/ {Number(product.precio).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                  </div>
                  <button className="cart-btn" aria-label="Añadir al carrito">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="categories-section">
        <h2>Explorar por Categoría</h2>
        <div className="categories-grid">
          {categories.map((cat, idx) => (
            <Link href={`/categoria/${(cat.nombre || cat.name).toLowerCase()}`} key={idx} className="category-pill">
              <span>{cat.icon || '🛍️'}</span> {cat.nombre || cat.name}
            </Link>
          ))}
        </div>
      </div>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">Katalogo</div>
          <div className="footer-links">
            <Link href="/terminos">Términos de Servicio</Link>
            <Link href="/privacidad">Política de Privacidad</Link>
            <Link href="/guia">Guía del Vendedor</Link>
            <Link href="/ayuda">Centro de Ayuda</Link>
          </div>
          <div className="copyright">© 2026 Katalogo. Todos los derechos reservados.</div>
        </div>
      </footer>
    </>
  );
}
