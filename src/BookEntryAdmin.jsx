import React, { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Feed from './Feed';
function BookEntry(props) {
    const [openPopupId, setOpenPopupId] = useState(null); // Estado para controlar el popup abierto
    const [popupType, setPopupType] = useState(null); // Estado para controlar el tipo de popup: 'editar' o 'eliminar'

    const handleOpenPopupEdit = (id) => {
        setOpenPopupId(id); // Abre el popup de edición con el ID del libro
        setPopupType('editar'); // Establece el tipo de popup como 'editar'
    };

    const handleOpenDelete = (id) => {
        setOpenPopupId(id); // Abre el popup de eliminación con el ID del libro
        setPopupType('eliminar'); // Establece el tipo de popup como 'eliminar'
    };

    const handleCancel = () => {
        setOpenPopupId(null); // Cierra el popup al cancelar
        setPopupType(null); // Reinicia el tipo de popup
    };

    const handleConfirmDelete = async () => {
        const token = localStorage.getItem("token id");
        try {
            alert(openPopupId)
            const response = await fetch(`/api/deleteBook/${openPopupId}`, {
                method: 'DELETE',
                headers: { 
                    'Authorization': 'Bearer ' + token
                }
            });
            if (response.ok) {
                console.log('Libro eliminado con ID:', openPopupId);
                setOpenPopupId(null);
                setPopupType(null);
            } else {
                console.error('Error al eliminar el libro:', response.statusText);
            }
            window.location.href = "libros.html";
        } catch (error) {
            console.error('Error al eliminar el libro:', error);
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
                    <p>Precio: ${props.precio}</p>
                    <p>Stock: {props.stock}</p>
                    <p>Idioma: {props.idioma}</p>
                    <p>Sinopsis: {props.sinopsis}</p>
                </div>
                <div className="actions">
                    <EditIcon className="Addcart"  style={{ fontSize: '5rem' }} onClick={() => handleOpenPopupEdit(props.id)}/>
                    <DeleteIcon  className='Addcart' style={{ fontSize: '5rem' }} onClick={() => handleOpenDelete(props.id)} />
                </div>
                {openPopupId === props.id && (
                    <div className="popup-container">
                        <h2>{popupType === 'editar' ? 'Editar libro' : 'Eliminar libro'}</h2>
                        {popupType === 'eliminar' ? (
                            <div>
                                <p>¿Estás seguro de que quieres eliminar este libro?</p>
                                <button onClick={handleConfirmDelete} className="delete-button">Eliminar</button>
                                <button onClick={handleCancel} className="delete-button">Cancelar</button>
                            </div>
                        ) : (
                            <div>
                                {localStorage.setItem("id libro", props.id)}
                                {window.location.href= "editBookForm" }
                                
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default BookEntry;
