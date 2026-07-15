'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef(null);

  // Cerrar el dropdown si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce para la búsqueda en vivo
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim().length > 1) {
        fetch(`http://localhost:5000/api/productos?search=${encodeURIComponent(query)}`)
          .then(res => res.json())
          .then(data => {
            setResults(data);
            setShowDropdown(true);
          })
          .catch(err => console.error("Error buscando:", err));
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setShowDropdown(false);
      router.push(`/buscar?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div style={{ position: 'relative', flex: 1, margin: '0 40px', maxWidth: '600px' }} ref={dropdownRef}>
      <form className="search-bar" onSubmit={handleSearch} style={{ margin: 0, width: '100%' }}>
        <input 
          type="text" 
          className="search-input" 
          placeholder="Buscar productos, marcas y más..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length > 1 && setShowDropdown(true)}
          style={{ width: '100%', boxSizing: 'border-box' }}
        />
        <button type="submit" className="search-button">🔍</button>
      </form>

      {/* Menú Flotante del Autocompletado */}
      {showDropdown && results.length > 0 && (
        <div style={{ 
          position: 'absolute', top: '100%', left: 0, right: 0, 
          backgroundColor: 'var(--glass-bg)', backdropFilter: 'blur(20px)', 
          marginTop: '10px', borderRadius: '12px', boxShadow: 'var(--float-shadow)', 
          zIndex: 1000, overflow: 'hidden', border: '1px solid var(--glass-border)'
        }}>
          {results.slice(0, 5).map(item => (
            <Link 
              key={item.id} 
              href={`/producto/${item.id}`} 
              onClick={() => { setShowDropdown(false); setQuery(''); }}
              style={{ display: 'flex', alignItems: 'center', padding: '15px 20px', textDecoration: 'none', color: 'var(--text-primary)', borderBottom: '1px solid rgba(0,0,0,0.05)', transition: 'background-color 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(79, 172, 254, 0.1)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={{ marginRight: '15px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {(item.imagen_url && (item.imagen_url.startsWith('http') || item.imagen_url.startsWith('blob') || item.imagen_url.startsWith('data'))) 
                  ? <img src={item.imagen_url} alt={item.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                  : <span style={{ fontSize: '24px' }}>{item.imagen_url || '📦'}</span>
                }
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{item.nombre}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Vendido por {item.tienda}</div>
              </div>
              <div style={{ color: '#00a650', fontWeight: 'bold' }}>
                ${Number(item.precio).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </Link>
          ))}
          
          {results.length > 5 && (
            <Link 
              href={`/buscar?q=${encodeURIComponent(query)}`}
              onClick={() => setShowDropdown(false)}
              style={{ display: 'block', textAlign: 'center', padding: '12px', color: '#4facfe', fontWeight: 'bold', textDecoration: 'none', backgroundColor: 'rgba(255,255,255,0.5)' }}
            >
              Ver todos los {results.length} resultados
            </Link>
          )}
        </div>
      )}
      
      {showDropdown && results.length === 0 && query.trim().length > 1 && (
        <div style={{ 
          position: 'absolute', top: '100%', left: 0, right: 0, 
          backgroundColor: 'var(--glass-bg)', backdropFilter: 'blur(20px)', 
          marginTop: '10px', borderRadius: '12px', boxShadow: 'var(--float-shadow)', 
          zIndex: 1000, padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)'
        }}>
          No se encontraron productos para "{query}"
        </div>
      )}
    </div>
  );
}
