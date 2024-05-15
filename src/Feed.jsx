import React, { useState } from 'react';
import InputForm from './InputForm';
import FolderIcon from '@mui/icons-material/Folder';

function Feed() {
    const initialFormData = {
        titulo: '',
        autor: '',
        isbn: '',
        descripcion: '',
        image: null,
        precio: 0,
        stock: 0,
        idioma: 'Español',
        editorial: 1
    };

    const [formBookData, setFormData] = useState(initialFormData);
    const [selectedFile, setSelectedFile] = useState(null);

    const handleChange = (fieldName, value) => {
        setFormData({
            ...formBookData,
            [fieldName]: value,
        });
    };

    const handleImageChange = (event) => {
        const imageFile = event.target.files[0];
        setSelectedFile(imageFile);
        setFormData({ ...formBookData, image: imageFile });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        try {
            const token = localStorage.getItem('token id');
            const formData = new FormData();
            formData.append('titulo', formBookData.titulo);
            formData.append('autor', formBookData.autor);
            formData.append('isbn', formBookData.isbn);
            formData.append('descripcion', formBookData.descripcion);
            formData.append('precio', formBookData.precio);
            formData.append('stock', formBookData.stock);
            formData.append('idioma', formBookData.idioma);
            formData.append('editorial', formBookData.editorial);
            formData.append('image', selectedFile); 
    
            const response = await fetch('/api/addBook', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Book registration failed');
            }
    
            setFormData(initialFormData);
            setSelectedFile(null);
            alert('Book added successfully');
        } catch (error) {
            alert('Book registration failed: ' + error.message);
            console.error('Book registration failed:', error);
        }
    };

    

    return (
        <div className="form-container">
            <h1 className="header">Registra el libro</h1>
            <form className="form" onSubmit={handleSubmit}>
                <InputForm
                    placeholder="TITULO"
                    id="titulo"
                    name="titulo"
                    type="text"
                    value={formBookData.titulo}
                    onChange={(value) => handleChange('titulo', value)}
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
                    placeholder="SINOPSIS"
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
                <input
                    type="file"
                    id="fileInput"
                    style={{ display: 'none' }}
                    onChange={handleImageChange}
                    accept="image/*"
                />
                <label htmlFor="fileInput">
                    {selectedFile ? <p style={{marginBottom: '3px'}}>Portada: {selectedFile.name}</p> : <p style={{marginBottom: '3px'}}>Portada: </p> }
                    <FolderIcon style={{marginBottom: '10px', cursor: 'pointer'}} />
                </label>
                <div className="button-container">
                    <button type="submit" className="signup-button">
                        INGRESAR LIBRO
                    </button>
                </div>
            </form>
            <div className="footer">
                <a href="/MaestroDetalle" className="login-link">
                    Finalizar registros
                </a>
            </div>
        </div>
    );
}

export default Feed;
