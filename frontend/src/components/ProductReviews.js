'use client';

import { useState, useEffect } from 'react';

export default function ProductReviews({ productoId, initialRating, initialReviews }) {
    const [reviews, setReviews] = useState(initialReviews || []);
    const [rating, setRating] = useState(initialRating || { promedio: 0, total: 0 });
    const [user, setUser] = useState(null);
    const [comentario, setComentario] = useState('');
    const [calificacion, setCalificacion] = useState(5);

    useEffect(() => {
        const userString = localStorage.getItem('user');
        if (userString) {
            setUser(JSON.parse(userString));
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            alert('Debes iniciar sesión para dejar una reseña');
            return;
        }
        
        try {
            const res = await fetch(`http://localhost:5000/api/productos/${productoId}/valorar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuario_id: user.id,
                    calificacion: parseInt(calificacion),
                    comentario
                })
            });
            
            const data = await res.json();
            
            if (res.ok) {
                alert('¡Gracias por tu reseña!');
                setComentario('');
                // Recargar reseñas (idealmente fetch de nuevo o simplemente simular por ahora)
                setReviews([{
                    id: Date.now(),
                    calificacion: parseInt(calificacion),
                    comentario,
                    fecha: new Date().toISOString(),
                    usuario: user.nombre
                }, ...reviews]);
                // Recalcular promedio aprox
                const nuevoTotal = parseInt(rating.total) + 1;
                const nuevoPromedio = ((parseFloat(rating.promedio) * parseInt(rating.total)) + parseInt(calificacion)) / nuevoTotal;
                setRating({ promedio: nuevoPromedio.toFixed(1), total: nuevoTotal });
            } else {
                alert(data.message || 'No se pudo publicar la reseña');
            }
        } catch (error) {
            alert('Error al enviar reseña');
        }
    };

    return (
        <div style={{ marginTop: '40px', backgroundColor: 'var(--glass-bg)', padding: '40px', borderRadius: '16px', boxShadow: 'var(--float-shadow)' }}>
            <h2 className="section-title">Opiniones sobre el producto</h2>
            
            {/* Header de Reseñas */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#f1c40f' }}>{rating.promedio} ⭐</div>
                <div style={{ color: 'var(--text-secondary)' }}>Basado en {rating.total} valoraciones</div>
            </div>

            {/* Formulario para agregar reseña */}
            <form onSubmit={handleSubmit} style={{ background: '#f9f9f9', padding: '20px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #eee' }}>
                <h4 style={{ margin: '0 0 15px' }}>Dejar una Reseña</h4>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px' }}>Calificación</label>
                    <select value={calificacion} onChange={e => setCalificacion(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}>
                        <option value="5">5 ⭐ - Excelente</option>
                        <option value="4">4 ⭐ - Muy bueno</option>
                        <option value="3">3 ⭐ - Bueno</option>
                        <option value="2">2 ⭐ - Regular</option>
                        <option value="1">1 ⭐ - Malo</option>
                    </select>
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px' }}>Comentario (opcional)</label>
                    <textarea value={comentario} onChange={e => setComentario(e.target.value)} rows="3" placeholder="¿Qué te pareció el producto?" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}></textarea>
                </div>
                <button type="submit" style={{ padding: '10px 20px', background: '#333', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Publicar Opinión</button>
            </form>

            {/* Lista de Reseñas */}
            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {reviews.length === 0 ? (
                    <p style={{ color: '#888' }}>No hay opiniones aún. ¡Sé el primero en valorar este producto!</p>
                ) : (
                    reviews.map(r => (
                        <div key={r.id} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                <span style={{ fontWeight: 'bold' }}>{r.usuario}</span>
                                <span style={{ color: '#f1c40f' }}>{'⭐'.repeat(r.calificacion)}</span>
                            </div>
                            <div style={{ fontSize: '12px', color: '#999', marginBottom: '10px' }}>
                                {new Date(r.fecha).toLocaleDateString()}
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>{r.comentario}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
