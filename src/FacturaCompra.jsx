// FacturaCompra.jsx
import React from "react";

function FacturaCompra({ factura }) {
  return (
    <div>
      <h2>Factura de Compra</h2>
      <p>Fecha: {factura.fecha}</p>
      <h3>Detalles:</h3>
      <ul>
        {factura.detalles.map((detalle, index) => (
          <li key={index}>
            <p>Producto: {detalle.producto}</p>
            <p>Precio: {detalle.precio}</p>
            <p>Cantidad: {detalle.cantidad}</p>
            <p>Subtotal: {detalle.subtotal}</p>
          </li>
        ))}
      </ul>
      <p>Total: {factura.total}</p>
    </div>
  );
}

export default FacturaCompra;
