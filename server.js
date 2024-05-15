import express from "express";
import bodyParser from "body-parser";
import cors from 'cors';
import pg from "pg";
import sha1 from 'sha1';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { verify } from "crypto";
import { log, profile } from "console";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "SeminarioBaseDeDatos",
  password: "root",
  port: 5432,
});


db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cors());
app.use(bodyParser.json());

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
//Token id user middleware
function verifyToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Token is required" });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    try {
        const decoded = jwt.verify(token, "your-secret-key");
        console.log("Decoded token:", decoded);
        req.user = decoded;
        
        next();
    } catch (error) {
        console.error("Token verification error:", error);
        return res.status(403).json({ error: "Invalid token" });
    }
}




//Multer middleware 

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Specify the directory where you want to store the files
    },
    filename: function (req, file, cb) {
        
        const ext = file.originalname.split('.').pop();
        const randomNumber = getRandomInt(100000);

        const newFilename = file.originalname.replace('.' + ext, `_${randomNumber}.${ext}`);
        //console.log(newFilename);
        cb(null, newFilename); 
    }
});
// Configure multer upload middleware
const upload = multer({ storage: storage });

app.post('/api/register', async (req, res) => {
    // Extract form data from the request body
    console.log("Hola")
    const { nombres, ciudad, colonia, cp, calle ,telefono ,correo, password, repetirPassword } = req.body;
    
                    try{
                        // Insert the user data into the database
                        const hashedPassword = sha1(password);
                        const insertQuery = `
                        INSERT INTO cliente (contraseña, telefono, nombre, email, ciudad, cp, colonia, calle, isadmin)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                        `;
                        await db.query(insertQuery, [hashedPassword, telefono, nombres, correo, ciudad, cp, colonia, calle, false]);
                        console.log("AAAA")
                        try{
                            const idUsuarioQuery = 'SELECT id_cliente FROM cliente WHERE email = $1 AND contraseña = $2';
                            const idResponse = await db.query(idUsuarioQuery, [correo, hashedPassword]);
                            console.log(idResponse.rows[0].id_cliente);
                            res.status(200).json(idResponse.rows[0].id_cliente);
                        }catch(err){
                            console.log("bbbbb") /* no entra al try*/
                            res.status(500).json({err: "No se pudo registrar el usuario"});
                        }
                        
                    }catch(error){
                        console.error('Error registering user:', error);
                        res.setHeader('Content-Type', 'application/json');
                        res.status(500).json({ error: 'No se pudo registrar al usuario!' });
                    }
                
});


app.post('/api/login', async (req, res) => {
    const { correo, password } = req.body;
    console.log(req.body);
    try {
        const hashedPassword = sha1(password);
        const credentialsValidationQuery = `SELECT id_cliente, email, contraseña, isadmin FROM cliente WHERE email = $1`;
        const checkCredentialsValidation = await db.query(credentialsValidationQuery, [correo]);
       
        if(checkCredentialsValidation.rowCount === 1){
            const storedPassword = checkCredentialsValidation.rows[0].contraseña;
            const isAdmin = checkCredentialsValidation.rows[0].isadmin;
            const userId = checkCredentialsValidation.rows[0].id_cliente;
            
            // Verificar si la contraseña coincide
            if (hashedPassword === storedPassword) {
                try {
                    const token = jwt.sign({ userId }, 'your-secret-key');
                    res.status(200).json({ message: 'User logged in successfully', token, isAdmin });
                } catch (error) {
                    console.error('Error generating token or setting user ID:', error);
                    res.status(500).json({ error: 'Failed to generate token' });
                }
            } else {
                // La contraseña es incorrecta
                res.status(400).json({ error: 'Contraseña incorrecta' });
            }
        } else {
            // El correo electrónico no está registrado
            res.status(400).json({ error: 'Correo no encontrado' });
        }
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ error: 'Failed to login user' });
    }
});


