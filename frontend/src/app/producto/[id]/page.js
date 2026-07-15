import ProductPurchase from '@/components/ProductPurchase';
import Link from 'next/link';
import FavoriteButton from '@/components/FavoriteButton';
import ProductReviews from '@/components/ProductReviews';

export default async function ProductoPage({ params }) {
  const { id } = await params;

  let product = null;
  try {
    const res = await fetch(`http://10.159.200.34/api/productos/${id}`, { 
      cache: 'no-store' 
    });
    if (res.ok) {
      product = await res.json();
    }
  } catch (error) {
    console.error('Error fetching product details:', error);
  }

  if (!product) {
    return <div style={{ textAlign: 'center', marginTop: '100px', fontSize: '24px' }}>Producto no encontrado 😕</div>;
  }

  const { imagenes, variantes, tienda, condicion } = product;
  const imagenPrincipal = imagenes.find(img => img.es_principal) || imagenes[0];
  const imagenesSecundarias = imagenes.filter(img => !img.es_principal);

  return (
    <div style={{ marginTop: '30px' }}>
      
      {/* Breadcrumb simulado */}
      <div style={{ fontSize: '13px', color: '#7f8c8d', marginBottom: '20px' }}>
        <Link href="/" style={{ color: '#4facfe', textDecoration: 'none' }}>Inicio</Link> &gt; {product.nombre}
      </div>

      <div style={{ display: 'flex', gap: '40px', backgroundColor: 'var(--glass-bg)', backdropFilter: 'blur(10px)', padding: '40px', borderRadius: '16px', boxShadow: 'var(--float-shadow)' }}>
        
        {/* Columna Izquierda: Galería */}
        <div style={{ flex: 1 }}>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: '12px', minHeight: '450px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)' }}>
            {imagenPrincipal?.url?.startsWith('http') ? (
              <img src={imagenPrincipal.url} alt={product.nombre} style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }} />
            ) : (
              <span style={{ fontSize: '200px', textShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>{imagenPrincipal?.url || '📦'}</span>
            )}
          </div>
          {/* Miniaturas */}
          <div style={{ display: 'flex', gap: '15px' }}>
            {imagenesSecundarias.length > 0 && imagenesSecundarias.map((img, index) => (
              <div key={index} style={{ width: '80px', height: '80px', backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid var(--glass-border)' }}>
                {img.url.startsWith('http') ? <img src={img.url} alt="miniatura" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} /> : <span style={{ fontSize: '30px' }}>{img.url}</span>}
              </div>
            ))}
          </div>
        </div>
        
        {/* Columna Derecha: Información y Compra */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ fontSize: '12px', color: '#7f8c8d', marginBottom: '5px' }}>
            {condicion === 'NUEVO' ? 'Nuevo' : 'Usado'} | Vendido por <strong style={{ color: '#4facfe' }}>{tienda}</strong>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
            <h1 style={{ fontSize: '32px', color: 'var(--text-primary)', fontWeight: '700', lineHeight: '1.2', margin: 0 }}>
              {product.nombre}
            </h1>
            <FavoriteButton productoId={product.id} />
          </div>
          
          <div style={{ fontSize: '42px', fontWeight: '800', marginBottom: '15px', background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            S/ {Number(product.precio).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          
          {product.precio_oferta && (
            <div style={{ fontSize: '18px', color: '#e74c3c', textDecoration: 'line-through', marginBottom: '15px' }}>
              S/ {Number(product.precio_oferta).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          )}

          <p style={{ color: '#00a650', fontWeight: '600', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🚀 Llega gratis mañana
          </p>
          
          <div style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '40px', fontSize: '15px' }}>
            {product.descripcion_detallada || product.descripcion_corta}
          </div>
          
          <ProductPurchase product={product} />
        </div>
      </div>
      
      {/* Sección de Opiniones Real */}
      <ProductReviews 
        productoId={product.id} 
        initialRating={product.rating} 
        initialReviews={product.valoraciones_lista} 
      />
    </div>
  );
}
