import React, { useState, useEffect } from 'react';
import BookEntry from './BookEntry';
import "../src/styles/layoutbook.css";

function DisplayBooks() {
    const [books, setBooks] = useState([]);

    useEffect(() => {
        async function fetchBooks() {
            try {
                const token = localStorage.getItem('token'); // Obtener el token de localStorage
                const response = await fetch('/api/renderBooks', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` // Incluir el token en el encabezado de autorización
                    }
                });
    
                if (response.ok) {
                    const booksData = await response.json();
                    console.log("Books data");
                    console.log(booksData);
                    setBooks(booksData);
                } else {
                    console.error('Failed to fetch books:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching books:', error.message);
            }
        }
    
        fetchBooks();
    }, []);

    return (
        <div className="books-container">
            <h1 className="form-container" style={{ textAlign: 'center' }}>Libros en venta</h1>
            <h3>Ordenar por:</h3>
            <select name="opciones">
                <option value="opcion1">Defecto</option>
                <option value="opcion2">Por orden alfabético</option>
                <option value="opcion3">Por orden de stock ascendente</option>
                <option value="opcion4">Por más barato</option>
                <option value="opcion5">Por más caro</option>
                <option value="opcion6">Por idioma Español</option>
                <option value="opcion7">Por idioma Inglés</option>
            </select>
            <div className="books-list">
                {books.map(bookItem => (
                    <BookEntry
                        key={bookItem.id_de_libro}
                        id={bookItem.id_de_libro}
                        titulo={bookItem.titulo}
                        autor={bookItem.autor}
                        isbn={bookItem.isbn}
                        idioma={bookItem.idioma}
                        precio={bookItem.precio}
                        sinopsis={bookItem.sinopsis}
                        stock={bookItem.stock}
                        nombre_editorial={bookItem.nombre_editorial}
                        portada={bookItem.portada} // Render the image from Base64 string
                    />
                ))}
            </div>
        </div>
    );
}

export default DisplayBooks;