app.get('/api/renderBooks', verifyToken, async (req, res) => {
    try {
        let sortBy = req.query.sortBy;

        let orderByClause = ''; 
        switch (sortBy) {
            case 'title':
                orderByClause = 'ORDER BY titulo ASC';
                break;
            case 'stock':
                orderByClause = 'ORDER BY stock ASC';
                break;
            case 'price_asc':
                orderByClause = 'ORDER BY precio ASC';
                break;
            case 'price_desc':
                orderByClause = 'ORDER BY precio DESC';
                break;
            case 'spanish':
                orderByClause = "WHERE idioma = 'Español' ORDER BY id_de_libro";
                break;
            case 'english':
                orderByClause = "WHERE idioma = 'English' ORDER BY id_de_libro";
                break;
            default:
                orderByClause = '';
                break;
        }

        const displayBooksQuery = `SELECT * FROM render ${orderByClause}`;

        const displayBooks = await db.query(displayBooksQuery);
        console.log(displayBooks.rows);
        res.status(200).json(displayBooks.rows);

    } catch (error) {
        res.status(500).json({ error: "Failed to load books" });
    }
});

app.get('/api/renderCarrito', verifyToken, async(req, res) =>{
    
    const userId = req.user.userId;
    console.log(userId)
    try{
        const displayBooksQuery = `
        SELECT 
            carrito.*, 
            libro.titulo, 
            libro.autor,
            libro.portada,
            libro.isbn, 
            libro.precio,
            libro.idioma,
            (carrito.cantidad * libro.precio) AS precio_total
        FROM 
            carrito
        JOIN 
            libro ON carrito.id_de_libro = libro.id_de_libro
        JOIN 
            cliente ON carrito.id_cliente = cliente.id_cliente
        WHERE 
            cliente.id_cliente = $1;
        `;
        

        const displayBooks = await db.query(displayBooksQuery,[userId]);
        console.log(displayBooks.rows);
        res.status(200).json(displayBooks.rows);

    } catch (error) {
        res.status(500).json({ error: "Failed to load books" });
    }
})

app.get('/api/renderMethods', verifyToken, async (req, res) => {
    const userId = req.user.userId;
    try {
        const displayMethodQuery = `
        SELECT 
            mc.id_metodo_pago_cliente,
            mp.metodo_pago,
            mc.id_cliente,
            mc.descripcion
        FROM 
            metododepagocliente mc
        INNER JOIN
            metododepago mp ON mc.id_metodo_pago = mp.id_metodo_pago
        WHERE id_cliente = $1`;
        const displayMethod = await db.query(displayMethodQuery, [userId]);
        res.status(200).json(displayMethod.rows);
    } catch (error) {
        console.error("Error en la consulta:", error);
        res.status(500).json({ error: "Failed to fetch payment methods" });
    }
});



