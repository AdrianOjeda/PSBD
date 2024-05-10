import React, { useState } from 'react';
import InputForm from './InputForm';


function RegisterForm() {

    const initialFormData = {
        nombres: '',
        ciudad: '',
        colonia: '',
        cp: '',
        calle:'',
        telefono:'',
        correo: '',
        password: '',
        repetirPassword: ''
    };

    const [formData, setFormData] = useState(initialFormData);


    const handleChange = (fieldName, value) => {
        setFormData({
            ...formData,
            [fieldName]: value,
        });
    };
    


    const handleSubmit = async (event) => {
        console.log(event)
        event.preventDefault();
    
        try {
            const formDataToSend = new FormData(); // Use a different variable name to avoid confusion
            formDataToSend.append('nombres', formData.nombres);
            formDataToSend.append('ciudad', formData.ciudad);
            formDataToSend.append('colonia', formData.colonia);
            formDataToSend.append('cp', formData.cp);
            formDataToSend.append('calle', formData.calle);
            formDataToSend.append('telefono', formData.telefono)
            formDataToSend.append('correo', formData.correo);
            formDataToSend.append('password', formData.password);
            formDataToSend.append('repetirPassword', formData.repetirPassword);
            console.log(formData);
            console.log(formDataToSend);
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Registration failed');
            }if(response.ok){
                const idUsuario =  await response.json();
                console.log(idUsuario);
                localStorage.setItem('idRegisteredUsuario', idUsuario);
            }
    
            setFormData(initialFormData);
            alert('User registered successfully');
            window.location.href = "/login"
        } catch (error) {
            alert('User registration failed: ' + error.message);
            alert('hola')
            console.error('User registration failed:', error);
        }
    };
    return (
        <div className="form-container">
            <h1 className="header">Registrate</h1>
            <form className="form" onSubmit={handleSubmit}>
                <InputForm
                    placeholder="NOMBRES"
                    id="Nombres"
                    name="nombres"
                    type="text"
                    value={formData.nombres}
                    onChange={(value) => handleChange('nombres', value)}
                />
                <InputForm
                    placeholder="CIUDAD"
                    id="ciudad"
                    name="ciudad"
                    type="text"
                    value={formData.ciudad}
                    onChange={(value) => handleChange('ciudad', value)}
                />
                <InputForm
                    placeholder="COLONIA"
                    id="colonia"
                    name="colonia"
                    type="text"
                    value={formData.colonia}
                    onChange={(value) => handleChange('colonia', value)}
                />
                <InputForm
                    placeholder="CODIGO POSTAL"
                    id="cp"
                    name="cp"
                    type="number"
                    value={formData.cp}
                    onChange={(value) => handleChange('cp', value)}
                />
                <InputForm
                    placeholder="CALLE"
                    id="calle"
                    name="calle"
                    type="text"
                    value={formData.calle}
                    onChange={(value) => handleChange('calle', value)}
                />
                <InputForm
                    placeholder="TELEFONO"
                    id="telefono"
                    name="telefono"
                    type="text"
                    value={formData.telefono}
                    onChange={(value) => handleChange('telefono', value)}
                />
                <InputForm
                    placeholder="CORREO"
                    id="correo"
                    name="correo"
                    type="text"
                    value={formData.correo}
                    onChange={(value) => handleChange('correo', value)}
                />
                <InputForm
                    placeholder="CONTRASEÑA"
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={(value) => handleChange('password', value)}
                />

                <InputForm
                    placeholder="REPETIR CONTRASEÑA"
                    id="repetirPassword"
                    name="repetirPassword"
                    type="password"
                    value={formData.repetirPassword}
                    onChange={(value) => handleChange('repetirPassword', value)}
                />
                <div className="button-container">
                    <button type="submit" className="signup-button">
                        CREAR CUENTA
                    </button>
                </div>
            </form>
            <div className="footer">
                Ya tienes una cuenta?{' '}
                <a href="login.html" className="login-link">
                    Iniciar
                </a>
                <p className="terms">
                    Al registrarse, estas aceptando nuestros{' '}
                    <a href="./terminosYcondiciones" className="terms-link">
                        Terminos y condiciones
                    </a>
                </p>
            </div>
        </div>
    );
}

export default RegisterForm;