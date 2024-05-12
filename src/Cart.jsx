import React from "react";
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AddCardIcon from '@mui/icons-material/AddCard';
import CarDisplayBooks from "./CarDisplayBooks";
import CreditCardIcon from '@mui/icons-material/CreditCard';

function Cart() {
    return (
        <div className="carrito">
            <header>
                <h1 className="titulo">MI CARRITO</h1>
                <ExitToAppIcon className="exit" style={{ fontSize: '3rem' }} onClick={() => { window.location.href = "/feedreal" }} />
            </header>
            <div className="actions">
                <div className="action">
                    <CreditCardIcon className="Payment" style={{ fontSize: '4rem' }} onClick={() => alert()} />
                    <h2 className="pagar-text">Pagar</h2>
                </div>
                <div className="action">
                    <AddCardIcon className="Payment" style={{ fontSize: '4rem' }} onClick={() => {window.location.href = "/metodoPago"}} />
                    <h2 className="pagar-text">Método de pago</h2>
                </div>
            </div>
            <div>
                <CarDisplayBooks />
            </div>
        </div>
    );
}

export default Cart;
