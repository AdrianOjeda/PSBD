// PagarPag.jsx
import React, { useState, useEffect } from "react";
import ConfirmacionCompra from "./ConfirmacionCompra";
import MetodoPagoSelect from "./MetodoPagoSelect";
import FacturaPopup from "./FacturaPopUp";

function PagarPag({ montoTotal }) {
  const [confirmacion, setConfirmacion] = useState(null); 
  const [error, setError] = useState(null); 
  const [selectedMethod, setSelectedMethod] = useState(""); 
  const [metodosPago, setMetodosPago] = useState([]); 
  const [mostrarFactura, setMostrarFactura] = useState(false); 
  const [factura, setFactura] = useState(null);

  const handleMethodSelect = (e) => {
    setSelectedMethod(e.target.value);
  };

  const handleConfirmPurchase = () => {
    if (!confirmacion || !selectedMethod) {
        setError("No se puede confirmar la compra. Falta la confirmación o el método de pago.");
        {}
        return;
    }

    if (isNaN(confirmacion.cantidadTotal) || isNaN(confirmacion.cantidadLibros)) {
        setError("La cantidad total o la cantidad de libros no son números válidos.");
        return;
    }

    const token = localStorage.getItem("token id");
    fetch("/api/confirmarCompra", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                montoTotal: confirmacion.cantidadTotal,
                cantidadLibros: confirmacion.cantidadLibros,
                idMetodoPago: selectedMethod,
            }),
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Error al confirmar la compra");
            }
            return response.json();
        })
        .then((data) => {
            console.log("Compra confirmada:", data);
            // Después de confirmar la compra, obtén la factura
            fetchFactura();
        })
        .catch((error) => {
            console.error("Error al confirmar la compra:", error);
            setError("Error al confirmar la compra. Inténtelo de nuevo más tarde.");
        });
};

  const fetchMetodosPago = () => {
    const token = localStorage.getItem("token id");
    fetch("/api/obtenerMetodosPago", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setMetodosPago(data); 
      })
      .catch((error) => {
        console.error("Error al obtener los métodos de pago:", error);
        setError("Error al obtener los métodos de pago. Inténtelo de nuevo más tarde.");
      });
  };

  const fetchTotales = () => {
    const token = localStorage.getItem("token id");
    fetch("/api/obtenerTotales", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al obtener los totales de compra");
        }
        return response.json();
      })
      .then((data) => {
        setConfirmacion(data); 
      })
      .catch((error) => {
        console.error("Error al obtener la confirmación de compra:", error);
        setError("Error al obtener la confirmación de compra. Inténtelo de nuevo más tarde.");
      });
  };

  const fetchFactura = () => {
    const token = localStorage.getItem("token id");
    fetch("/api/factura", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error al obtener la factura");
      }
      return response.json();
    })
    .then((data) => {
      setFactura(data.facturaResult); // Actualizar el estado con los datos de la factura
      setMostrarFactura(true); // Mostrar el componente de la factura
    })
    .catch((error) => {
      console.error("Error al obtener la factura:", error);
      setError("Error al obtener la factura. Inténtelo de nuevo más tarde.");
    });
  };

  useEffect(() => {
    fetchMetodosPago();
    fetchTotales();
  }, []);

  return (
    <div className="pagar-container">
      <h1>Confirmación</h1>
      {error ? (
        <p>Error: {error}</p>
      ) : (
        <div>
          <ConfirmacionCompra
            cantidadTotal={confirmacion?.cantidadTotal}
            cantidadLibros={confirmacion?.cantidadLibros}
          />
          <div className="form-container">
            <MetodoPagoSelect
              metodosPago={metodosPago}
              onChange={handleMethodSelect}
            />
            <button onClick={handleConfirmPurchase}>Confirmar Compra</button>
            {mostrarFactura && factura && <FacturaPopup factura={factura} />}
          </div>
        </div>
      )}
    </div>
  );
}  

export default PagarPag;
