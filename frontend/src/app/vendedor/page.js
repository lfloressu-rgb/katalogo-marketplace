'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function VendedorPage() {
  const [user, setUser] = useState(null);
  const [tienda, setTienda] = useState(null);
  const [productos, setProductos] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [reportesVentas, setReportesVentas] = useState([]);
  const [cupones, setCupones] = useState([]);
  const [reclamos, setReclamos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Publicar Producto
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '', descripcion_corta: '', descripcion_detallada: '', precio: '', precio_oferta: '',
    costo: '', stock_disponible: 0, stock_minimo: 0, sku: '', codigo_barras: '', marca: '',
    modelo: '', color: '', material: '', garantia: '', estado_publicacion: 'PUBLICADO',
    destacado: false, condicion: 'NUEVO', categoria_id: 1, peso: 0, dimensiones: ''
  });
  const [imagenesProd, setImagenesProd] = useState([]);
  const [variantes, setVariantes] = useState([]);
  
  // Edición Producto
  const [productoEditando, setProductoEditando] = useState(null);
  const [imagenEdit, setImagenEdit] = useState('');
  const [archivoEdit, setArchivoEdit] = useState(null);
  
  // Cupones
  const [mostrarFormCupon, setMostrarFormCupon] = useState(false);
  const [nuevoCupon, setNuevoCupon] = useState({ codigo: '', descuento: '', producto_id: 'todos', vencimiento: '' });

  const router = useRouter();

  const loadData = () => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    
    Promise.all([
      fetch('http://10.159.200.34/api/vendedor/tienda', { headers }).then(r => r.json()),
      fetch('http://10.159.200.34/api/vendedor/productos', { headers }).then(r => r.json()),
      fetch('http://10.159.200.34/api/vendedor/ordenes', { headers }).then(r => r.json()),
      fetch('http://10.159.200.34/api/vendedor/reportes/ventas', { headers }).then(r => r.json()),
      fetch('http://10.159.200.34/api/vendedor/cupones', { headers }).then(r => r.json()),
      fetch('http://10.159.200.34/api/soporte/vendedor', { headers }).then(r => r.json()),
      fetch('http://10.159.200.34/api/productos/categorias').then(r => r.json())
    ]).then(([dTienda, dProds, dOrd, dRep, dCup, dRec, dCat]) => {
      setTienda(dTienda);
      setProductos(Array.isArray(dProds) ? dProds : []);
      setOrdenes(Array.isArray(dOrd) ? dOrd : []);
      setReportesVentas(Array.isArray(dRep) ? dRep : []);
      setCupones(Array.isArray(dCup) ? dCup : []);
      setReclamos(Array.isArray(dRec) ? dRec : []);
      setCategorias(Array.isArray(dCat) ? dCat : []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    const userString = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!userString || !token) return router.push('/login');
    const parsedUser = JSON.parse(userString);
    if (parsedUser.rol !== 'VENDEDOR') {
      alert('No tienes permisos de vendedor');
      return router.push('/');
    }
    setUser(parsedUser);
    loadData();
  }, [router]);

  const uploadImage = async (file) => {
    const fd = new FormData();
    fd.append('imagen', file);
    const res = await fetch('http://10.159.200.34/api/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: fd
    });
    if (res.ok) return (await res.json()).url;
    throw new Error('Error al subir imagen');
  };

  const handlePublicarProducto = async () => {
    if (!nuevoProducto.nombre || !nuevoProducto.precio) return alert('Completa nombre y precio');
    try {
      let imagen_url = '';
      if (imagenesProd.length > 0) imagen_url = await uploadImage(imagenesProd[0]);
      
      const payload = {
        ...nuevoProducto,
        imagen_url,
        variantes: variantes.length > 0 ? variantes : null
      };

      const res = await fetch('http://10.159.200.34/api/vendedor/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        alert('Producto publicado!');
        setNuevoProducto({
          nombre: '', descripcion_corta: '', descripcion_detallada: '', precio: '', precio_oferta: '',
          costo: '', stock_disponible: 0, stock_minimo: 0, sku: '', codigo_barras: '', marca: '',
          modelo: '', color: '', material: '', garantia: '', estado_publicacion: 'PUBLICADO',
          destacado: false, condicion: 'NUEVO', categoria_id: 1, peso: 0, dimensiones: ''
        });
        setVariantes([]);
        setImagenesProd([]);
        loadData();
        setActiveTab('dashboard');
      } else alert('Error al publicar');
    } catch (e) { alert('Error de conexión'); }
  };

  const handleAgregarVariante = () => {
    setVariantes([...variantes, { color: '', talla: '', stock: 0, precio_adicional: 0 }]);
  };
  const handleCambiarVariante = (index, field, value) => {
    const newVars = [...variantes];
    newVars[index][field] = value;
    setVariantes(newVars);
  };

  const handleCrearCupon = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://10.159.200.34/api/vendedor/cupones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(nuevoCupon)
      });
      if (res.ok) {
        alert('Cupón creado!');
        setMostrarFormCupon(false);
        setNuevoCupon({ codigo: '', descuento: '', producto_id: 'todos', vencimiento: '' });
        loadData();
      }
    } catch (e) { alert('Error al crear cupón'); }
  };

  const handleGuardarEdicion = async (e) => {
    e?.preventDefault();
    if (!productoEditando.nombre || !productoEditando.precio) return alert('Completa nombre y precio');
    try {
      let imagen_url = imagenEdit;
      if (archivoEdit) imagen_url = await uploadImage(archivoEdit);
      
      const payload = { ...productoEditando, imagen_url };
      
      const res = await fetch(`http://10.159.200.34/api/vendedor/productos/${productoEditando.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        alert('Producto actualizado');
        setProductoEditando(null);
        setArchivoEdit(null);
        loadData();
      } else alert('Error al actualizar');
    } catch(e) { alert('Error de red'); }
  };

  const handleResolverReclamo = async (id) => {
    try {
      await fetch(`http://10.159.200.34/api/soporte/vendedor/${id}/resolver`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      loadData();
    } catch (e) { alert('Error'); }
  };

  const exportarReporte = () => {
    const w = window.open('', '_blank');
    let html = `
      <html>
      <head><title>Reporte de Ventas</title><style>body{font-family:sans-serif;padding:20px} table{width:100%;border-collapse:collapse;margin-top:20px} th,td{border:1px solid #ddd;padding:8px}</style></head>
      <body>
        <h2>Reporte de Ventas - ${tienda?.nombre}</h2>
        <table><tr><th>Fecha</th><th>Ventas (Cantidad)</th><th>Ingresos (S/)</th></tr>
    `;
    reportesVentas.forEach(r => {
      html += `<tr><td>${new Date(r.fecha).toLocaleDateString()}</td><td>${r.cantidad}</td><td>${r.total}</td></tr>`;
    });
    html += `</table><script>window.onload = () => window.print();</script></body></html>`;
    w.document.write(html);
    w.document.close();
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '100px' }}>Cargando Centro de Vendedores... 🚀</div>;

  const navLinkStyle = (tabName) => ({
    padding: '12px 15px', borderRadius: '10px', cursor: 'pointer',
    background: activeTab === tabName ? 'var(--primary-gradient)' : 'transparent',
    color: activeTab === tabName ? 'white' : 'var(--text-secondary)',
    fontWeight: activeTab === tabName ? 'bold' : 'normal', transition: 'all 0.3s ease'
  });

  return (
    <div style={{ marginTop: '40px', display: 'flex', gap: '30px' }}>
      
      {/* Sidebar Vendedor */}
      <aside style={{ width: '260px', flexShrink: 0, backgroundColor: 'var(--glass-bg)', padding: '30px 20px', borderRadius: '16px', boxShadow: 'var(--float-shadow)', height: 'fit-content' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>{tienda?.nombre || 'Mi Tienda'}</h3>
          <span style={{ fontSize: '12px', color: '#9b59b6', fontWeight: 'bold', background: 'rgba(155, 89, 182, 0.1)', padding: '4px 10px', borderRadius: '20px' }}>PANEL VENDEDOR</span>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div onClick={() => setActiveTab('dashboard')} style={navLinkStyle('dashboard')}>📊 Dashboard General</div>
          <div onClick={() => setActiveTab('nuevo_producto')} style={navLinkStyle('nuevo_producto')}>📦 Publicar Producto</div>
          <div onClick={() => setActiveTab('promociones')} style={navLinkStyle('promociones')}>🏷️ Cupones y Promociones</div>
          <div onClick={() => setActiveTab('atencion')} style={navLinkStyle('atencion')}>💬 Atención al Cliente</div>
          <div onClick={() => setActiveTab('reportes')} style={navLinkStyle('reportes')}>📈 Reportes (Exportar)</div>
        </nav>
      </aside>

      {/* Contenido Principal */}
      <div style={{ flex: 1 }}>
        
        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h1 style={{ fontSize: '28px', color: 'var(--text-primary)' }}>Dashboard de Ventas</h1>
              <div style={{ background: 'var(--primary-gradient)', padding: '15px 25px', borderRadius: '12px', color: 'white', boxShadow: '0 10px 20px rgba(79, 172, 254, 0.3)' }}>
                <div style={{ fontSize: '14px' }}>Ventas Totales</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>S/ {ordenes.reduce((acc, o) => acc + Number(o.total), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              </div>
            </div>

            {/* GRÁFICO DE VENTAS */}
            <div style={{ backgroundColor: 'var(--glass-bg)', padding: '30px', borderRadius: '16px', boxShadow: 'var(--float-shadow)', marginBottom: '30px', height: '350px' }}>
              <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Ingresos Diarios</h2>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reportesVentas.map(r => ({ fecha: new Date(r.fecha).toLocaleDateString(), ingresos: Number(r.total) }))}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="fecha" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="ingresos" stroke="#4facfe" strokeWidth={3} dot={{ r: 5, fill: '#4facfe', strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: 'flex', gap: '30px' }}>
              <div style={{ flex: 2, backgroundColor: 'var(--glass-bg)', padding: '30px', borderRadius: '16px', boxShadow: 'var(--float-shadow)' }}>
                <h2 style={{ fontSize: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px', marginBottom: '20px' }}>Mis Productos</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                  {productos.map(p => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.4)', padding: '15px', borderRadius: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <strong style={{ fontSize: '16px' }}>{p.nombre}</strong>
                          <span style={{ fontSize: '10px', background: p.estado_publicacion === 'PUBLICADO' ? '#d4edda' : '#f8d7da', color: p.estado_publicacion === 'PUBLICADO' ? '#155724' : '#721c24', padding: '3px 8px', borderRadius: '12px' }}>{p.estado_publicacion}</span>
                        </div>
                        <div style={{ margin: '5px 0' }}>
                          <span style={{ color: '#00a650', fontWeight: 'bold' }}>S/ {Number(p.precio).toLocaleString('en-US', {minimumFractionDigits:2})}</span> 
                          {p.precio_oferta && <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '12px', marginLeft: '5px' }}>S/ {p.precio_oferta}</span>}
                          {p.variantes?.length > 1 ? ` • ${p.variantes.length} Variantes` : ` • Stock: ${p.stock_disponible}`}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666', display: 'flex', gap: '15px' }}>
                          <span>👁️ {p.visitas || 0} visitas</span>
                          <span>📦 {p.ventas || 0} ventas</span>
                          <span>⭐ {p.calificacion_promedio || '0.0'}</span>
                        </div>
                      </div>
                      <div>
                        <button onClick={() => { setProductoEditando(p); setImagenEdit(''); setArchivoEdit(null); }} style={{ padding: '8px 15px', background: '#333', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Editar</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1, backgroundColor: 'var(--glass-bg)', padding: '30px', borderRadius: '16px', boxShadow: 'var(--float-shadow)' }}>
                <h2 style={{ fontSize: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px', marginBottom: '20px' }}>Últimos Pedidos</h2>
                {ordenes.slice(0,5).map(o => (
                  <div key={o.id} style={{ background: 'rgba(255,255,255,0.6)', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #4facfe', marginBottom: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>#{o.id}</strong>
                      <span style={{ color: '#4facfe', fontSize: '12px', fontWeight: 'bold' }}>{o.estado}</span>
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '5px' }}>S/ {Number(o.total).toLocaleString('en-US', {minimumFractionDigits:2})}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PUBLICAR PRODUCTO AVANZADO */}
        {activeTab === 'nuevo_producto' && (
          <div style={{ backgroundColor: 'var(--glass-bg)', padding: '40px', borderRadius: '16px', boxShadow: 'var(--float-shadow)' }}>
            <h2 style={{ fontSize: '24px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px', marginBottom: '30px' }}>Publicar Nuevo Producto</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {/* Info General */}
              <div style={{ padding: '20px', border: '1px solid var(--glass-border)', borderRadius: '12px', background: '#fcfcfd' }}>
                <h3 style={{ marginBottom: '15px', color: 'var(--primary-color)' }}>1. Información General</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ gridColumn: '1 / -1' }}><label style={{ display: 'block', fontWeight: 'bold' }}>Nombre</label><input type="text" value={nuevoProducto.nombre} onChange={e => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} /></div>
                  <div><label style={{ display: 'block', fontWeight: 'bold' }}>Categoría</label><select value={nuevoProducto.categoria_id} onChange={e => setNuevoProducto({...nuevoProducto, categoria_id: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select></div>
                  <div><label style={{ display: 'block', fontWeight: 'bold' }}>Estado de Publicación</label><select value={nuevoProducto.estado_publicacion} onChange={e => setNuevoProducto({...nuevoProducto, estado_publicacion: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}><option value="PUBLICADO">Publicado</option><option value="BORRADOR">Borrador</option><option value="OCULTO">Oculto</option></select></div>
                  <div style={{ gridColumn: '1 / -1' }}><label style={{ display: 'block', fontWeight: 'bold' }}>Descripción Corta</label><textarea rows="2" value={nuevoProducto.descripcion_corta} onChange={e => setNuevoProducto({...nuevoProducto, descripcion_corta: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}></textarea></div>
                  <div style={{ gridColumn: '1 / -1' }}><label style={{ display: 'block', fontWeight: 'bold' }}>Descripción Detallada</label><textarea rows="4" value={nuevoProducto.descripcion_detallada} onChange={e => setNuevoProducto({...nuevoProducto, descripcion_detallada: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}></textarea></div>
                </div>
              </div>

              {/* Specs */}
              <div style={{ padding: '20px', border: '1px solid var(--glass-border)', borderRadius: '12px', background: '#fcfcfd' }}>
                <h3 style={{ marginBottom: '15px', color: 'var(--primary-color)' }}>2. Especificaciones Técnicas</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                  <div><label style={{ display: 'block', fontSize: '13px' }}>Condición</label><select value={nuevoProducto.condicion} onChange={e => setNuevoProducto({...nuevoProducto, condicion: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}><option>NUEVO</option><option>USADO</option><option>REACONDICIONADO</option></select></div>
                  <div><label style={{ display: 'block', fontSize: '13px' }}>Marca</label><input type="text" value={nuevoProducto.marca} onChange={e => setNuevoProducto({...nuevoProducto, marca: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }} /></div>
                  <div><label style={{ display: 'block', fontSize: '13px' }}>Modelo</label><input type="text" value={nuevoProducto.modelo} onChange={e => setNuevoProducto({...nuevoProducto, modelo: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }} /></div>
                  <div><label style={{ display: 'block', fontSize: '13px' }}>Material</label><input type="text" value={nuevoProducto.material} onChange={e => setNuevoProducto({...nuevoProducto, material: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }} /></div>
                  <div><label style={{ display: 'block', fontSize: '13px' }}>Color Base</label><input type="text" value={nuevoProducto.color} onChange={e => setNuevoProducto({...nuevoProducto, color: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }} /></div>
                  <div><label style={{ display: 'block', fontSize: '13px' }}>Garantía</label><input type="text" placeholder="Ej: 1 año" value={nuevoProducto.garantia} onChange={e => setNuevoProducto({...nuevoProducto, garantia: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }} /></div>
                  <div><label style={{ display: 'block', fontSize: '13px' }}>Dimensiones</label><input type="text" placeholder="L x A x H" value={nuevoProducto.dimensiones} onChange={e => setNuevoProducto({...nuevoProducto, dimensiones: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }} /></div>
                  <div><label style={{ display: 'block', fontSize: '13px' }}>Peso (kg)</label><input type="number" step="0.1" value={nuevoProducto.peso} onChange={e => setNuevoProducto({...nuevoProducto, peso: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }} /></div>
                </div>
              </div>

              {/* Logs / Inv */}
              <div style={{ padding: '20px', border: '1px solid var(--glass-border)', borderRadius: '12px', background: '#fcfcfd' }}>
                <h3 style={{ marginBottom: '15px', color: 'var(--primary-color)' }}>3. Logística y Precios</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold' }}>Precio Venta (S/)</label><input type="number" step="0.01" value={nuevoProducto.precio} onChange={e => setNuevoProducto({...nuevoProducto, precio: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }} /></div>
                  <div><label style={{ display: 'block', fontSize: '13px' }}>Precio Oferta (S/)</label><input type="number" step="0.01" value={nuevoProducto.precio_oferta} onChange={e => setNuevoProducto({...nuevoProducto, precio_oferta: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }} /></div>
                  <div><label style={{ display: 'block', fontSize: '13px' }}>Costo (S/) - Interno</label><input type="number" step="0.01" value={nuevoProducto.costo} onChange={e => setNuevoProducto({...nuevoProducto, costo: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }} /></div>
                  
                  <div><label style={{ display: 'block', fontSize: '13px' }}>SKU (Código Interno)</label><input type="text" value={nuevoProducto.sku} onChange={e => setNuevoProducto({...nuevoProducto, sku: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }} /></div>
                  <div><label style={{ display: 'block', fontSize: '13px' }}>Código de Barras</label><input type="text" value={nuevoProducto.codigo_barras} onChange={e => setNuevoProducto({...nuevoProducto, codigo_barras: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }} /></div>
                  
                  {variantes.length === 0 && (
                    <>
                      <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold' }}>Stock Disponible</label><input type="number" value={nuevoProducto.stock_disponible} onChange={e => setNuevoProducto({...nuevoProducto, stock_disponible: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }} /></div>
                      <div><label style={{ display: 'block', fontSize: '13px' }}>Stock Mínimo</label><input type="number" value={nuevoProducto.stock_minimo} onChange={e => setNuevoProducto({...nuevoProducto, stock_minimo: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }} /></div>
                    </>
                  )}
                </div>

                <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', background: '#fff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <strong>Múltiples Variantes (Tallas, Colores, etc.)</strong>
                    <button onClick={handleAgregarVariante} style={{ background: '#333', color: 'white', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px' }}>+ Añadir Variante</button>
                  </div>
                  {variantes.length === 0 && <p style={{ fontSize: '13px', color: '#888' }}>Si el producto tiene tallas/colores, agrégalos aquí. Si no, usa el stock general.</p>}
                  {variantes.map((v, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                      <input placeholder="Color" value={v.color} onChange={e=>handleCambiarVariante(i, 'color', e.target.value)} style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                      <input placeholder="Talla" value={v.talla} onChange={e=>handleCambiarVariante(i, 'talla', e.target.value)} style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                      <input type="number" placeholder="Stock" value={v.stock} onChange={e=>handleCambiarVariante(i, 'stock', e.target.value)} style={{ width: '80px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                      <input type="number" placeholder="Extra S/" value={v.precio_adicional} onChange={e=>handleCambiarVariante(i, 'precio_adicional', e.target.value)} style={{ width: '80px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>
                  ))}
                </div>

                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Imagen Principal</label>
                <div style={{ background: '#f9f9f9', height: '150px', borderRadius: '8px', border: '2px dashed var(--primary-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)', marginBottom: '20px', position: 'relative' }}>
                   <span style={{ fontSize: '30px' }}>📸</span>
                   <span style={{ fontSize: '13px', fontWeight: 'bold', marginTop: '5px' }}>{imagenesProd.length > 0 ? 'Imagen Seleccionada' : 'Adjuntar Imagen Principal'}</span>
                   <input type="file" accept="image/*" onChange={(e) => setImagenesProd([e.target.files[0]])} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                </div>
              </div>

              <button onClick={handlePublicarProducto} className="btn-primary" style={{ padding: '15px', fontSize: '16px' }}>Publicar Producto en el Marketplace</button>
            </div>
          </div>
        )}

        {/* PROMOCIONES */}
        {activeTab === 'promociones' && (
          <div style={{ backgroundColor: 'var(--glass-bg)', padding: '40px', borderRadius: '16px', boxShadow: 'var(--float-shadow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
              <h2 style={{ fontSize: '24px' }}>Gestión de Promociones</h2>
              <button onClick={() => setMostrarFormCupon(!mostrarFormCupon)} className="btn-primary" style={{ padding: '8px 16px' }}>{mostrarFormCupon ? 'Cancelar' : '+ Crear Cupón'}</button>
            </div>
            
            {mostrarFormCupon && (
              <form onSubmit={handleCrearCupon} style={{ background: 'rgba(255,255,255,0.7)', padding: '20px', borderRadius: '12px', border: '1px solid #4facfe', marginBottom: '30px', display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', fontWeight: 'bold' }}>Código</label>
                  <input type="text" required value={nuevoCupon.codigo} onChange={e => setNuevoCupon({...nuevoCupon, codigo: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                </div>
                <div style={{ flex: '1 1 150px' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', fontWeight: 'bold' }}>Descuento</label>
                  <input type="text" required placeholder="10% / S/. 50" value={nuevoCupon.descuento} onChange={e => setNuevoCupon({...nuevoCupon, descuento: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                </div>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', fontWeight: 'bold' }}>Alcance (Producto)</label>
                  <select value={nuevoCupon.producto_id} onChange={e => setNuevoCupon({...nuevoCupon, producto_id: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}>
                    <option value="todos">Toda la Tienda</option>
                    {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                </div>
                <div style={{ flex: '1 1 150px' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', fontWeight: 'bold' }}>Vencimiento</label>
                  <input type="date" value={nuevoCupon.vencimiento} onChange={e => setNuevoCupon({...nuevoCupon, vencimiento: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '10px 20px', background: '#00a650', flex: '1 1 100%' }}>Guardar Cupón</button>
              </form>
            )}

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}><th>Código</th><th>Descuento</th><th>Alcance</th><th>Estado</th></tr></thead>
              <tbody>
                {cupones.length === 0 && <tr><td colSpan="4" style={{ padding: '20px 0', color: '#888' }}>Sin cupones</td></tr>}
                {cupones.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '15px 0', fontWeight: 'bold', color: '#4facfe' }}>{c.codigo}</td>
                    <td>{c.descuento}</td>
                    <td>{c.producto_id ? productos.find(p=>p.id===c.producto_id)?.nombre || 'Producto' : 'Toda la Tienda'}</td>
                    <td style={{ color: c.estado === 'Activo' ? '#00a650' : '#e74c3c', fontWeight: 'bold' }}>{c.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ATENCIÓN AL CLIENTE */}
        {activeTab === 'atencion' && (
          <div style={{ backgroundColor: 'var(--glass-bg)', padding: '40px', borderRadius: '16px', boxShadow: 'var(--float-shadow)' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '30px' }}>Bandeja de Reclamos e Incidencias</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {reclamos.length === 0 && <p style={{ color: '#888' }}>No tienes reclamos pendientes. ¡Excelente trabajo!</p>}
              {reclamos.map(r => (
                <div key={r.id} style={{ background: 'rgba(255,255,255,0.7)', border: r.estado === 'PENDIENTE' ? '1px solid #e74c3c' : '1px solid #ddd', padding: '20px', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div>
                      <span style={{ fontSize: '12px', color: '#888' }}>{new Date(r.fecha_creacion).toLocaleString()}</span>
                      <h4 style={{ margin: '5px 0' }}>{r.asunto}</h4>
                    </div>
                    <span style={{ padding: '5px 10px', background: r.estado === 'PENDIENTE' ? '#fdecea' : '#eafaf1', color: r.estado === 'PENDIENTE' ? '#e74c3c' : '#00a650', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', height: 'fit-content' }}>
                      {r.estado}
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#444', marginBottom: '15px' }}>{r.mensaje}</p>
                  <div style={{ fontSize: '13px', color: '#888', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Cliente: {r.cliente_nombre} ({r.cliente_email}) {r.orden_id ? ` • Orden #${r.orden_id}` : ''}</span>
                    {r.estado === 'PENDIENTE' && (
                      <button onClick={() => handleResolverReclamo(r.id)} style={{ padding: '8px 16px', background: '#00a650', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>✔ Marcar Resuelto</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REPORTES */}
        {activeTab === 'reportes' && (
          <div style={{ backgroundColor: 'var(--glass-bg)', padding: '60px', borderRadius: '16px', boxShadow: 'var(--float-shadow)', textAlign: 'center' }}>
            <span style={{ fontSize: '60px' }}>📊</span>
            <h2 style={{ margin: '20px 0' }}>Exportar Ventas Oficiales</h2>
            <p style={{ marginBottom: '30px', color: '#666' }}>Genera un reporte detallado de tus ingresos diarios listos para impresión o archivo en formato PDF.</p>
            <button onClick={exportarReporte} className="btn-primary" style={{ background: '#c0392b', boxShadow: 'none', fontSize: '16px', padding: '15px 30px' }}>
              ⬇️ Exportar Ventas a PDF
            </button>
          </div>
        )}

      </div>

      {/* MODAL EDICIÓN PRODUCTO */}
      {productoEditando && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '24px' }}>Editar Producto</h2>
              <button onClick={() => setProductoEditando(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
            </div>
            
            <form onSubmit={handleGuardarEdicion}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div style={{ gridColumn: '1 / -1' }}><label style={{ display: 'block', fontWeight: 'bold' }}>Nombre</label><input type="text" value={productoEditando.nombre} onChange={e => setProductoEditando({...productoEditando, nombre: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} /></div>
                <div><label style={{ display: 'block', fontWeight: 'bold' }}>Estado</label><select value={productoEditando.estado_publicacion} onChange={e => setProductoEditando({...productoEditando, estado_publicacion: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}><option value="PUBLICADO">Publicado</option><option value="BORRADOR">Borrador</option><option value="OCULTO">Oculto</option></select></div>
                <div><label style={{ display: 'block', fontWeight: 'bold' }}>Condición</label><select value={productoEditando.condicion} onChange={e => setProductoEditando({...productoEditando, condicion: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}><option>NUEVO</option><option>USADO</option><option>REACONDICIONADO</option></select></div>
                
                <div style={{ gridColumn: '1 / -1' }}><label style={{ display: 'block', fontWeight: 'bold' }}>Descripción Detallada</label><textarea rows="3" value={productoEditando.descripcion_detallada || ''} onChange={e => setProductoEditando({...productoEditando, descripcion_detallada: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}></textarea></div>
                
                <div><label style={{ display: 'block', fontWeight: 'bold' }}>Precio Venta (S/)</label><input type="number" step="0.01" value={productoEditando.precio} onChange={e => setProductoEditando({...productoEditando, precio: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} /></div>
                <div><label style={{ display: 'block', fontWeight: 'bold' }}>Precio Oferta (S/)</label><input type="number" step="0.01" value={productoEditando.precio_oferta || ''} onChange={e => setProductoEditando({...productoEditando, precio_oferta: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} /></div>
                
                <div><label style={{ display: 'block', fontWeight: 'bold' }}>Stock Disponible (Genérico)</label><input type="number" value={productoEditando.stock_disponible || 0} onChange={e => setProductoEditando({...productoEditando, stock_disponible: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} /></div>
                <div><label style={{ display: 'block', fontWeight: 'bold' }}>SKU</label><input type="text" value={productoEditando.sku || ''} onChange={e => setProductoEditando({...productoEditando, sku: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} /></div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '10px' }}>Cambiar Imagen Principal (Opcional)</label>
                <input type="file" accept="image/*" onChange={(e) => setArchivoEdit(e.target.files[0])} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setProductoEditando(null)} style={{ padding: '10px 20px', background: '#ccc', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ padding: '10px 20px', background: 'var(--primary-color)', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
