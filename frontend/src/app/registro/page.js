'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegistroPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'CLIENTE',
    telefono: '',
    dni: ''
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://10.159.200.34/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        alert('Cuenta creada con éxito. Ahora puedes iniciar sesión.');
        router.push('/login');
      } else {
        setError(data.message || 'Error al registrar usuario');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div style={{ backgroundColor: 'var(--glass-bg)', padding: '40px', borderRadius: '16px', boxShadow: 'var(--float-shadow)', width: '100%', maxWidth: '500px', backdropFilter: 'blur(10px)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '24px', color: 'var(--text-primary)' }}>
          Crea tu cuenta en Katalogo
        </h2>
        
        {error && <div style={{ backgroundColor: '#e74c3c', color: '#fff', padding: '10px', borderRadius: '4px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          
          <div style={{ marginBottom: '20px', display: 'flex', gap: '15px' }}>
            <label style={{ flex: 1, padding: '15px', border: formData.rol === 'CLIENTE' ? '2px solid #4facfe' : '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', background: formData.rol === 'CLIENTE' ? 'rgba(79, 172, 254, 0.1)' : 'transparent', fontWeight: 'bold' }}>
              <input type="radio" name="rol" value="CLIENTE" checked={formData.rol === 'CLIENTE'} onChange={handleChange} style={{ display: 'none' }} />
              👤 Soy Cliente
            </label>
            <label style={{ flex: 1, padding: '15px', border: formData.rol === 'VENDEDOR' ? '2px solid #9b59b6' : '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', background: formData.rol === 'VENDEDOR' ? 'rgba(155, 89, 182, 0.1)' : 'transparent', fontWeight: 'bold' }}>
              <input type="radio" name="rol" value="VENDEDOR" checked={formData.rol === 'VENDEDOR'} onChange={handleChange} style={{ display: 'none' }} />
              🏬 Soy Vendedor
            </label>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: 'var(--text-secondary)' }}>Nombre completo / Razón Social</label>
            <input type="text" name="nombre" required value={formData.nombre} onChange={handleChange} style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '8px' }} />
          </div>

          <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: 'var(--text-secondary)' }}>DNI / RUC</label>
              <input type="text" name="dni" value={formData.dni} onChange={handleChange} style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '8px' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: 'var(--text-secondary)' }}>Teléfono</label>
              <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '8px' }} />
            </div>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: 'var(--text-secondary)' }}>E-mail</label>
            <input type="email" name="email" required value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '8px' }} />
          </div>
          
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: 'var(--text-secondary)' }}>Contraseña</label>
            <input type="password" name="password" required value={formData.password} onChange={handleChange} style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '8px' }} />
          </div>
          
          <button type="submit" className="btn-primary" style={{ width: '100%' }} aria-label="Botón para crear cuenta">
            Crear cuenta
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>¿Ya tienes cuenta? </span>
          <Link href="/login" style={{ color: '#4facfe', textDecoration: 'none', fontWeight: 'bold' }}>Inicia sesión</Link>
        </div>
      </div>
    </div>
  );
}