app.post('/api/addToCart', verifyToken, async (req, res) => {
    try {
        const { bookId, cantidad } = req.body;
        const userId = req.user.userId;
        const existingQuery = 'SELECT * FROM carrito WHERE id_cliente = $1 AND id_de_libro = $2';
        const existingResult = await db.query(existingQuery, [userId, bookId]);
        let queryResult;
        if (existingResult.rows.length > 0) {
            // Si el libro ya está en el carrito, actualizar la cantidad
            const updateQuery = 'UPDATE carrito SET cantidad = cantidad + $1 WHERE id_cliente = $2 AND id_de_libro = $3';
            queryResult = await db.query(updateQuery, [cantidad, userId, bookId]);
        } else {
            // Si el libro no está en el carrito, insertar una nueva fila
            const insertQuery = 'INSERT INTO carrito(id_cliente, id_de_libro, cantidad) VALUES ($1, $2, $3)';
            queryResult = await db.query(insertQuery, [userId, bookId, cantidad]);
        }
        res.status(200).json({ message: 'Libro agregado al carrito exitosamente' });
    } catch (error) {
        if (error.message.includes('La cantidad total en el carrito excede el stock disponible')) {
            return res.status(400).json({ error: 'No hay suficiente stock disponible para este libro' });
        } else {
            console.error('Error al agregar libro al carrito:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
});


app.post('/api/addMethod', verifyToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const metodoPago = req.body.metodoPago;
        const descripcion = req.body.descripcion;
        console.log(userId);
        console.log(metodoPago);
        console.log(descripcion);
        
        const insertQuery = "INSERT INTO metododepagocliente(id_metodo_pago, id_cliente, descripcion) VALUES ($1, $2, $3)";
        const queryResult = await db.query(insertQuery, [metodoPago, userId, descripcion]);
        console.log(queryResult)
        res.status(200).send("Método de pago registrado correctamente.");
    } catch (error) {
        console.error("Error al insertar método de pago:", error);
        res.status(500).send("Error al registrar el método de pago.");
    }
});


app.post('/api/addBook', verifyToken, upload.single('image'), async (req, res) => {
    try {
        const image = req.file;
        const fileImage = image.filename;
        const {titulo, autor, isbn, descripcion, precio, stock, idioma, editorial} = req.body;
        console.log(req.body)
        console.log(image.filename)
        const idAnterior = await db.query("SELECT id_de_libro from libro order by id_de_libro desc LIMIT 1;")
        console.log(idAnterior);
        const idAnteriorNuevo = idAnterior.rows[0].id_de_libro;
        const idNuevo = idAnteriorNuevo + 1
        console.log(idNuevo)
        const insertQuery = `INSERT INTO libro(id_de_libro, titulo, isbn, precio, stock, autor, sinopsis, idioma, id_editorial, portada)
                            VALUES
                            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`
        const insertQueryResult = await db.query(insertQuery,[idNuevo,titulo,isbn,precio,stock, autor, descripcion, idioma, editorial,fileImage])
        console.log(insertQueryResult);

        res.status(200).json({ message: 'Book added successfully' });
    } catch (error) {
        console.error('Error adding book:', error);
        res.status(500).json({ error: 'Failed to add book' });
    }
});


app.delete('/api/deleteMethod/:id', verifyToken, async (req, res) => {
    try {
        const methodId = req.params.id;
        console.log("aqui", methodId)
        const deleteMethodQuery = 'DELETE FROM metododepagocliente WHERE id_metodo_pago_cliente = $1';
        await db.query(deleteMethodQuery, [methodId]);
        res.status(200).json({ message: 'Método de pago eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar método de pago:', error);
        res.status(500).json({ error: 'Error interno del servidor al eliminar el método de pago' });
    }
});

app.delete('/api/deleteToCart/:id', verifyToken, async (req, res) => {
    try {
        const bookId = req.params.id;
        const deleteBookQuery = 'DELETE FROM carrito WHERE id_de_libro = $1 AND id_cliente = $2';
        const userId = req.user.userId;
        await db.query(deleteBookQuery, [bookId, userId]);
        res.status(200).json({ message: 'Libro eliminado del carrito exitosamente' });
    } catch (error) {
        console.error('Error al eliminar libro del carrito:', error);
        res.status(500).json({ error: 'Error interno del servidor al eliminar el libro del carrito' });
    }
});

app.post('/api/confirmarCompra', verifyToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { montoTotal, cantidadLibros, idMetodoPago } = req.body;

        // Obtener el id_metodo_pago real
        const idMetodoPagoRealResult = await db.query(`
            SELECT mp.id_metodo_pago 
            FROM metododepagocliente mc 
            INNER JOIN metododepago mp ON mc.id_metodo_pago = mp.id_metodo_pago 
            WHERE id_metodo_pago_cliente = $1;
        `, [idMetodoPago]);

        // Verificar si se obtuvo algún resultado
        if (idMetodoPagoRealResult.rows.length === 0) {
            throw new Error("No se encontró el método de pago correspondiente.");
        }

        // Obtener el id_metodo_pago real como entero
        const idMetodoPagoReal = parseInt(idMetodoPagoRealResult.rows[0].id_metodo_pago);

        // Insertar la venta y obtener el ID de la venta
        const insertVentaQuery = `
            INSERT INTO venta (total, cantidad_de_items, fecha, id_cliente, id_metodo_pago)
            VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4)
            RETURNING id_venta;
        `;
        const ventaResult = await db.query(insertVentaQuery, [montoTotal, cantidadLibros, userId, idMetodoPagoReal]);
        const ventaId = ventaResult.rows[0].id_venta;

        // Actualizar el estado del detalle de venta para todos los libros en el carrito
        const updateDetalleVentaQuery = `
            UPDATE detalleventa
            SET status = true,
                id_venta = $1
            WHERE id_cliente = $2 AND status = false;
        `;
        await db.query(updateDetalleVentaQuery, [ventaId, userId]);

        res.status(200).json({ success: true, ventaId });
    } catch (error) {
        console.error('Error al confirmar la compra:', error);
        res.status(500).json({ success: false, error: 'Error al confirmar la compra' });
    }
});

