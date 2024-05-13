import React from "react";

function ConfirmacionCompra({ cantidadTotal, cantidadLibros }) {
  return (
    <div>
      <h2>Detalles de la Compra</h2>
      <p>Cantidad Total: ${cantidadTotal}</p>
      <p>Cantidad de Libros: {cantidadLibros}</p>
    </div>
  );
}

export default ConfirmacionCompra;
