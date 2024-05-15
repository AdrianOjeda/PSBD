import React, { useState, useEffect } from "react";
import FacturaCompra from "./FacturaCompra";

function PagFactura() {
  const [detalleCompra, setDetalleCompra] = useState(null);
  const [encabezadoCompra, setEncabezadoCompra] = useState(null);
  const [error, setError] = useState(null);

  const fetchDetalleCompra = () => {
    const token = localStorage.getItem("token id");
    fetch("/api/detalleCompra", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error al obtener los detalles de la compra");
      }
      return response.json();
    })
    .then((data) => {
      setDetalleCompra(data); // Actualiza el estado con los detalles de la compra
    })
    .catch((error) => {
      console.error("Error al obtener los detalles de la compra:", error);
      setError("Error al obtener los detalles de la compra. Inténtelo de nuevo más tarde.");
    });
  };

  const fetchUpdateStatus = () => {
    const token = localStorage.getItem("token id");
    fetch("/api/confirmRegisterOfBooks", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json", 
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al actualizar el estado");
        }
        return response.json();
      })
      .then((data) => {
        
        console.log("Estado actualizado:", data);
      })
      .catch((error) => {
        console.error("Error al actualizar el estado:", error);
        // Puedes manejar errores aquí, como mostrar un mensaje al usuario
      });
  };

  const fetchEncabezadoCompra = () =>{
    const token = localStorage.getItem("token id");
    fetch("/api/facturaCompra", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al obtener los detalles de la compra");
        }
        return response.json();
      })
      .then((data) => {
        setEncabezadoCompra(data); // Actualiza el estado con los detalles de la compra
      })
      .catch((error) => {
        console.error("Error al obtener los detalles de la compra:", error);
        setError("Error al obtener los detalles de la compra. Inténtelo de nuevo más tarde.");
      });
  }

  useEffect(() => {
    fetchDetalleCompra(); 
    fetchUpdateStatus();
    fetchEncabezadoCompra();
  }, []); 

  return (
    <div className="pag-factura-container">
      <div> 
        {encabezadoCompra ? (
          <div>
            <h3><strong>Numero de folio: </strong>{encabezadoCompra.id_compra}</h3>
            <h3><strong>Fecha: </strong>{encabezadoCompra.fecha_factura}</h3>
            <h3><strong>Cantidad: </strong>{encabezadoCompra.cantidad_items_compra}</h3>
            <h3><strong>Precio total: $</strong>{encabezadoCompra.total}</h3>
          </div>
        ) : (
          <p>Cargando encabezado de la factura...</p>
        )}
        
        <h2 className="pag-factura-title">Detalles de la compra:</h2>
        <ul className="pag-factura-list">
          {detalleCompra ? detalleCompra.map((detalle) => (
            <li key={detalle.id_detalle_factura_compra} className="pag-factura-item">
              <p><strong>ID de libro:</strong> {detalle.id_de_libro}</p>
              <p><strong>Precio de compra:</strong> {detalle.precio_compra}</p>
              <p><strong>Cantidad de libros:</strong> {detalle.cantidad_de_libros}</p>
              <p><strong>Subtotal:</strong> {detalle.subtotal}</p>
            </li>
          )) : <p>Cargando detalles de la compra...</p>}
        </ul>
      </div>
      <button type="button" onClick={()=>{
        window.location.href = "libros"
      }}>Finalizar</button>
    </div>
  );
  
}

export default PagFactura;
