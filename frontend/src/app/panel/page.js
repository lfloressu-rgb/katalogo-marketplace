'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PanelPage() {
  const [ordenes, setOrdenes] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('compras'); // compras, perfil, direcciones, favoritos, pagos
  
  // Estados para nuevas funcionalidades
  const [direcciones, setDirecciones] = useState([]);
  const [direccionEditando, setDireccionEditando] = useState(null);
  const [imprimiendoBoleta, setImprimiendoBoleta] = useState(null);
  const [tarjetas, setTarjetas] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [reclamos, setReclamos] = useState([]);
  const [loadingTab, setLoadingTab] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (!userString) {
      router.push('/login');
      return;
    }
    
    const parsedUser = JSON.parse(userString);
    
    // Fetch para obtener datos actualizados del usuario (incluye foto_perfil si existe)
    fetch(`/api/perfil/${parsedUser.id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.message) {
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data)); // Actualizar local
        } else {
            setUser(parsedUser);
        }
      })
      .catch(() => setUser(parsedUser));
      
    // Fetch ordenes
    fetch(`/api/ordenes/usuario/${parsedUser.id}`)
      .then(res => res.json())
      .then(data => {
        setOrdenes(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error cargando órdenes', err);
        setLoading(false);
      });
  }, [router]);

  // Cargar datos según la pestaña activa
  useEffect(() => {
    if (!user) return;
    
    if (activeTab === 'direcciones') {
        setLoadingTab(true);
        fetch(`/api/direcciones/usuario/${user.id}`)
            .then(res => res.json())
            .then(data => { setDirecciones(Array.isArray(data) ? data : []); setLoadingTab(false); })
            .catch(() => setLoadingTab(false));
    } else if (activeTab === 'pagos') {
        setLoadingTab(true);
        fetch(`/api/pagos/usuario/${user.id}`)
            .then(res => res.json())
            .then(data => { setTarjetas(Array.isArray(data) ? data : []); setLoadingTab(false); })
            .catch(() => setLoadingTab(false));
    } else if (activeTab === 'favoritos') {
        setLoadingTab(true);
        fetch(`/api/favoritos/usuario/${user.id}`)
            .then(res => res.json())
            .then(data => { setFavoritos(Array.isArray(data) ? data : []); setLoadingTab(false); })
            .catch(() => setLoadingTab(false));
    } else if (activeTab === 'soporte') {
        setLoadingTab(true);
        fetch('/api/soporte/cliente', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
            .then(res => res.json())
            .then(data => { setReclamos(Array.isArray(data) ? data : []); setLoadingTab(false); })
            .catch(() => setLoadingTab(false));
    }
  }, [activeTab, user]);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '100px', fontSize: '18px' }}>Cargando tu panel espacial... 🚀</div>;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('user-changed'));
    router.push('/login');
  };

  const navLinkStyle = (tabName) => ({
    padding: '12px 15px', 
    borderRadius: '10px', 
    cursor: 'pointer',
    background: activeTab === tabName ? 'var(--primary-gradient)' : 'transparent',
    color: activeTab === tabName ? 'white' : 'var(--text-secondary)',
    fontWeight: activeTab === tabName ? 'bold' : 'normal',
    transition: 'all 0.3s ease'
  });

  // Funcionalidad 1: Imprimir Boleta
  const handlePrintBoleta = (orden) => {
    setImprimiendoBoleta(orden);
    setTimeout(() => {
        window.print();
        setImprimiendoBoleta(null);
    }, 100);
  };

  // Funcionalidad 2: Subir Foto de Perfil
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('imagen', file);

    try {
        const res = await fetch('/api/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });
        const data = await res.json();
        
        if (data.url) {
            // Actualizar perfil en BD
            await fetch(`/api/perfil/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ foto_perfil: data.url })
            });
            // Actualizar estado local
            const updatedUser = { ...user, foto_perfil: data.url };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            alert('Foto de perfil actualizada exitosamente');
        }
    } catch (error) {
        console.error('Error subiendo foto:', error);
        alert('Error al subir la foto');
    }
  };

  // Funcionalidad 3: Agregar/Editar Dirección
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
        usuario_id: user.id,
        direccion: formData.get('direccion'),
        distrito: formData.get('distrito'),
        provincia: formData.get('provincia'),
        departamento: formData.get('departamento'),
        es_principal: formData.get('es_principal') === 'on'
    };

    try {
        if (direccionEditando) {
            await fetch(`/api/direcciones/${direccionEditando.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            await fetch('/api/direcciones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }
        
        e.target.reset();
        setDireccionEditando(null);
        // Recargar direcciones
        const res = await fetch(`/api/direcciones/usuario/${user.id}`);
        const nuevas = await res.json();
        setDirecciones(nuevas);
        alert(direccionEditando ? 'Dirección actualizada!' : 'Dirección agregada!');
    } catch (error) {
        alert('Error al guardar dirección');
    }
  };

  const handleDeleteAddress = async (id) => {
    if(confirm('¿Seguro que deseas eliminar esta dirección?')) {
        await fetch(`/api/direcciones/${id}`, { method: 'DELETE' });
        setDirecciones(direcciones.filter(d => d.id !== id));
    }
  };

  // Funcionalidad 4: Agregar Tarjeta
  const handleAddCard = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const numero = formData.get('numero');
    // Determinar tipo básico
    let tipo = 'OTRO';
    if(numero.startsWith('4')) tipo = 'VISA';
    else if(numero.startsWith('5')) tipo = 'MASTERCARD';

    const data = {
        usuario_id: user.id,
        numero_tarjeta: numero,
        titular: formData.get('titular'),
        fecha_expiracion: formData.get('expiracion'),
        cvv: formData.get('cvv'),
        tipo
    };

    try {
        await fetch('/api/pagos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        e.target.reset();
        // Recargar pagos
        const res = await fetch(`/api/pagos/usuario/${user.id}`);
        const nuevos = await res.json();
        setTarjetas(nuevos);
        alert('Tarjeta agregada exitosamente!');
    } catch (error) {
        alert('Error al agregar tarjeta');
    }
  };

  const handleDeleteCard = async (id) => {
    if(confirm('¿Seguro que deseas eliminar esta tarjeta?')) {
        await fetch(`/api/pagos/${id}`, { method: 'DELETE' });
        setTarjetas(tarjetas.filter(t => t.id !== id));
    }
  };

  const handleRemoveFavorito = async (producto_id) => {
    try {
        await fetch('/api/favoritos', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id: user.id, producto_id })
        });
        setFavoritos(favoritos.filter(f => f.producto_id !== producto_id));
    } catch (e) {}
  };

  const handleAddToCart = (producto) => {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = savedCart.find(i => i.id === producto.producto_id);
    if (existingItem) {
        existingItem.cantidad += 1;
    } else {
        savedCart.push({ id: producto.producto_id, nombre: producto.nombre, precio: producto.precio_oferta || producto.precio, imagen_url: producto.imagen_url, cantidad: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(savedCart));
    window.dispatchEvent(new Event('cart-updated'));
    alert('Añadido al carrito');
  };

  return (
    <>
    <style>{`
      @media print {
        body * { visibility: hidden; }
        #seccion-boleta, #seccion-boleta * { visibility: visible; }
        #seccion-boleta { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
      }
    `}</style>
    
    {imprimiendoBoleta && (
      <div id="seccion-boleta" style={{ background: 'white', padding: '40px', color: 'black', fontFamily: 'sans-serif' }}>
          <div style={{ textAlign: 'center', borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '28px' }}>Katalogo</h2>
              <p style={{ margin: '5px 0 0', color: '#666' }}>Boleta Electrónica de Venta</p>
          </div>
          <div style={{ marginBottom: '30px', fontSize: '16px', lineHeight: '1.6' }}>
              <p><strong>Orden #:</strong> {imprimiendoBoleta.id}</p>
              <p><strong>Fecha:</strong> {new Date(imprimiendoBoleta.fecha_creacion).toLocaleString()}</p>
              <p><strong>Cliente:</strong> {user?.nombre}</p>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'right', borderTop: '2px solid #eee', paddingTop: '15px' }}>
              Total Pagado: S/ {Number(imprimiendoBoleta.total).toLocaleString('en-US')}
          </div>
      </div>
    )}

    <div style={{ marginTop: '40px', display: 'flex', gap: '30px' }}>
      
      {/* Sidebar de Navegación del Cliente */}
      <aside style={{ width: '260px', flexShrink: 0, backgroundColor: 'var(--glass-bg)', padding: '30px 20px', borderRadius: '16px', boxShadow: 'var(--float-shadow)', height: 'fit-content' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px', position: 'relative' }}>
          
          {user?.foto_perfil ? (
            <img src={user.foto_perfil} alt="Perfil" style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 15px', boxShadow: '0 10px 20px rgba(79, 172, 254, 0.4)' }} />
          ) : (
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'var(--primary-gradient)', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '35px', fontWeight: 'bold', boxShadow: '0 10px 20px rgba(79, 172, 254, 0.4)' }}>
              {user?.nombre?.charAt(0)}
            </div>
          )}
          
          <label style={{ display: 'block', cursor: 'pointer', fontSize: '12px', color: '#4facfe', marginTop: '-10px', marginBottom: '15px' }}>
             Cambiar Foto
             <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
          </label>

          <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>{user?.nombre}</h3>
          <span style={{ fontSize: '12px', color: '#00a650', fontWeight: 'bold', background: 'rgba(0,166,80,0.1)', padding: '4px 10px', borderRadius: '20px' }}>{user?.rol}</span>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div onClick={() => setActiveTab('compras')} style={navLinkStyle('compras')}>📦 Historial & Tracking</div>
          <div onClick={() => setActiveTab('perfil')} style={navLinkStyle('perfil')}>👤 Mi Perfil</div>
          <div onClick={() => setActiveTab('direcciones')} style={navLinkStyle('direcciones')}>📍 Direcciones de Envío</div>
          <div onClick={() => setActiveTab('favoritos')} style={navLinkStyle('favoritos')}>❤️ Lista de Deseos</div>
          <div onClick={() => setActiveTab('pagos')} style={navLinkStyle('pagos')}>💳 Métodos de Pago</div>
          <div onClick={() => setActiveTab('soporte')} style={navLinkStyle('soporte')}>💬 Atención al Cliente</div>
          
          <button onClick={handleLogout} style={{ marginTop: '30px', padding: '12px', borderRadius: '10px', border: '1px solid #e74c3c', background: 'rgba(231, 76, 60, 0.05)', color: '#e74c3c', cursor: 'pointer', fontWeight: 'bold' }}>Cerrar Sesión</button>
        </nav>
      </aside>

      {/* Contenido Dinámico según Pestaña */}
      <div style={{ flex: 1, backgroundColor: 'var(--glass-bg)', backdropFilter: 'blur(10px)', borderRadius: '16px', padding: '40px', boxShadow: 'var(--float-shadow)' }}>
        
        {/* PESTAÑA: COMPRAS */}
        {activeTab === 'compras' && (
          <div>
            <h2 style={{ fontSize: '24px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px', marginBottom: '30px' }}>Historial y Seguimiento (Tracking)</h2>
            
            {ordenes.length === 0 ? (
              <p>Aún no tienes compras espaciales.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {ordenes.map(orden => (
                  <div key={orden.id} style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '25px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Orden #{orden.id} • {new Date(orden.fecha_creacion).toLocaleDateString()}</div>
                        <div style={{ fontSize: '20px', fontWeight: '800', background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>S/ {Number(orden.total).toLocaleString('en-US')}</div>
                      </div>
                      <button onClick={() => handlePrintBoleta(orden)} style={{ padding: '8px 16px', background: 'white', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>📄 Descargar Boleta (PDF)</button>
                    </div>

                    <div style={{ marginTop: '20px', padding: '15px', background: 'var(--bg-color)', borderRadius: '8px' }}>
                      <h4 style={{ fontSize: '14px', marginBottom: '10px' }}>Estado del envío: <span style={{ color: '#00a650' }}>{orden.estado}</span></h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        <span style={{ color: '#4facfe', fontWeight: 'bold' }}>✓ Confirmado</span>
                        <span style={{ color: '#4facfe', fontWeight: 'bold' }}>✓ Empacado</span>
                        <span>{orden.estado === 'ENVIADO' || orden.estado === 'ENTREGADO' ? '✓ En camino' : '...'}</span>
                        <span>{orden.estado === 'ENTREGADO' ? '✓ Entregado' : '...'}</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: '#e0e0e0', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' }}>
                         <div style={{ width: orden.estado === 'PENDIENTE' ? '25%' : orden.estado === 'ENVIADO' ? '75%' : orden.estado === 'ENTREGADO' ? '100%' : '50%', height: '100%', background: 'var(--primary-gradient)' }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA: PERFIL */}
        {activeTab === 'perfil' && (
          <div>
            <h2 style={{ fontSize: '24px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px', marginBottom: '30px' }}>Datos Personales</h2>
            <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = {
                    nombre: formData.get('nombre'),
                    dni: formData.get('dni'),
                    telefono: formData.get('telefono'),
                    fecha_nacimiento: formData.get('fecha_nacimiento')
                };
                await fetch(`/api/perfil/${user.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const updated = {...user, ...data};
                setUser(updated);
                localStorage.setItem('user', JSON.stringify(updated));
                alert('Datos guardados!');
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--text-secondary)' }}>Nombres y Apellidos</label>
                    <input name="nombre" type="text" defaultValue={user?.nombre} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} required />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--text-secondary)' }}>Correo Electrónico</label>
                    <input type="email" defaultValue={user?.email} disabled style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', background: '#f5f5f5' }} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--text-secondary)' }}>DNI / Pasaporte</label>
                    <input name="dni" type="text" defaultValue={user?.dni || ''} placeholder="Ingresa tu documento" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--text-secondary)' }}>Teléfono / Celular</label>
                    <input name="telefono" type="text" defaultValue={user?.telefono || ''} placeholder="+51 999 999 999" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--text-secondary)' }}>Fecha de Nacimiento</label>
                    <input name="fecha_nacimiento" type="date" defaultValue={user?.fecha_nacimiento ? user.fecha_nacimiento.split('T')[0] : ''} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
                </div>
                </div>
                <button type="submit" className="btn-primary" style={{ marginTop: '30px', padding: '12px 24px', border: 'none', background: 'var(--primary-gradient)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Guardar Cambios</button>
            </form>
          </div>
        )}

        {/* PESTAÑA: DIRECCIONES */}
        {activeTab === 'direcciones' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px', marginBottom: '30px' }}>
              <h2 style={{ fontSize: '24px' }}>Mis Direcciones</h2>
            </div>
            
            {loadingTab ? <p>Cargando direcciones...</p> : (
                <div style={{ display: 'grid', gap: '20px', marginBottom: '40px' }}>
                    {direcciones.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No tienes direcciones guardadas.</p>}
                    {direcciones.map(dir => (
                        <div key={dir.id} style={{ background: 'rgba(255,255,255,0.8)', padding: '20px', borderRadius: '12px', border: dir.es_principal ? '2px solid #4facfe' : '1px solid #ddd' }}>
                            {dir.es_principal ? <span style={{ background: '#4facfe', color: 'white', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Principal</span> : null}
                            <p style={{ marginTop: '10px', fontSize: '16px', fontWeight: 'bold' }}>{dir.direccion}</p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{dir.distrito}, {dir.provincia}, {dir.departamento}</p>
                            <div style={{ marginTop: '15px', display: 'flex', gap: '15px' }}>
                                <button type="button" onClick={() => setDireccionEditando(dir)} style={{ color: '#4facfe', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Editar</button>
                                <button type="button" onClick={() => handleDeleteAddress(dir.id)} style={{ color: '#e74c3c', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Eliminar</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>{direccionEditando ? 'Editar Dirección' : 'Agregar Nueva Dirección'}</h3>
            <form onSubmit={handleSaveAddress} style={{ background: '#f9f9f9', padding: '20px', borderRadius: '12px', border: '1px solid #eee' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px' }}>Dirección Completa</label>
                        <input name="direccion" defaultValue={direccionEditando?.direccion || ''} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px' }}>Distrito</label>
                        <input name="distrito" defaultValue={direccionEditando?.distrito || ''} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px' }}>Provincia</label>
                        <input name="provincia" defaultValue={direccionEditando?.provincia || ''} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px' }}>Departamento</label>
                        <input name="departamento" defaultValue={direccionEditando?.departamento || ''} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input type="checkbox" name="es_principal" defaultChecked={direccionEditando?.es_principal || false} />
                            Marcar como dirección principal
                        </label>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                    <button type="submit" style={{ padding: '10px 20px', background: '#333', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>{direccionEditando ? 'Guardar Cambios' : 'Guardar Dirección'}</button>
                    {direccionEditando && <button type="button" onClick={() => setDireccionEditando(null)} style={{ padding: '10px 20px', background: '#e0e0e0', color: '#333', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Cancelar</button>}
                </div>
            </form>
          </div>
        )}

        {/* PESTAÑA: PAGOS */}
        {activeTab === 'pagos' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px', marginBottom: '30px' }}>
              <h2 style={{ fontSize: '24px' }}>Métodos de Pago</h2>
            </div>
            
            {loadingTab ? <p>Cargando tarjetas...</p> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                    {tarjetas.length === 0 && <p style={{ color: 'var(--text-secondary)', gridColumn: '1 / -1' }}>No tienes tarjetas guardadas.</p>}
                    {tarjetas.map(tj => (
                        <div key={tj.id} style={{ background: tj.tipo === 'VISA' ? 'linear-gradient(135deg, #1a1f71, #2b32b2)' : 'linear-gradient(135deg, #f2a900, #eb001b)', color: 'white', padding: '25px', borderRadius: '15px', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
                            <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', fontStyle: 'italic' }}>{tj.tipo}</div>
                            <div style={{ fontSize: '18px', letterSpacing: '2px', marginBottom: '15px', fontFamily: 'monospace' }}>
                                **** **** **** {tj.numero_tarjeta.slice(-4) || '0000'}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                <div style={{ textTransform: 'uppercase' }}>{tj.titular}</div>
                                <div>{tj.fecha_expiracion}</div>
                            </div>
                            <button onClick={() => handleDeleteCard(tj.id)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>✕</button>
                        </div>
                    ))}
                </div>
            )}

            <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>Agregar Nueva Tarjeta</h3>
            <form onSubmit={handleAddCard} style={{ background: '#f9f9f9', padding: '20px', borderRadius: '12px', border: '1px solid #eee' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px' }}>Número de Tarjeta</label>
                        <input name="numero" type="text" maxLength="16" placeholder="0000 0000 0000 0000" required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'monospace' }} />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px' }}>Titular de la Tarjeta</label>
                        <input name="titular" type="text" required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px' }}>Fecha Expiración</label>
                        <input name="expiracion" type="text" placeholder="MM/YY" maxLength="5" pattern="\d{2}/\d{2}" title="Debe ser en formato MM/YY (Ej. 12/28)" required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px' }}>CVV</label>
                        <input name="cvv" type="text" maxLength="4" pattern="\d{3,4}" title="3 o 4 dígitos" placeholder="123" required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                    </div>
                </div>
                <button type="submit" style={{ marginTop: '20px', padding: '10px 20px', background: '#333', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Guardar Tarjeta</button>
            </form>
          </div>
        )}

        {/* PESTAÑA: FAVORITOS */}
        {activeTab === 'favoritos' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px', marginBottom: '30px' }}>
              <h2 style={{ fontSize: '24px' }}>❤️ Lista de Deseos</h2>
            </div>
            
            {loadingTab ? <p>Cargando favoritos...</p> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                    {favoritos.length === 0 && <p style={{ color: 'var(--text-secondary)', gridColumn: '1 / -1' }}>Aún no tienes productos en tu lista de deseos.</p>}
                    
                    {favoritos.map(fav => (
                        <div key={fav.favorito_id} style={{ background: 'white', borderRadius: '12px', border: '1px solid #eee', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ height: '150px', background: '#f5f5f5', backgroundImage: `url(${fav.imagen_url || 'https://via.placeholder.com/300x200?text=No+Imagen'})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                                <button onClick={() => handleRemoveFavorito(fav.producto_id)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', color: '#e74c3c', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>✕</button>
                            </div>
                            <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <h4 style={{ margin: '0 0 5px', fontSize: '15px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{fav.nombre}</h4>
                                <p style={{ margin: '0 0 10px', color: '#888', fontSize: '12px' }}>Tienda: {fav.tienda}</p>
                                
                                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 'bold', color: 'var(--primary-color)', fontSize: '18px' }}>S/ {fav.precio_oferta || fav.precio}</span>
                                    <button onClick={() => handleAddToCart(fav)} style={{ background: '#333', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer', fontSize: '13px' }}>🛒 Añadir</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>
        )}

        {/* PESTAÑA: SOPORTE Y RECLAMOS */}
        {activeTab === 'soporte' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px', marginBottom: '30px' }}>
              <h2 style={{ fontSize: '24px' }}>Atención al Cliente</h2>
            </div>
            {loadingTab ? <p>Cargando tus reclamos...</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
                {reclamos.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No tienes incidencias registradas.</p>}
                {reclamos.map(r => (
                  <div key={r.id} style={{ background: 'rgba(255,255,255,0.8)', padding: '20px', borderRadius: '12px', border: '1px solid #ddd' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <h4 style={{ margin: '0 0 10px' }}>{r.asunto}</h4>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: r.estado === 'RESUELTO' ? '#00a650' : '#e74c3c' }}>{r.estado}</span>
                    </div>
                    <p style={{ fontSize: '14px', marginBottom: '10px' }}>{r.mensaje}</p>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                      Tienda: {r.tienda_nombre} | Fecha: {new Date(r.fecha_creacion).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>Enviar un Reclamo o Consulta</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const ordenSeleccionada = ordenes.find(o => o.id === Number(formData.get('orden_id')));
              if (!ordenSeleccionada) return alert('Selecciona una orden válida');
              
              const data = {
                tienda_id: ordenSeleccionada.tienda_id,
                orden_id: ordenSeleccionada.id,
                asunto: formData.get('asunto'),
                mensaje: formData.get('mensaje')
              };
              try {
                const res = await fetch('/api/soporte/cliente', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                  body: JSON.stringify(data)
                });
                if (res.ok) {
                  alert('Mensaje enviado al vendedor');
                  e.target.reset();
                  setActiveTab('compras'); // force reload trick
                  setTimeout(() => setActiveTab('soporte'), 100);
                } else alert('Error al enviar');
              } catch(e){ alert('Error'); }
            }} style={{ background: '#f9f9f9', padding: '20px', borderRadius: '12px', border: '1px solid #eee' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px' }}>Selecciona tu Orden</label>
                  <select name="orden_id" required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}>
                    <option value="">-- Elige una orden --</option>
                    {ordenes.map(o => <option key={o.id} value={o.id}>Orden #{o.id} (S/ {o.total})</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px' }}>Asunto</label>
                  <input name="asunto" required placeholder="Ej: Producto dañado, Consulta de envío..." style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px' }}>Mensaje</label>
                  <textarea name="mensaje" required rows="4" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}></textarea>
                </div>
                <button type="submit" style={{ padding: '10px 20px', background: '#333', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Enviar Mensaje</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
