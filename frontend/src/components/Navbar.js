'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SearchBar from './SearchBar';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkUser = () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        setUser(JSON.parse(userStr));
      } else {
        setUser(null);
      }
    };
    
    checkUser();
    window.addEventListener('user-changed', checkUser);
    return () => window.removeEventListener('user-changed', checkUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.dispatchEvent(new Event('user-changed'));
    router.push('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-left">
          <Link href="/" className="logo" style={{ color: '#3b3be6' }}>Katalogo</Link>
          
          <div className="nav-links">
            <Link href="/" className={pathname === '/' ? 'active' : ''}>Explorar</Link>
            <Link href="/lanzamientos" className={pathname === '/lanzamientos' ? 'active' : ''}>Lanzamientos</Link>
            <Link href="/tendencias" className={pathname === '/tendencias' ? 'active' : ''}>Tendencias</Link>
            <Link href="/boveda" className={pathname === '/boveda' ? 'active' : ''}>Bóveda</Link>
          </div>
        </div>

        <SearchBar />

        <div className="nav-icons">
          <Link href="/carrito" className="icon-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
          </Link>
          
          {!user ? (
            <>
              <Link href="/login" className="icon-btn">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </Link>
              <Link href="/login" className="btn-primary">Conectar</Link>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>{user.nombre.split(' ')[0]}</span>
              
              {user.rol === 'VENDEDOR' && <Link href="/vendedor" className="btn-outline" style={{ padding: '6px 12px', fontSize: '12px' }}>Tienda</Link>}
              {user.rol === 'ADMIN' && <Link href="/admin" className="btn-outline" style={{ padding: '6px 12px', fontSize: '12px' }}>Admin</Link>}
              {user.rol === 'CLIENTE' && <Link href="/panel" className="btn-outline" style={{ padding: '6px 12px', fontSize: '12px' }}>Panel</Link>}

              <button onClick={handleLogout} className="btn-outline" style={{ padding: '6px 12px', fontSize: '12px' }}>Salir</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