app.post('/api/confirmRegisterOfBooks', verifyToken, async (req, res) => {
    try {
        // Insertar en la tabla facturadecompra y obtener el id_compra generado
        const resultQuery = await db.query(`
            INSERT INTO facturadecompra (fecha_factura, total, cantidad_items_compra)
            SELECT
                CURRENT_DATE,
                SUM(subtotal) AS total,
                SUM(cantidad_de_libros) AS cantidad_items_compra
            FROM
                detalledecompra
            WHERE
                id_compra IS NULL
            RETURNING id_compra; -- Devuelve el id_compra generado
        `);

        const idCompra = resultQuery.rows[0].id_compra; // Obtener el id_compra generado

        // Actualizar la tabla detalledecompra con el id_compra generado
        await db.query(`
            UPDATE detalledecompra
            SET id_compra = $1 -- Usar el id_compra generado
            WHERE id_compra IS NULL; -- Actualizar solo los registros con id_compra nulo
        `, [idCompra]);

        console.log("Detalle de compra actualizado con el id_compra:", idCompra);
        res.status(200).json({ message: "Detalle de compra actualizado correctamente" });
    } catch (error) {
        console.error("Error al actualizar el detalle de compra:", error);
        res.status(500).json({ error: "Error al actualizar el detalle de compra" });
    }
});


app.get('/api/detalleCompra', verifyToken, async (req, res) => {   
    try {
        const detalleCompraQuery = `SELECT * FROM public.detalledecompra WHERE id_compra IS NULL;`;
        const detalleCompraResult = await db.query(detalleCompraQuery);
        console.log(detalleCompraResult); 

        // Envía los datos recuperados como respuesta a la solicitud
        res.json(detalleCompraResult.rows);
    } catch (error) {
        console.error("Error al obtener otra data:", error);
        res.status(500).json({ error: "Error al obtener los datos de detalle de compra" }); 
    }
});

app.get('/api/facturaCompra', verifyToken, async (req, res) => {
    try {
        const facturaQuery = `
        SELECT id_compra, fecha_factura, total, cantidad_items_compra
        FROM facturadecompra
        ORDER BY id_compra DESC
        LIMIT 1;
        `;
        const facturaQueryResult = await db.query(facturaQuery);
        console.log("Factura aquí", facturaQueryResult);
        
        // Enviar los datos de la factura como respuesta al cliente
        res.json(facturaQueryResult.rows[0]); // Suponiendo que facturaQueryResult.rows contiene los datos de la factura
    } catch (error) {
        console.error("Error al obtener los detalles de la compra:", error);
        res.status(500).json({ error: "Error al obtener los detalles de la compra. Inténtelo de nuevo más tarde." });
    }
});


app.get('/api/factura', verifyToken, async (req, res) => {
    const userId = req.user.userId;
    console.log(userId)
    try {
        const facturaQuery = `
        SELECT 
        dv.id_detalle_venta, 
        dv.id_de_libro, 
        dv.precio_venta, 
        dv.cantidad_de_libros, 
        dv.fecha, 
        dv.subtotal,
        c.nombre as nombre_cliente,
        v.id_venta
    FROM 
        detalleventa dv
    INNER JOIN 
        venta v ON dv.id_venta = v.id_venta
    INNER JOIN 
        cliente c ON v.id_cliente = c.id_cliente
    WHERE 
        v.id_cliente = $1
    AND 
        v.id_venta = (
            SELECT 
                id_venta
            FROM 
                venta
            WHERE 
                id_cliente = $1
            ORDER BY 
                id_venta DESC
            LIMIT 1
        );
    
        `;
        const facturaResult = await db.query(facturaQuery, [userId]);
        console.log("Esta es la factura", facturaResult)
        // Enviar la respuesta con los datos de la factura
        res.json({ facturaResult });
    } catch (error) {
        console.error('Error al obtener la factura:', error);
        res.status(500).json({ error: 'Error al obtener la factura' });   
    }
});



