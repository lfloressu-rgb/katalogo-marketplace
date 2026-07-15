'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [metodoPago, setMetodoPago] = useState('Tarjeta');
  const [user, setUser] = useState(null);
  
  // Datos guardados
  const [tarjetasGuardadas, setTarjetasGuardadas] = useState([]);
  const [direccionesGuardadas, setDireccionesGuardadas] = useState([]);
  const [direccionSeleccionada, setDireccionSeleccionada] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    if (savedCart.length === 0) {
      router.push('/');
      return;
    }
    setCart(savedCart);
    const sum = savedCart.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    setTotal(sum);

    const userString = localStorage.getItem('user');
    if (userString) {
      const parsedUser = JSON.parse(userString);
      setUser(parsedUser);
      
      // Fetch direcciones
      fetch(`http://10.159.200.34/api/direcciones/usuario/${parsedUser.id}`)
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) {
                setDireccionesGuardadas(data);
                const principal = data.find(d => d.es_principal);
                if (principal) setDireccionSeleccionada(principal.direccion);
                else if (data.length > 0) setDireccionSeleccionada(data[0].direccion);
            }
        }).catch(err => console.error(err));
        
      // Fetch tarjetas
      fetch(`http://10.159.200.34/api/pagos/usuario/${parsedUser.id}`)
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) {
                setTarjetasGuardadas(data);
                if(data.length > 0) setMetodoPago(`TarjetaGuardada_${data[0].id}`);
            }
        }).catch(err => console.error(err));
    }
  }, [router]);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const userString = localStorage.getItem('user');
      if (!userString) {
        alert('Debes iniciar sesión para comprar');
        router.push('/login');
        return;
      }
      
      const user = JSON.parse(userString);
      if (user.rol && user.rol !== 'CLIENTE') {
        alert('Las cuentas de Tienda y Administrador no pueden realizar compras. Por favor inicia sesión como Cliente.');
        setLoading(false);
        return;
      }
      
      if (!direccionSeleccionada) {
        alert('Debes ingresar o seleccionar una dirección de envío.');
        setLoading(false);
        return;
      }
      
      // Determinar método de pago amigable
      let metodoPagoFinal = metodoPago;
      if (metodoPago.startsWith('TarjetaGuardada_')) {
          const id = metodoPago.split('_')[1];
          const tarjeta = tarjetasGuardadas.find(t => t.id == id);
          metodoPagoFinal = tarjeta ? `Tarjeta ****${tarjeta.numero_tarjeta.slice(-4)}` : 'Tarjeta Guardada';
      }
      
      // Llamada al backend de órdenes
      const res = await fetch('http://10.159.200.34/api/ordenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: user.id,
          total: total,
          items: cart,
          metodo_pago: metodoPagoFinal,
          direccion_envio: direccionSeleccionada // TODO: Backend could save this if needed
        })
      });

      if (res.ok) {
        localStorage.removeItem('cart');
        alert('¡Pago exitoso! Tu orden ha sido procesada.');
        router.push('/panel');
      } else {
        alert('Hubo un problema al procesar el pago');
      }
    } catch (error) {
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', backgroundColor: 'var(--glass-bg)', padding: '50px', borderRadius: '16px', boxShadow: 'var(--float-shadow)', backdropFilter: 'blur(10px)' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '30px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px', color: 'var(--text-primary)' }}>
        Finalizar Compra
      </h1>
      
      <div style={{ display: 'flex', gap: '40px' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '20px' }}>Resumen de productos</h3>
          <div style={{ background: 'rgba(255,255,255,0.4)', borderRadius: '12px', padding: '20px', border: '1px solid var(--glass-border)' }}>
            {cart.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: 'var(--text-primary)', borderBottom: '1px dashed #ccc', paddingBottom: '10px' }}>
                <span>{item.cantidad}x {item.nombre}</span>
                <span style={{ fontWeight: 'bold' }}>S/ {Number(item.precio * item.cantidad).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', fontSize: '22px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              <span>Total a pagar:</span>
              <span style={{ color: '#00a650' }}>S/ {total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '20px' }}>Datos de Envío y Pago</h3>
          
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Dirección de Envío</label>
            {direccionesGuardadas.length > 0 ? (
                <select value={direccionSeleccionada} onChange={e => setDireccionSeleccionada(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '10px' }}>
                    {direccionesGuardadas.map(dir => (
                        <option key={dir.id} value={dir.direccion}>{dir.direccion} ({dir.distrito}) {dir.es_principal ? '- Principal' : ''}</option>
                    ))}
                    <option value="nueva">Usar otra dirección temporal...</option>
                </select>
            ) : null}
            {(direccionesGuardadas.length === 0 || direccionSeleccionada === 'nueva') && (
                <input type="text" placeholder="Ej. Av. Principal 123, Ciudad" onChange={e => setDireccionSeleccionada(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
            )}
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>Método de Pago</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              {/* Tarjetas Guardadas */}
              {tarjetasGuardadas.map(tj => (
                  <label key={tj.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', border: metodoPago === `TarjetaGuardada_${tj.id}` ? '2px solid #4facfe' : '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', background: metodoPago === `TarjetaGuardada_${tj.id}` ? 'rgba(79, 172, 254, 0.1)' : 'transparent' }}>
                    <input type="radio" name="pago" value={`TarjetaGuardada_${tj.id}`} checked={metodoPago === `TarjetaGuardada_${tj.id}`} onChange={() => setMetodoPago(`TarjetaGuardada_${tj.id}`)} style={{ display: 'none' }} />
                    💳 {tj.tipo} **** {tj.numero_tarjeta.slice(-4)} (Termina en {tj.numero_tarjeta.slice(-4)})
                  </label>
              ))}

              {/* Nueva Tarjeta (genérica) */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', border: metodoPago === 'Tarjeta' ? '2px solid #4facfe' : '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', background: metodoPago === 'Tarjeta' ? 'rgba(79, 172, 254, 0.1)' : 'transparent' }}>
                <input type="radio" name="pago" value="Tarjeta" checked={metodoPago === 'Tarjeta'} onChange={() => setMetodoPago('Tarjeta')} style={{ display: 'none' }} />
                💳 Nueva Tarjeta de Crédito/Débito
              </label>

              {/* Otros métodos */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', border: metodoPago === 'Yape' ? '2px solid #743486' : '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', background: metodoPago === 'Yape' ? 'rgba(116, 52, 134, 0.1)' : 'transparent' }}>
                <input type="radio" name="pago" value="Yape" checked={metodoPago === 'Yape'} onChange={() => setMetodoPago('Yape')} style={{ display: 'none' }} />
                📱 Yape
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', border: metodoPago === 'Plin' ? '2px solid #00c7b1' : '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', background: metodoPago === 'Plin' ? 'rgba(0, 199, 177, 0.1)' : 'transparent' }}>
                <input type="radio" name="pago" value="Plin" checked={metodoPago === 'Plin'} onChange={() => setMetodoPago('Plin')} style={{ display: 'none' }} />
                💸 Plin
              </label>
            </div>
          </div>

          <button 
            onClick={handleCheckout} 
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '16px', fontSize: '18px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Procesando pago...' : `Pagar S/ ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          </button>
        </div>
      </div>
    </div>
  );
}
