import React from 'react';

const FacturaPopup = ({ factura }) => {
  if (!factura || !factura.rows || factura.rows.length === 0) {
    return <p>No se encontraron detalles de la factura</p>;
  }

  // Obtener el primer elemento del array de facturas
  const primeraFactura = factura.rows[0];

  return (
    <div className="factura-popup">
      <h2>Detalle de la Factura</h2>
      {/* Mostrar datos de la primera factura */}
      <h3>Numero de Factura: {primeraFactura.id_venta}</h3>
      <h3>Cliente: {primeraFactura.nombre_cliente}</h3>
      <ul>
        {factura.rows.map((item) => (
          <li key={item.id_de_libro}>
            <p>ID Libro: {item.id_de_libro}</p>
            <p>Precio de Venta: {item.precio_venta}</p>
            <p>Cantidad: {item.cantidad_de_libros}</p>
            <p>Fecha: {item.fecha}</p>
            <p>Subtotal: {item.subtotal}</p>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => { window.location.href = "/feedreal"; }}>Finalizar</button>
    </div>
  );
}

export default FacturaPopup;
