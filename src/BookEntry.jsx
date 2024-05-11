import React, { useState, useEffect } from 'react';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

function BookEntry(props) {
    const [openPopupId, setOpenPopupId] = useState(null); // Estado para controlar el popup abierto
    const [quantity, setQuantity] = useState(1); // Estado para almacenar la cantidad de libros
    const [maxQuantity, setMaxQuantity] = useState(1); // Estado para almacenar el máximo permitido

    useEffect(() => {
        // Actualiza el máximo permitido al valor del stock
        setMaxQuantity(props.stock);
    }, [props.stock]);

    const handleOpenPopup = (id) => {
        setOpenPopupId(id === openPopupId ? null : id); // Si el popup está abierto, ciérralo; si no, ábrelo
    };

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        // Limita la cantidad al máximo permitido
        setQuantity(Math.min(value, maxQuantity));
    };

    const handleAddToCart = async () => {
        try {
            const token = localStorage.getItem('token id');
            
            const requestBody = {
                userId: props.userId,
                bookId: props.id,
                cantidad: quantity // Utiliza la cantidad seleccionada
            };
            const response = await fetch(`/api/addToCart`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                const data = await response.json();
                alert(data.message);
            } else {
                const errorMessage = await response.text();
                alert(`Error: ${errorMessage}`);
            }
        } catch (error) {
            console.error('Error al agregar libro al carrito:', error);
            alert('Error al agregar libro al carrito');
        } finally {
            setOpenPopupId(null); // Cierra el popup después de agregar al carrito
        }
    }; 

    const handleCancel = () => {
        setOpenPopupId(null); // Cierra el popup al cancelar
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
                    <AddShoppingCartIcon className="Addcart" onClick={() => handleOpenPopup(props.id)} />
                </div>
                {openPopupId === props.id && (
                    <div className="popup-container">
                        <h2>Seleccionar cantidad</h2>
                        <input
                            type="number"
                            value={quantity}
                            onChange={handleQuantityChange}
                            min={1}
                            max={maxQuantity} // Limita la cantidad al stock disponible
                        />
                        <button onClick={handleAddToCart}>Agregar al carrito</button>
                        <button onClick={handleCancel}>Cancelar</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default BookEntry;
