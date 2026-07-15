'use client';

import { useState, useEffect } from 'react';

export default function FavoriteButton({ productoId }) {
    const [esFavorito, setEsFavorito] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userString = localStorage.getItem('user');
        if (userString) {
            const parsedUser = JSON.parse(userString);
            setUser(parsedUser);
            // Verificar si está en favoritos
            fetch(`http://10.159.200.34/api/favoritos/usuario/${parsedUser.id}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data) && data.some(f => f.producto_id === productoId)) {
                        setEsFavorito(true);
                    }
                })
                .catch(console.error);
        }
    }, [productoId]);

    const toggleFavorito = async () => {
        if (!user) {
            alert('Debes iniciar sesión para guardar en tu Lista de Deseos');
            return;
        }

        try {
            if (esFavorito) {
                await fetch('http://10.159.200.34/api/favoritos', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ usuario_id: user.id, producto_id: productoId })
                });
                setEsFavorito(false);
            } else {
                await fetch('http://10.159.200.34/api/favoritos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ usuario_id: user.id, producto_id: productoId })
                });
                setEsFavorito(true);
            }
        } catch (error) {
            console.error('Error toggling favorito', error);
        }
    };

    return (
        <button 
            onClick={toggleFavorito} 
            style={{ 
                background: 'none', 
                border: 'none', 
                fontSize: '28px', 
                cursor: 'pointer', 
                color: esFavorito ? '#e74c3c' : '#ccc',
                transition: 'transform 0.2s',
                transform: esFavorito ? 'scale(1.1)' : 'scale(1)'
            }}
            title={esFavorito ? 'Quitar de Favoritos' : 'Añadir a Favoritos'}
        >
            {esFavorito ? '❤️' : '🤍'}
        </button>
    );
}
