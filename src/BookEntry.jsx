import React from 'react';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

function BookEntry(props) {
    const handleAddToCart = () => {
        // Lógica para agregar el libro al carrito
        props.onAddToCart({
            id: props.id,
            titulo: props.titulo,
            autor: props.autor,
            isbn: props.isbn,
            idioma: props.idioma,
            precio: props.precio,
            sinopsis: props.sinopsis,
            stock: props.stock,
            nombre_editorial: props.nombre_editorial,
            portada: props.portada
        });
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
                    <p>Precio: ${props.precio}</p>
                    <p>Stock: {props.stock}</p>
                    <p>Idioma: {props.idioma}</p>
                    <p>Sinopsis: {props.sinopsis}</p>
                </div>
                <div className="actions">
                    <AddShoppingCartIcon onClick={handleAddToCart} />
                </div>
            </div>
        </div>
    );
}

export default BookEntry;