app.get('/api/obtenerMetodosPago', verifyToken, async (req, res) => {
    const userId = req.user.userId;
    try {
      // Consulta para obtener los métodos de pago del usuario desde la base de datos
      const displayMethodQuery = `
        SELECT 
          mc.id_metodo_pago_cliente,
          mp.metodo_pago,
          mc.id_cliente,
          mc.descripcion
        FROM 
          metododepagocliente mc
        INNER JOIN
          metododepago mp ON mc.id_metodo_pago = mp.id_metodo_pago
        WHERE id_cliente = $1`;
      const displayMethod = await db.query(displayMethodQuery, [userId]);
      console.log(displayMethod)
      res.status(200).json(displayMethod.rows); // Devolver los métodos de pago como respuesta
    } catch (error) {
      console.error("Error en la consulta:", error);
      res.status(500).json({ error: "Failed to fetch payment methods " });
    }
  });
  
app.get('/api/obtenerTotales', verifyToken, async (req, res )=>{
    const userId = req.user.userId;
    try{
        const displayConfir = `SELECT
        SUM(libro.precio * carrito.cantidad) AS cantidadTotal,
        CAST(SUM(carrito.cantidad) AS INTEGER) AS cantidadLibros
    FROM
        carrito
    JOIN
        libro ON carrito.id_de_libro = libro.id_de_libro
    WHERE
        carrito.id_cliente = $1;`
        const QuerydisplayConfir = await db.query(displayConfir, [userId])
        console.log(QuerydisplayConfir)
        if (QuerydisplayConfir.rows.length > 0) {
          const { cantidadtotal, cantidadlibros } = QuerydisplayConfir.rows[0];
          res.json({ cantidadTotal: cantidadtotal, cantidadLibros: cantidadlibros });
        } else {
          res.status(404).json({ error: "No se encontraron datos de confirmación de compra para este usuario" });
        }
    } catch(error) {
        console.error("Error en la consulta:", error);
        res.status(500).json({ error: "Failed to fetch compra" });
    }
});

app.post('/api/confirmarCompra', verifyToken, async(req, res) => {
    const userId = req.user.userId;
    const { montoTotal, cantidadLibros, idMetodoPago } = req.body;

    try {
        // Aquí ejecuta la consulta SQL INSERT para agregar una nueva fila en la tabla `venta`
        const newSaleQuery = `
            INSERT INTO venta (total, cantidad_de_items, fecha, id_cliente, id_metodo_pago)
            VALUES ($1, $2, NOW(), $3, $4)
            RETURNING id_venta;
        `;
        const newSaleResult = await db.query(newSaleQuery, [montoTotal, cantidadLibros, userId, idMetodoPago]);
        const newSaleId = newSaleResult.rows[0].id_venta;
        res.status(201).json({ id_venta: newSaleId });
    } catch (error) {
        console.error('Error al confirmar la compra:', error);
        res.status(500).json({ error: 'Error al confirmar la compra' });
    }
});
app.delete('/api/deleteBook/:id', verifyToken, async (req, res) => {    
    try {
        const userId = req.user.userId;
        const bookId = req.params.id;
        console.log("user id: " + userId); 
        console.log("book id " + bookId);
 
        const deleteDetalle = 'DELETE FROM detalleventa WHERE id_de_libro = $1';  
        const deleteDetaileResult = await db.query(deleteDetalle, [bookId]);
        console.log(deleteDetaileResult);

        const deleteDetalleCompra = 'DELETE FROM detalledecompra WHERE id_de_libro = $1';  
        const deleteDetaileCompraResult = await db.query(deleteDetalleCompra, [bookId]);
        console.log(deleteDetaileCompraResult);

        const deleteCart = 'DELETE FROM carrito WHERE id_de_libro = $1';
        const deleteCartResult = await db.query(deleteCart, [bookId]);
        console.log(deleteCartResult);

        const deleteBookQuery = 'DELETE FROM libro WHERE id_de_libro = $1';
        await db.query(deleteBookQuery, [bookId]);

        res.status(200).json({ message: "Book deleted successfully!" });

    } catch (error) {
        console.error("Error deleting book:", error);
        res.status(500).json({ error: 'Could not delete book!' });
    }
});


