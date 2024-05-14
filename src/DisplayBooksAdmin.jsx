import React ,{ useState, useEffect } from "react";
import BookEntry from "./BookEntryAdmin";

function DisplayBooksAdmin(){
    const [books, setBooks] = useState([]);
    const [sortBy, setSortBy] = useState('title');
    const [userId, setUserId] = useState(null); // Estado para almacenar userId

    useEffect(() => {
        fetchBooks();
        // Obtener userId del almacenamiento local al cargar el componente
        const token = localStorage.getItem('token id');
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


    return (
        <div className="books-container">
            <h1 className="form-container" style={{ textAlign: 'center' }}>Libros en venta</h1>
            <button type="button" className="popup-container" onClick={()=>{window.location.href = "adminFeed"}}> Regresar  </button>
            <button type="button" className="popup-container" onClick={()=>{window.location.href = "feed"}}>Insertar nuevo libro</button>
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
                        portada={bookItem.portada}
                        userId={userId} // Pasar userId al componente BookEntry
                    />
                ))}
            </div>
        </div>
    );

}

export default DisplayBooksAdmin;