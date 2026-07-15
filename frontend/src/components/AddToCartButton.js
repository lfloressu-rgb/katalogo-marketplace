'use client';

import { useRouter } from 'next/navigation';

export default function AddToCartButton({ product }) {
  const router = useRouter();

  const handleAddToCart = () => {
    // Obtener carrito actual
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Verificar si ya existe
    const existingIndex = cart.findIndex(item => item.id === product.id);
    if (existingIndex >= 0) {
      cart[existingIndex].cantidad += 1;
    } else {
      cart.push({ ...product, cantidad: 1 });
    }
    
    // Guardar
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Redirigir al carrito
    router.push('/carrito');
  };

  return (
    <button 
      onClick={handleAddToCart}
      className="btn-primary"
      style={{ width: '100%' }}
    >
      Agregar al carrito
    </button>
  );
}