app.post('/api/editBook', verifyToken, async (req, res) => {
    try {
        console.log(req.body);
        const { titulo, autor, isbn, precio, idLibro, descripcion, stock, idioma, editorial } = req.body;
        console.log(idLibro);
        const queryEdit = `
            UPDATE libro
            SET titulo = $1,
                isbn = $2,
                precio = $3,
                stock = $4,
                autor = $5,
                sinopsis = $6,
                idioma = $7,
                id_editorial = $8
            WHERE id_de_libro = $9
        `;
        const queryEditResult = await db.query(queryEdit, [titulo, isbn, precio, stock, autor, descripcion, idioma, editorial, idLibro]);
        console.log(queryEditResult); // Verifica la salida de la consulta en los logs

        res.status(200).json({ message: "Book updated successfully" });
    } catch (error) {
       
    }
});


app.get('/api/getUsers', async (req, res)=>{
    try{
        const getUsersQuery = `SELECT id, nombres, apellidos, correo, codigo, credencial FROM usuario where is_verified = false`
        const responseGetUsers = await db.query(getUsersQuery);

        console.log(responseGetUsers.rows);
        const usersInfo = responseGetUsers.rows;

        res.status(200).json({message: "Query succesful", usersInfo });
    }catch(err){

        res.status(500).json({error:"Cannot get users"})
    }


});

app.get('/api/tags', async(req, res) =>{
    try{
        const getTagsQuery = `SELECT * FROM tags`;
        const responseTagQuery = await db.query(getTagsQuery);
        
        const tagsInfo = responseTagQuery.rows;
        console.log(tagsInfo);
        res.status(200).json({message: "Tags obtenidos correctamente", tagsInfo})

    }catch(err){
        res.status(500).json({err: "No se pudieron obtener los tags!"});
    }



});

app.post('/api/customizeProfile/:idUsuario', upload.single('image'), async (req, res)=>{
    const idUsuario = req.params.idUsuario;
    console.log(idUsuario);
    const tags = JSON.parse(req.body.tags);
    
    const profilePicture =  req.file;
    const profilePicName =  profilePicture.filename;
    const idUsuarioInt = Number(idUsuario);
    try{
        console.log(profilePicName);
        const profilePicQuery = `INSERT INTO perfil_usuario (user_id, profile_pic)
                                VALUES ($1, $2)`;
        console.log("Es tipo: "+typeof(idUsuario));
        db.query(profilePicQuery, [idUsuarioInt, profilePicName]);

        const getIdQuery =  `SELECT id FROM perfil_usuario WHERE user_id = $1`;
        const getIdQueryResponse = await db.query(getIdQuery, [idUsuarioInt]);

       
        const idProfileUser = getIdQueryResponse.rows[0].id;
        console.log("Hola: " + idProfileUser);
        try{
            
            console.log(tags.length);
            console.log(Array.isArray(tags));
            console.log(tags);
            for (let i = 0; i<tags.length; i++){
                let tagId = tags[i];
                const insertTagsQuery = `INSERT INTO user_tags (user_id, tag_id) VALUES ($1, $2)`;
                await db.query(insertTagsQuery, [idProfileUser, tagId]);
                
            }
            
            res.status(200).json({message: "Todo piola"});
       }catch(err){

            res.status(200).json({err: "No se pudieron insertar los tags"});
       }

    }catch(err){

        res.status(500).json({err: "No se pudo insertar foto de perfill"});
    }
    

});

app.get("/api/getProfilePic", verifyToken, async (req, res)=>{
    const userId =  req.user.userId;
    console.log(userId);
    try{
        const getProfilePicQuery = `SELECT profile_pic FROM perfil_usuario where user_id =$1`;
        const responseProfilePic = await db.query(getProfilePicQuery, [userId]);
        const profile_pic = responseProfilePic.rows[0].profile_pic;
        console.log(profile_pic);

        res.status(200).json({profile_pic});


    }catch(err){


        res.status.json({erro:"No se pudo obetener la foto de perfil!"});
    }    
});

