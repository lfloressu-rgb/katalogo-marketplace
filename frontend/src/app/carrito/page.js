'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CarritoPage() {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(savedCart);
    calculateTotal(savedCart);
  }, []);

  const calculateTotal = (items) => {
    const sum = items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    setTotal(sum);
  };

  const removeFromCart = (cartItemId) => {
    const newCart = cart.filter(item => (item.cartItemId || item.id) !== cartItemId);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    calculateTotal(newCart);
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h1 className="section-title">Tu <strong>Carrito de Compras</strong></h1>
      
      {cart.length === 0 ? (
        <div style={{ backgroundColor: 'var(--glass-bg)', padding: '60px', borderRadius: '16px', boxShadow: 'var(--float-shadow)', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>🛒</div>
          <p style={{ fontSize: '20px', color: 'var(--text-secondary)', marginBottom: '30px' }}>Tu carrito está vacío</p>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <button className="btn-primary">Descubrir productos</button>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
          <div style={{ flex: 2, backgroundColor: 'var(--glass-bg)', borderRadius: '16px', padding: '30px', boxShadow: 'var(--float-shadow)', backdropFilter: 'blur(10px)' }}>
            {cart.map((item) => (
              <div key={item.id} style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px', marginBottom: '20px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '120px', height: '120px', marginRight: '20px', backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: '12px', padding: '10px', border: '1px solid var(--glass-border)' }}>
                  {(item.imagen_url && (item.imagen_url.startsWith('http') || item.imagen_url.startsWith('blob') || item.imagen_url.startsWith('data')))
                    ? <img src={item.imagen_url} alt={item.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                    : <span style={{ fontSize: '60px' }}>{item.imagen_url || '📦'}</span>
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{item.nombre}</h3>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Vendido por {item.tienda_id ? `Tienda ID ${item.tienda_id}` : 'la tienda'}
                  </div>
                  {item.varianteSeleccionada && (
                    <div style={{ fontSize: '13px', color: '#4facfe', marginTop: '4px' }}>
                      Variante: {item.varianteSeleccionada.color || ''} {item.varianteSeleccionada.talla || ''}
                    </div>
                  )}
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Cantidad: {item.cantidad}</div>
                  <div style={{ color: '#e74c3c', fontSize: '14px', marginTop: '10px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => removeFromCart(item.cartItemId || item.id)}>
                    Eliminar
                  </div>
                </div>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  S/ {Number(item.precio * item.cantidad).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ flex: 1, backgroundColor: 'var(--glass-bg)', borderRadius: '16px', padding: '30px', boxShadow: 'var(--float-shadow)', position: 'sticky', top: '100px', backdropFilter: 'blur(10px)' }}>
            <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px', marginBottom: '20px', fontSize: '20px', color: 'var(--text-primary)' }}>Resumen de compra</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: 'var(--text-secondary)' }}>
              <span>Productos ({cart.length})</span>
              <span>S/ {total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', color: '#00a650', fontWeight: 'bold' }}>
              <span>Envío</span>
              <span>Gratis</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', fontSize: '24px', fontWeight: 'bold', borderTop: '1px solid var(--glass-border)', paddingTop: '20px', color: 'var(--text-primary)' }}>
              <span>Total</span>
              <span>S/ {total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            
            <Link href="/checkout" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ width: '100%' }}>
                Continuar compra
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
