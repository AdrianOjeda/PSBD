import React, { useState, useEffect } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import MisMetodos from "./MisMetodos";

function MetodoApp() {
  const [nuevoMetodo, setNuevoMetodo] = useState({ metodoPago: 1, descripcion: "" });
  const [methods, setMethods] = useState([]);
  const [userId, setUserId] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setNuevoMetodo((prevMetodo) => ({
      ...prevMetodo,
      [name]: parseInt(value) // Convertir el valor a entero
    }));
  };

  useEffect(() => {
    const token = localStorage.getItem('token id');
    const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decodificar token JWT
    const userId = decodedToken.userId;
    setUserId(userId);
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    try {
      const token = localStorage.getItem('token id');
      const response = await fetch(`/api/renderMethods`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.ok) {
        const methodsData = await response.json();
        setMethods(methodsData);
      } else {
        console.error('Failed to fetch methods:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching methods:', error.message);
    }
  };

  const deleteMethod = async (methodId) => {
    try {
      const token = localStorage.getItem('token id');
      const response = await fetch(`/api/deleteMethod/${methodId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
  
      if (response.ok) {
        // Eliminación exitosa, actualiza la lista de métodos
        fetchMethods();
        alert('Método de pago eliminado exitosamente.'); // Alerta de eliminación exitosa
      } else {
        console.error('Failed to delete method:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting method:', error.message);
    }
  };
  

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const token = localStorage.getItem("token id");
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(nuevoMetodo) // Convertir el objeto a JSON
      };
      const response = await fetch('/api/AddMethod', requestOptions);

      // Verificar si la solicitud fue exitosa
      if (response.ok) {
        alert("Método de pago registrado exitosamente.");
        fetchMethods(); // Actualizar la lista de métodos después de agregar uno nuevo
      } else {
        alert("Error al registrar el método de pago. Por favor, intenta nuevamente.");
      }
    } catch (error) {
      alert("Error al enviar la solicitud. Por favor, revisa la consola para más detalles.");
      console.error("Error al enviar la solicitud:", error);
    }
    setNuevoMetodo({ metodoPago: 1, descripcion: "" });
  };

  return (
    <div className="metodo-app-container">
      <aside className="aside">
        <h1>Tus métodos de pago</h1>
        {methods.map((method) => (
          <MisMetodos
            key={method.id_metodo_pago_cliente}
            id={method.id_metodo_pago_cliente}
            nombre={method.metodo_pago}
            descripcion={method.descripcion}
            onDelete={deleteMethod}
          />
        ))}
      </aside>
      <div className="main-content">
        <h1>Registrar nuevo Método de Pago</h1>
        <form className="registro-metodo-form" onSubmit={handleSubmit}>
          <label>
            Método de pago:
            <select
              name="metodoPago"
              value={nuevoMetodo.metodoPago}
              onChange={handleChange}
            >
              <option value={1}>Transferencia</option>
              <option value={2}>Tarjeta de Crédito</option>
            </select>
          </label>
          <label>
            Descripción:
            <input
              type="text"
              name="descripcion"
              value={nuevoMetodo.descripcion}
              onChange={handleChange}
              required
            />
          </label>
          <button type="submit">Registrar</button>
          <button onClick={() => { window.location.href = "/Carrito" }}>Regresar</button>
        </form>
      </div>
    </div>
  );
}

export default MetodoApp;