app.get("/api/getName", verifyToken, async (req, res)=>{
    
    
    try{
        const userId =  req.user.userId;
        console.log("usuario id " +userId);

        const getNameQuery = `SELECT nombres, apellidos FROM usuario WHERE id = $1`;

        const nameResponse =  await db.query(getNameQuery, [userId]);
        const fullName = nameResponse.rows[0].nombres + " "+ nameResponse.rows[0].apellidos;
        console.log(fullName);

        res.status(200).json({fullName});

    }catch(err){

        res.status(500).json({err: "No se pudo obtener el nombre"})
    }


})


app.post('/api/profile/updatePic', verifyToken, upload.single('image'), async (req, res)=>{

    const userId = req.user.userId;

    console.log(userId);
    const profilePicture =  req.file;
    
    const profilePicName =  profilePicture.filename;
    console.log(profilePicName);

    try{
        const getIdProfileQuery = `SELECT id FROM perfil_usuario WHERE user_id = $1`;
        const idProfileResponse =  await db.query(getIdProfileQuery, [userId]);
        
        const profileId = idProfileResponse.rows[0].id;
        console.log(profileId);
        try{
            const updatePicQuery = `UPDATE perfil_usuario SET profile_pic = $1 WHERE id = $2`;
            await db.query(updatePicQuery, [profilePicName, profileId]);
            res.status(200).json({message: "Foto de perfil actualizada con exito"});
        }catch(err){
            res.status.json({err: "No se pudo actualizar la foto de perfil"});
        }
    }catch(err){
        res.status(500).json({err: "No se pudo obtener el ID del perfil"});
        
    }

})

app.get('/api/getTags', verifyToken, async (req, res)=>{

    const userId = req.user.userId;
    console.log(userId);
    try{
        const getIdProfileQuery = `SELECT id FROM perfil_usuario WHERE user_id = $1`;
        const idProfileResponse =  await db.query(getIdProfileQuery, [userId]);
        
        const profileId = idProfileResponse.rows[0].id;
        console.log(profileId);
        try{
            const getTagsQuery = `SELECT tags.tagname FROM tags INNER JOIN user_tags ON tags.idtag = user_tags.tag_id WHERE user_tags.user_id =$1`;
            const tagResponse = await db.query(getTagsQuery, [profileId]);
            const sentTags = tagResponse.rows;
            console.log(sentTags);
            res.status(200).json({message: "Foto de perfil actualizada con exito", sentTags});
        }catch(err){
            res.status.json({err: "No se pudo actualizar la foto de perfil"});
        }
    }catch(err){
        res.status(500).json({err: "No se pudo obtener el ID del perfil"});
        
    }
})

app.post('/api/customizeTags/', verifyToken, async (req, res) => {
    const userId = req.user.userId;
    console.log(userId);
    
    const tags = req.body; 
    console.log("los tags");
    console.log(tags);
    try {
        const getIdProfileQuery = `SELECT id FROM perfil_usuario WHERE user_id = $1`;
        const idProfileResponse =  await db.query(getIdProfileQuery, [userId]);
        const profileId = idProfileResponse.rows[0].id;
        console.log("id perfil " + profileId);

        try{

            try{
                const deleteTagsQuery = `DELETE FROM user_tags WHERE user_id = $1`;
                await db.query(deleteTagsQuery, [profileId]);

                try {
                    console.log(tags.length);
                    console.log(Array.isArray(tags));
                    console.log(tags);
                    for (let i = 0; i<tags.length; i++){
                        let tagId = tags[i];
                        const insertTagsQuery = `INSERT INTO user_tags (user_id, tag_id) VALUES ($1, $2)`;
                        await db.query(insertTagsQuery, [profileId, tagId]);
                
                    }
            
                    res.status(200).json({message: "Todo piola"});

                } catch (error) {
                    res.status(500).json({error: "No "})
                }

                
            }catch(err){
                res.status(500).json({err: 'No se pudieron borrar los tags'});
            }
            


        }catch(err){
            res.status(500).json({ err: 'No se pudieron optimizar los tags' });
        }
    } catch (err) {
        
        res.status(500).json({err: "No se pudo obtener el ID del perfil"});
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
  