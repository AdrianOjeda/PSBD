// MetodoPagoSelect.jsx
import React from "react";

function MetodoPagoSelect({ metodosPago, onChange }) {
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div>
      <select onChange={onChange}>
        <option value="">Seleccione</option>
        {metodosPago.map((metodo) => (
          <option key={metodo.id_metodo_pago_cliente} value={metodo.id_metodo_pago_cliente}>
            {metodo.descripcion} - {metodo.metodo_pago}
          </option>
        ))}
      </select>
      <button onClick={handleGoBack}>Regresar</button>
    </div>
  );
}

export default MetodoPagoSelect;
