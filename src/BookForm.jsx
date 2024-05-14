import React, { useState } from 'react';
import InputForm from './InputForm';


function BookForm() {
    const initialFormData = {
        titulo: '',
        autor: '',
        isbn: '',
        descripcion: '',
        precio: 0,
        stock: 0,
        idioma: 'Español',
        editorial: 1
    };

    const [formBookData, setFormData] = useState(initialFormData);

    const handleChange = (fieldName, value) => {
        setFormData({
            ...formBookData,
            [fieldName]: value,
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const tokenLibro = localStorage.getItem('id libro');
            const token = localStorage.getItem('token id');
            const updatedFormData = { ...formBookData, idUsuario: token, idLibro: tokenLibro };

            const response = await fetch('/api/editBook', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(updatedFormData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Book update failed');
            }

            // Reset the form data after successful registration
            setFormData(initialFormData);
            alert('Libro editado correctamente');
            window.location.href = '/feed';
        } catch (error) {
        }
    };

    return (
        <div className="form-container">
            <h1 className="header">Edita el libro</h1>
            <form className="form" onSubmit={handleSubmit}>
                <InputForm
                    placeholder="TITULO"
                    id="titulo"
                    name="titulo"
                    type="text"
                    value={formBookData.titulo}
                    onChange={(value) => handleChange('titulo', value)}
                    required
                />
                <InputForm
                    placeholder="AUTOR"
                    id="autor"
                    name="autor"
                    type="text"
                    value={formBookData.autor}
                    onChange={(value) => handleChange('autor', value)}
                />
                <InputForm
                    placeholder="CODIGO ISBN"
                    id="isbn"
                    name="isbn"
                    type="text"
                    value={formBookData.isbn}
                    onChange={(value) => handleChange('isbn', value)}
                />
                <InputForm
                    placeholder="DESCRIPCION"
                    id="descripcion"
                    name="descripcion"
                    type="text"
                    value={formBookData.descripcion}
                    onChange={(value) => handleChange('descripcion', value)}
                />
                <InputForm
                    placeholder="PRECIO"
                    id="precio"
                    name="precio"
                    type="number"
                    step="any"
                    value={formBookData.precio}
                    onChange={(value) => handleChange('precio', value)}
                />
                <InputForm
                    placeholder="STOCK"
                    id="stock"
                    name="stock"
                    type="number"
                    value={formBookData.stock}
                    onChange={(value) => handleChange('stock', value)}
                />
                <select 
                    name="idioma" 
                    className="opciones"
                    value={formBookData.idioma}
                    onChange={(e) => handleChange('idioma', e.target.value)}
                >
                    <option value="Español">Español</option>
                    <option value="English">Inglés</option>
                </select>
                <select 
                    name="editorial" 
                    className="opciones"
                    value={formBookData.editorial}
                    onChange={(e) => handleChange('editorial', e.target.value)}
                >
                    <option value={1}>Editorial Alfaguara</option>
                    <option value={2}>Editorial Planeta</option>
                    <option value={3}>Editorial Santillana</option>
                    <option value={4}>Editorial Penguin Random House</option>
                    <option value={5}>Editorial Anagrama</option>
                    <option value={6}>Editorial Tusquets</option>
                    <option value={7}>Editorial Paidós</option>
                    <option value={8}>Editorial Norma</option>
                    <option value={9}>Editorial FDC Económica</option>
                    <option value={10}>Editorial Debate</option>
                </select>
                <div className="button-container">
                    <button type="submit" className="signup-button" onClick = {()=>{window.location.href = "libros"}}>
                        EDITAR
                    </button>
                </div>
            </form>
            <div className="regresar">
                <a href="/libros" className="login-link">
                    Regresar
                </a>
            </div>
        </div>
    );
}

export default BookForm;
