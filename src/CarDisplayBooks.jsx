import React, { useState, useEffect } from 'react';
import CarBookEntry from './CarBookEntry';
import "../src/styles/layoutbook.css";

function CarDisplayBooks() {
    const [books, setBooks] = useState([]);
    const [sortBy, setSortBy] = useState('');
    const [userId, setUserId] = useState(null); 

    useEffect(() => {
        fetchBooks();
        const token = localStorage.getItem('token');
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const userId = decodedToken.userId;
        setUserId(userId);
    }, [sortBy]);

    const fetchBooks = async () => {
        try {
            const token = localStorage.getItem("token id")
            const response = await fetch('/api/renderCarrito', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (response.ok) {
                const booksData = await response.json();
                setBooks(booksData);
                console.log(booksData); 
            } else {
                console.error('Failed to fetch books:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching books:', error.message);
        }
    };

    const handleDeleteBook = (deletedBookId) => {
        // Filtra los libros para excluir el libro eliminado
        const updatedBooks = books.filter(book => book.id_de_libro !== deletedBookId);
        setBooks(updatedBooks);
    };

    return (
        <div className="books-container">
            <div className="books-list">
                {books.map(bookItem => (
                    <CarBookEntry
                        key={bookItem.id_de_libro}
                        id={bookItem.id_de_libro}
                        cantidad={bookItem.cantidad}
                        titulo={bookItem.titulo}
                        autor={bookItem.autor}
                        isbn={bookItem.isbn}
                        idioma={bookItem.idioma}
                        precio_total={bookItem.precio_total}
                        nombre_editorial={bookItem.nombre_editorial}
                        portada={bookItem.portada}
                        onDelete={handleDeleteBook} // Pasa la función de eliminación como prop
                    />
                ))}
            </div>
        </div>
    );
}

export default CarDisplayBooks;
