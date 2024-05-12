import React from "react";
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout'; // Importar el icono de carrito
import LogoutIcon from '@mui/icons-material/Logout';

function Header() {
    return (
        <header className="header">
            <div className="header-center">
                <h1>Bienvenido a la Librería</h1>
            </div>
            <div className="header-right">
                <ShoppingCartCheckoutIcon className="pageLink cart" style={{ fontSize: '3rem' }} onClick={() => { window.location.href = "/Carrito" }} />
                <LogoutIcon className="pageLink logout" style={{ fontSize: '3rem' }} onClick={() => { window.location.href = "/login" }}/>
            </div>
        </header>
    );
}

export default Header;
