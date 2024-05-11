import React, { useState, useEffect } from 'react';
import BookEntry from './BookEntry';
import "../src/styles/layoutbook.css";

function DisplayBooks() {
    const [books, setBooks] = useState([]);
    const [sortBy, setSortBy] = useState('');
    const [userId, setUserId] = useState(null); // Estado para almacenar userId

    useEffect(() => {
        fetchBooks();
        // Obtener userId del almacenamiento local al cargar el componente
        const token = localStorage.getItem('token');
        const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decodificar token JWT
        const userId = decodedToken.userId;
        setUserId(userId);
    }, [sortBy]);

    const fetchBooks = async () => {
        try {
            const token = localStorage.getItem('token id');
            const response = await fetch(`/api/renderBooks?sortBy=${sortBy}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (response.ok) {
                const booksData = await response.json();
                setBooks(booksData);
            } else {
                console.error('Failed to fetch books:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching books:', error.message);
        }
    };

    const handleSortChange = (event) => {
        setSortBy(event.target.value);
    };

    return (
        <div className="books-container">
            <h1 className="form-container" style={{ textAlign: 'center' }}>Libros en venta</h1>
            <h3>Ordenar por:</h3>
            <select name="opciones" onChange={handleSortChange} value={sortBy}>
                <option value="">Defecto</option>
                <option value="title">Por orden alfabético</option>
                <option value="stock">Por orden de stock ascendente</option>
                <option value="price_asc">Por más barato</option>
                <option value="price_desc">Por más caro</option>
                <option value="spanish">Por idioma Español</option>
                <option value="english">Por idioma Inglés</option>
            </select>
            <div className="books-list">
                {books.map(bookItem => (
                    <BookEntry
                        key={bookItem.id_de_libro}
                        id={bookItem.id_de_libro}
                        cantidad={1} // O ajusta esto según lo que desees
                        titulo={bookItem.titulo}
                        autor={bookItem.autor}
                        isbn={bookItem.isbn}
                        idioma={bookItem.idioma}
                        precio={bookItem.precio}
                        sinopsis={bookItem.sinopsis}
                        stock={bookItem.stock}
                        nombre_editorial={bookItem.nombre_editorial}
                        portada={bookItem.portada}
                        userId={userId} // Pasar userId al componente BookEntry
                    />
                ))}
            </div>
        </div>
    );
}

export default DisplayBooks;
