'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function AdminPage() {
  const [metricas, setMetricas] = useState(null);
  const [tiendas, setTiendas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [finanzas, setFinanzas] = useState(null);
  const [ordenesGlobales, setOrdenesGlobales] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, tiendas, categorias, finanzas, config, pedidos
  
  const [nuevaCategoria, setNuevaCategoria] = useState('');

  // Nuevos estados para finanzas
  const [rangoFecha, setRangoFecha] = useState('siempre');
  const [config, setConfig] = useState({ comision_plataforma: 5 });
  const [comisionEdit, setComisionEdit] = useState('');
  const [liquidaciones, setLiquidaciones] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const userString = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userString || !token) {
      router.push('/login');
      return;
    }
    
    const parsedUser = JSON.parse(userString);
    if (parsedUser.rol !== 'ADMIN') {
      alert('Acceso Restringido.');
      router.push('/');
      return;
    }
    
    const headers = { 'Authorization': `Bearer ${token}` };
    
    Promise.all([
      fetch('http://10.159.200.34/api/admin/metricas', { headers }).then(r => r.json()),
      fetch('http://10.159.200.34/api/admin/tiendas', { headers }).then(r => r.json()),
      fetch('http://10.159.200.34/api/admin/usuarios', { headers }).then(r => r.json()),
      fetch('http://10.159.200.34/api/admin/categorias', { headers }).then(r => r.json()),
      fetch('http://10.159.200.34/api/admin/finanzas', { headers }).then(r => r.json()),
      fetch('http://10.159.200.34/api/admin/ordenes', { headers }).then(r => r.json())
    ]).then(([dataMetricas, dataTiendas, dataUsuarios, dataCategorias, dataFinanzas, dataOrdenes]) => {
      setMetricas(dataMetricas);
      setTiendas(Array.isArray(dataTiendas) ? dataTiendas : []);
      setUsuarios(Array.isArray(dataUsuarios) ? dataUsuarios : []);
      setCategorias(Array.isArray(dataCategorias) ? dataCategorias : []);
      setFinanzas(dataFinanzas);
      setOrdenesGlobales(Array.isArray(dataOrdenes) ? dataOrdenes : []);
      setLoading(false);
    }).catch(err => {
      console.error('Error cargando admin', err);
      setLoading(false);
    });
    
  }, [router]);

  const loadFinanzas = async () => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      const [finRes, liqRes, confRes] = await Promise.all([
        fetch(`http://10.159.200.34/api/admin/finanzas?rango=${rangoFecha}`, { headers }),
        fetch('http://10.159.200.34/api/admin/liquidaciones', { headers }),
        fetch('http://10.159.200.34/api/admin/config', { headers })
      ]);
      
      if (finRes.ok) setFinanzas(await finRes.json());
      if (liqRes.ok) setLiquidaciones(await liqRes.json());
      
      if (confRes.ok) {
        const confData = await confRes.json();
        setConfig(confData);
        setComisionEdit(confData.comision_plataforma);
      }
    } catch(e) { console.error('Error cargando finanzas', e); }
  };

  useEffect(() => {
    if (activeTab === 'finanzas') {
      loadFinanzas();
    }
  }, [activeTab, rangoFecha]);

  const handleActualizarComision = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://10.159.200.34/api/admin/config', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ comision_plataforma: comisionEdit })
      });
      if (res.ok) {
        alert('Comisión actualizada globalmente.');
        loadFinanzas();
      }
    } catch (e) { alert('Error actualizando comisión'); }
  };

  const handlePagarLiquidacion = async (tiendaId) => {
    if (!confirm('¿Estás seguro que deseas marcar todas las ventas pendientes de esta tienda como pagadas/liquidadas?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://10.159.200.34/api/admin/liquidaciones/${tiendaId}/pagar`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Liquidación exitosa.');
        loadFinanzas();
      }
    } catch(e) { alert('Error al liquidar'); }
  };

  const handleAprobar = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://10.159.200.34/api/admin/tiendas/${id}/aprobar`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setTiendas(tiendas.map(t => t.id === id ? { ...t, estado: 'APROBADA' } : t));
        alert('Tienda aprobada exitosamente');
      }
    } catch (error) {
      console.error('Error al aprobar tienda', error);
    }
  };

  const handleRechazar = async (id) => {
    if (!confirm('¿Estás seguro de rechazar esta tienda?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://10.159.200.34/api/admin/tiendas/${id}/rechazar`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setTiendas(tiendas.map(t => t.id === id ? { ...t, estado: 'RECHAZADA' } : t));
      }
    } catch (error) {
      console.error('Error al rechazar tienda', error);
    }
  };

  const handleCrearCategoria = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://10.159.200.34/api/admin/categorias`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre: nuevaCategoria })
      });
      
      if (res.ok) {
        alert('Categoría creada');
        setNuevaCategoria('');
        // Recargar categorías
        const catRes = await fetch('http://10.159.200.34/api/admin/categorias', { headers: { 'Authorization': `Bearer ${token}` } });
        const newCats = await catRes.json();
        setCategorias(Array.isArray(newCats) ? newCats : []);
      } else {
        const data = await res.json();
        alert(data.message || 'Error al crear');
      }
    } catch (error) {
      console.error('Error al crear categoría', error);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '100px' }}>Cargando Centro de Control... 🛡️</div>;

  const navLinkStyle = (tabName) => ({
    padding: '12px 15px', 
    borderRadius: '10px', 
    cursor: 'pointer',
    background: activeTab === tabName ? 'var(--primary-color)' : 'transparent',
    color: activeTab === tabName ? 'white' : 'var(--text-secondary)',
    fontWeight: activeTab === tabName ? 'bold' : 'normal',
    transition: 'all 0.3s ease'
  });

  return (
    <div style={{ marginTop: '40px', display: 'flex', gap: '30px' }}>
      
      {/* Sidebar Admin */}
      <aside style={{ width: '260px', flexShrink: 0, backgroundColor: 'var(--glass-bg)', padding: '30px 20px', borderRadius: '16px', boxShadow: 'var(--float-shadow)', height: 'fit-content' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>Katalogo Admin</h3>
          <span style={{ fontSize: '12px', color: 'var(--primary-color)', fontWeight: 'bold', background: 'rgba(59, 59, 230, 0.1)', padding: '4px 10px', borderRadius: '20px' }}>SUPER ADMIN</span>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div onClick={() => setActiveTab('dashboard')} style={navLinkStyle('dashboard')}>📊 Métricas (Dashboard)</div>
          <div onClick={() => setActiveTab('pedidos')} style={navLinkStyle('pedidos')}>📦 Gestión de Pedidos</div>
          <div onClick={() => setActiveTab('tiendas')} style={navLinkStyle('tiendas')}>🏬 Aprobar Tiendas</div>
          <div onClick={() => setActiveTab('categorias')} style={navLinkStyle('categorias')}>🏷️ Categorías y Marcas</div>
          <div onClick={() => setActiveTab('finanzas')} style={navLinkStyle('finanzas')}>💰 Gestión Financiera</div>
          <div onClick={() => setActiveTab('config')} style={navLinkStyle('config')}>⚙️ Configuración (IGV)</div>
        </nav>
      </aside>

      {/* Contenido Principal */}
      <div style={{ flex: 1 }}>
        
        {/* PESTAÑA: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h1 style={{ fontSize: '28px', color: '#e74c3c' }}>Métricas Globales</h1>
              <button className="btn-primary" style={{ background: '#34495e', boxShadow: 'none' }}>⬇️ Exportar Reporte Global PDF</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
              <div style={{ background: 'var(--glass-bg)', padding: '25px', borderRadius: '16px', boxShadow: 'var(--float-shadow)' }}>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Ingresos Totales (S/.)</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#00a650' }}>S/ {Number(metricas?.ingresosTotales || 0).toLocaleString('en-US')}</div>
              </div>
              <div style={{ background: 'var(--glass-bg)', padding: '25px', borderRadius: '16px', boxShadow: 'var(--float-shadow)' }}>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Usuarios</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3498db' }}>{metricas?.usuarios || 0}</div>
              </div>
              <div style={{ background: 'var(--glass-bg)', padding: '25px', borderRadius: '16px', boxShadow: 'var(--float-shadow)' }}>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Tiendas Activas</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#9b59b6' }}>{metricas?.tiendas || 0}</div>
              </div>
              <div style={{ background: 'var(--glass-bg)', padding: '25px', borderRadius: '16px', boxShadow: 'var(--float-shadow)' }}>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Productos Publicados</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f39c12' }}>{metricas?.productos || 0}</div>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--glass-bg)', padding: '30px', borderRadius: '16px', boxShadow: 'var(--float-shadow)' }}>
              <h2 style={{ fontSize: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px', marginBottom: '20px' }}>Últimos Registros</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}><th style={{ padding: '10px 0' }}>Usuario</th><th>Rol</th><th>Registro</th></tr></thead>
                <tbody>
                  {usuarios.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '15px 0' }}>{u.nombre}<br/><small style={{color: '#999'}}>{u.email}</small></td>
                      <td><span style={{ padding: '4px 8px', background: u.rol === 'ADMIN' ? '#e74c3c' : u.rol === 'VENDEDOR' ? '#9b59b6' : '#3498db', color: 'white', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>{u.rol}</span></td>
                      <td style={{ fontSize: '13px' }}>{new Date(u.fecha_registro).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PESTAÑA: CONFIGURACIÓN GLOBAL */}
        {activeTab === 'config' && (
          <div style={{ backgroundColor: 'var(--glass-bg)', padding: '40px', borderRadius: '16px', boxShadow: 'var(--float-shadow)' }}>
            <h2 style={{ fontSize: '24px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px', marginBottom: '30px' }}>Configuración del Sistema</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              <div>
                <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>Parámetros Financieros</h3>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Moneda del Sistema</label>
                <select style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '20px' }}><option>Soles (S/.)</option><option>Dólares ($)</option></select>
                
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Impuesto (IGV) %</label>
                <input type="number" defaultValue="18" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '20px' }} />

                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Comisión del Marketplace % (Cobro a Tiendas)</label>
                <input type="number" defaultValue="5" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '20px' }} />
              </div>
              
              <div>
                <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>Mantenimiento</h3>
                <div style={{ padding: '20px', background: 'rgba(231, 76, 60, 0.05)', border: '1px solid #e74c3c', borderRadius: '8px' }}>
                  <h4 style={{ color: '#e74c3c', marginBottom: '10px' }}>Copias de Seguridad (Backup BD)</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '15px' }}>Genera un archivo SQL de respaldo de todas las tablas.</p>
                  <button className="btn-primary" style={{ background: '#e74c3c', boxShadow: 'none', width: '100%' }}>Generar Backup SQL</button>
                </div>
              </div>
            </div>
            <button className="btn-primary" style={{ marginTop: '20px', background: '#00a650' }}>Guardar Configuración Global</button>
          </div>
        )}

        {/* PESTAÑA: TIENDAS */}
        {activeTab === 'tiendas' && (
          <div style={{ backgroundColor: 'var(--glass-bg)', padding: '40px', borderRadius: '16px', boxShadow: 'var(--float-shadow)' }}>
            <h2 style={{ fontSize: '24px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px', marginBottom: '30px' }}>
              Solicitudes de Tiendas
            </h2>
            
            {tiendas.length === 0 ? (
              <p>No hay tiendas registradas.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                    <th style={{ padding: '10px 0' }}>Nombre de Tienda</th>
                    <th>Dueño</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {tiendas.map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '15px 0', fontWeight: 'bold' }}>{t.nombre}</td>
                      <td>{t.dueno}<br/><small style={{color: '#999'}}>{t.email}</small></td>
                      <td>
                        <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', background: t.estado === 'APROBADA' ? 'rgba(0,166,80,0.1)' : t.estado === 'RECHAZADA' ? 'rgba(231,76,60,0.1)' : 'rgba(243,156,18,0.1)', color: t.estado === 'APROBADA' ? '#00a650' : t.estado === 'RECHAZADA' ? '#e74c3c' : '#f39c12' }}>
                          {t.estado}
                        </span>
                      </td>
                      <td>
                        {t.estado === 'PENDIENTE' && (
                          <>
                            <button onClick={() => handleAprobar(t.id)} style={{ padding: '6px 12px', background: '#00a650', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Aprobar</button>
                            <button onClick={() => handleRechazar(t.id)} style={{ padding: '6px 12px', background: 'transparent', color: '#e74c3c', border: '1px solid #e74c3c', borderRadius: '6px', cursor: 'pointer', marginLeft: '10px' }}>Rechazar</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* PESTAÑA: CATEGORIAS */}
        {activeTab === 'categorias' && (
          <div style={{ backgroundColor: 'var(--glass-bg)', padding: '40px', borderRadius: '16px', boxShadow: 'var(--float-shadow)' }}>
            <h2 style={{ fontSize: '24px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px', marginBottom: '30px' }}>
              Gestión de Categorías Globales
            </h2>
            
            <form onSubmit={handleCrearCategoria} style={{ display: 'flex', gap: '15px', marginBottom: '40px' }}>
              <input 
                type="text" 
                value={nuevaCategoria} 
                onChange={(e) => setNuevaCategoria(e.target.value)} 
                placeholder="Nombre de la nueva categoría (Ej. Computación)" 
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                required 
              />
              <button type="submit" className="btn-primary" style={{ background: '#3498db', boxShadow: 'none' }}>+ Agregar Categoría</button>
            </form>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                  <th style={{ padding: '10px 0' }}>ID</th>
                  <th>Nombre de la Categoría</th>
                  <th>Fecha de Creación</th>
                </tr>
              </thead>
              <tbody>
                {categorias.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '15px 0', color: '#999' }}>#{c.id}</td>
                    <td style={{ fontWeight: 'bold' }}>{c.nombre}</td>
                    <td style={{ fontSize: '14px' }}>{new Date(c.fecha_creacion).toLocaleDateString()}</td>
                  </tr>
                ))}
                {categorias.length === 0 && (
                  <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>No hay categorías registradas.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* PESTAÑA: FINANZAS */}
        {activeTab === 'finanzas' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h1 style={{ fontSize: '28px', color: 'var(--primary-color)' }}>Dashboard Financiero</h1>
              <div style={{ display: 'flex', gap: '15px' }}>
                <select value={rangoFecha} onChange={e => setRangoFecha(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', background: 'var(--glass-bg)' }}>
                  <option value="hoy">Hoy</option>
                  <option value="semana">Últimos 7 días</option>
                  <option value="mes">Este Mes</option>
                  <option value="siempre">Histórico (Siempre)</option>
                </select>
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--glass-bg)', padding: '5px 15px', borderRadius: '8px', border: '1px solid #ddd' }}>
                  <span style={{ fontSize: '12px', marginRight: '10px' }}>Comisión %:</span>
                  <input type="number" step="0.01" value={comisionEdit} onChange={e => setComisionEdit(e.target.value)} style={{ width: '60px', padding: '5px', border: 'none', background: '#f5f5f5', borderRadius: '4px', textAlign: 'center' }} />
                  <button onClick={handleActualizarComision} style={{ marginLeft: '10px', background: 'var(--primary-color)', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Guardar</button>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
              <div style={{ background: 'var(--glass-bg)', padding: '30px', borderRadius: '16px', boxShadow: 'var(--float-shadow)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', right: '-20px', top: '-10px', fontSize: '100px', opacity: 0.05 }}>💰</div>
                <div style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '10px' }}>Volumen Bruto (Ventas)</div>
                <div style={{ fontSize: '38px', fontWeight: 'bold', color: '#111827' }}>S/ {Number(finanzas?.volumenBruto || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                <div style={{ fontSize: '13px', color: '#00a650', marginTop: '10px', fontWeight: 'bold' }}>Transacciones procesadas</div>
              </div>
              
              <div style={{ background: 'var(--glass-bg)', padding: '30px', borderRadius: '16px', boxShadow: 'var(--float-shadow)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', right: '-20px', top: '-10px', fontSize: '100px', opacity: 0.05 }}>📈</div>
                <div style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '10px' }}>Ingresos (Comisión {finanzas?.porcentajeComision || 5}%)</div>
                <div style={{ fontSize: '38px', fontWeight: 'bold', color: 'var(--primary-color)' }}>S/ {Number(finanzas?.ingresosKatalogo || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                <div style={{ fontSize: '13px', color: 'var(--primary-color)', marginTop: '10px', fontWeight: 'bold' }}>Ganancia neta Katalogo</div>
              </div>
              
              <div style={{ background: 'var(--glass-bg)', padding: '30px', borderRadius: '16px', boxShadow: 'var(--float-shadow)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', right: '-20px', top: '-10px', fontSize: '100px', opacity: 0.05 }}>💸</div>
                <div style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '10px' }}>Saldos Pendientes a Tiendas</div>
                <div style={{ fontSize: '38px', fontWeight: 'bold', color: '#e74c3c' }}>S/ {Number(finanzas?.pagosPendientesTiendas || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                <div style={{ fontSize: '13px', color: '#e74c3c', marginTop: '10px', fontWeight: 'bold' }}>Liquidez adeudada</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px', marginBottom: '40px' }}>
              {/* Gráfica */}
              <div style={{ backgroundColor: 'var(--glass-bg)', padding: '40px', borderRadius: '16px', boxShadow: 'var(--float-shadow)' }}>
                <h2 style={{ fontSize: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px', marginBottom: '20px' }}>Analítica de Ingresos</h2>
                <div style={{ height: '300px' }}>
                  {finanzas?.historico?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={finanzas.historico} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis dataKey="fecha" stroke="#888" fontSize={12} />
                        <YAxis yAxisId="left" stroke="#888" fontSize={12} tickFormatter={(v) => `S/ ${v}`} />
                        <YAxis yAxisId="right" orientation="right" stroke="var(--primary-color)" fontSize={12} tickFormatter={(v) => `S/ ${v}`} />
                        <Tooltip formatter={(value) => `S/ ${Number(value).toFixed(2)}`} />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="volumen" name="Volumen Bruto (Ventas)" stroke="#111827" strokeWidth={3} activeDot={{ r: 8 }} />
                        <Line yAxisId="right" type="monotone" dataKey="ganancia" name="Comisión Katalogo" stroke="var(--primary-color)" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>No hay datos suficientes para este rango.</div>
                  )}
                </div>
              </div>

              {/* Tabla de Payouts */}
              <div style={{ backgroundColor: 'var(--glass-bg)', padding: '40px', borderRadius: '16px', boxShadow: 'var(--float-shadow)' }}>
                <h2 style={{ fontSize: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px', marginBottom: '20px' }}>Liquidaciones Pendientes por Tienda</h2>
                {liquidaciones.length === 0 ? (
                  <p style={{ color: '#888' }}>No hay saldos pendientes. Todas las tiendas están al día.</p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                        <th style={{ padding: '10px 0' }}>Tienda</th>
                        <th>Órdenes Pendientes</th>
                        <th>Volumen Total</th>
                        <th>Comisión ({config?.comision_plataforma}%)</th>
                        <th>A Pagar</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {liquidaciones.map(l => (
                        <tr key={l.tienda_id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '15px 0', fontWeight: 'bold' }}>{l.tienda_nombre}</td>
                          <td>{l.cantidad_ordenes}</td>
                          <td>S/ {l.volumen_total.toFixed(2)}</td>
                          <td style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>S/ {l.comision.toFixed(2)}</td>
                          <td style={{ color: '#e74c3c', fontWeight: 'bold', fontSize: '16px' }}>S/ {l.a_pagar.toFixed(2)}</td>
                          <td>
                            <button onClick={() => handlePagarLiquidacion(l.tienda_id)} style={{ padding: '8px 15px', background: '#00a650', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                              ✅ Pagar / Liquidar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA: PEDIDOS (GLOBAL) */}
        {activeTab === 'pedidos' && (
          <div style={{ backgroundColor: 'var(--glass-bg)', padding: '40px', borderRadius: '16px', boxShadow: 'var(--float-shadow)' }}>
            <h2 style={{ fontSize: '24px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px', marginBottom: '30px' }}>
              Gestión Global de Pedidos
            </h2>
            
            {ordenesGlobales.length === 0 ? (
              <p>No hay pedidos registrados en la plataforma.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '10px 0' }}>ID Orden</th>
                    <th>Cliente</th>
                    <th>Tienda (Vendedor)</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {ordenesGlobales.map(o => (
                    <tr key={o.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '15px 0', fontWeight: 'bold', color: '#3498db' }}>#{o.id}</td>
                      <td>{o.cliente_nombre}</td>
                      <td>{o.tienda_nombre}</td>
                      <td style={{ fontWeight: 'bold', color: '#00a650' }}>S/ {Number(o.total).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                      <td>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', 
                          background: o.estado === 'ENTREGADO' ? 'rgba(0,166,80,0.1)' : o.estado === 'PENDIENTE' ? 'rgba(243,156,18,0.1)' : 'rgba(52,152,219,0.1)', 
                          color: o.estado === 'ENTREGADO' ? '#00a650' : o.estado === 'PENDIENTE' ? '#f39c12' : '#3498db' 
                        }}>
                          {o.estado}
                        </span>
                      </td>
                      <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{new Date(o.fecha_creacion).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
