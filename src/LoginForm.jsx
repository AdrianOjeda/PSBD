// Importa las librerías necesarias
import React, { useState } from 'react';
import InputForm from './InputForm';

function LoginForm() {
    const [formData, setFormData] = useState({
        correo: '',
        password: '',
    });

    const handleChange = (fieldName, value) => {
        setFormData({
            ...formData,
            [fieldName]: value,
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            // Enviar las credenciales al servidor
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            // Verificar si la respuesta es exitosa
            if (response.ok) {
                // Obtener los datos de la respuesta
                const data = await response.json();
                const tokenId = data.token;
                const isAdmin = data.isAdmin;

                // Guardar el token en el almacenamiento local
                localStorage.setItem('token id', tokenId);

                // Redireccionar según el estado de isAdmin
                if (isAdmin === true) {
                    window.location.href = '/adminFeed'; // Página de administrador
                } else {
                    window.location.href = '/feedreal'; // Página de usuario normal
                }
            } else {
                // Mostrar un mensaje de error descriptivo en caso de un problema de inicio de sesión
                const errorMessage = await response.text();
                throw new Error(errorMessage);
            }
        } catch (error) {
            // Mostrar el mensaje de error en caso de problemas durante el inicio de sesión
            alert('Login failed: ' + error.message);
            console.error('Login failed:', error);
        }
    };

    return (
        <div className="form-container">
        <h1 className="header">Inicia sesión</h1>
        <form className="form" onSubmit={handleSubmit}>
            <InputForm
                placeholder='CORREO'
                id='correo'
                type='text'
                name='correo'
                value={formData.correo}
                onChange={(value) => handleChange('correo', value)}
            />
            <InputForm
                placeholder="CONTRASEÑA"
                id='password'
                type='password'
                name='password'
                value={formData.password}
                onChange={(value) => handleChange('password', value)}
            />
            <div className="button-container">
                <button className="signup-button">Iniciar sesión</button>
            </div>
        </form>
        <div className="footer">
            No tienes una cuenta? <a href="index.html" className="login-link">Registrate</a>
            <p className="terms">Al registrarse, estas aceptando nuestros <a href="./terminosYcondiciones" className="terms-link">Terminos y condiciones</a></p>
        </div>
    </div>
    );
}

export default LoginForm;
