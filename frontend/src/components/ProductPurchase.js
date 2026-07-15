'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProductPurchase({ product }) {
  const router = useRouter();
  
  // Si hay variantes, selecciona la primera por defecto
  const [selectedVariant, setSelectedVariant] = useState(
    product.variantes && product.variantes.length > 0 ? product.variantes[0] : null
  );
  
  const [cantidad, setCantidad] = useState(1);
  const [added, setAdded] = useState(false);
  const [userRole, setUserRole] = useState(null);
  
  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      const parsedUser = JSON.parse(userString);
      setUserRole(parsedUser.rol);
    }
  }, []);

  const canPurchase = !userRole || userRole === 'CLIENTE';

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Identificador único para el producto en el carrito (incluye ID de variante si existe)
    const cartItemId = selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id.toString();
    
    const existingIndex = cart.findIndex(item => item.cartItemId === cartItemId);
    
    if (existingIndex >= 0) {
      cart[existingIndex].cantidad += cantidad;
    } else {
      cart.push({ 
        ...product, 
        cartItemId, 
        cantidad,
        varianteSeleccionada: selectedVariant 
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Disparar evento para que el contador global del nav (si existe) se actualice
    window.dispatchEvent(new Event('cartUpdated'));
    
    setAdded(true);
  };

  const maxStock = selectedVariant ? selectedVariant.stock : (product.stock || 10);

  return (
    <div>
      {/* Variantes (Talla/Color) */}
      {product.variantes && product.variantes.length > 0 && (
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>Selecciona una opción:</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {product.variantes.map(v => (
              <div 
                key={v.id} 
                onClick={() => { setSelectedVariant(v); setCantidad(1); setAdded(false); }}
                style={{ 
                  padding: '8px 16px', 
                  border: selectedVariant?.id === v.id ? '2px solid #4facfe' : '1px solid #ccc', 
                  borderRadius: '20px', 
                  fontSize: '14px', 
                  color: selectedVariant?.id === v.id ? '#4facfe' : '#555',
                  backgroundColor: selectedVariant?.id === v.id ? 'rgba(79, 172, 254, 0.1)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {v.color || ''} {v.talla || ''} {v.stock === 0 ? '(Agotado)' : ''}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cantidad */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>Cantidad:</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}>
            <button 
              onClick={() => { setCantidad(Math.max(1, cantidad - 1)); setAdded(false); }}
              style={{ padding: '10px 15px', border: 'none', background: '#f5f5f5', cursor: 'pointer', fontSize: '18px' }}
            >-</button>
            <span style={{ padding: '0 20px', fontWeight: 'bold' }}>{cantidad}</span>
            <button 
              onClick={() => { setCantidad(Math.min(maxStock, cantidad + 1)); setAdded(false); }}
              style={{ padding: '10px 15px', border: 'none', background: '#f5f5f5', cursor: 'pointer', fontSize: '18px' }}
            >+</button>
          </div>
          <span style={{ fontSize: '14px', color: '#7f8c8d' }}>
            {maxStock} disponibles
          </span>
        </div>
      </div>

      {!added ? (
        <button 
          onClick={handleAddToCart}
          disabled={maxStock === 0 || !canPurchase}
          className="btn-primary"
          style={{ width: '100%', opacity: (maxStock === 0 || !canPurchase) ? 0.5 : 1, cursor: (maxStock === 0 || !canPurchase) ? 'not-allowed' : 'pointer' }}
        >
          {!canPurchase ? 'Solo clientes pueden comprar' : (maxStock === 0 ? 'Agotado' : 'Agregar al carrito')}
        </button>
      ) : (
        <div style={{ background: 'rgba(0, 166, 80, 0.1)', padding: '20px', borderRadius: '12px', border: '1px solid #00a650', textAlign: 'center' }}>
          <div style={{ color: '#00a650', fontWeight: 'bold', marginBottom: '15px', fontSize: '16px' }}>
            ✅ ¡Producto añadido con éxito!
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => router.push('/')}
              style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #4facfe', background: 'transparent', color: '#4facfe', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Seguir comprando
            </button>
            <button 
              onClick={() => router.push('/carrito')}
              style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#4facfe', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Ir al Carrito
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
