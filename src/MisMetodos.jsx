import DeleteIcon from '@mui/icons-material/Delete';

function MisMetodos(props) {
    const handleDelete = () => {
        props.onDelete(props.id);
    };

    return (
        <div className="card">
            <div className="card-body">
                <h5 className="card-title">Método de Pago</h5>
                <p className="card-text">Tipo: {props.nombre}.</p>
                <p className="card-text">CLAVE: {props.descripcion}</p>
            </div>
            <div className='deleteIcon' onClick={handleDelete}>
                <DeleteIcon style={{ fontSize: '3rem' }} />
            </div>            
        </div>
    );
}

export default MisMetodos;
