import React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from 'react';

function CarBookEntry(props) {
    const handleDelete = async () => {
        try {
            const token = localStorage.getItem('token id');
            const response = await fetch(`/api/deleteToCart/${props.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                props.onDelete(props.id);
                alert('Libro eliminado del carrito exitosamente.'); // Alerta de eliminación exitosa
            } else {
                console.error('Failed to delete book from cart:', response.statusText);
            }
        } catch (error) {
            console.error('Error deleting book from cart:', error.message);
        }
    };

    return (
        <div className="form-container">
            <div className="book-detail-container">
                <img className='book-cover-container' src={`/uploads/${props.portada}`} alt={props.titulo} />
                <div className="book-info">
                    <h2>{props.titulo}</h2>
                    <p>Autor: {props.autor}</p>
                    <p>ISBN: {props.isbn}</p>
                    <p>Editorial: {props.nombre_editorial}</p>
                    <p>Idioma: {props.idioma}</p>
                    <p>Cantidad: {props.cantidad}</p>
                    <p>Precio total: ${props.precio_total}</p>
                </div>
                <DeleteIcon style={{ fontSize: '5rem' }} onClick={handleDelete} />
            </div>
        </div>
    );
}

export default CarBookEntry;
