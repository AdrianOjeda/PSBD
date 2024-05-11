import express from "express";
import bodyParser from "body-parser";
import cors from 'cors';
import pg from "pg";
import sha1 from 'sha1';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { verify } from "crypto";
import { profile } from "console";

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
app.post('/api/addToCart', verifyToken,async (req, res) => {
    try {
        const { bookId, cantidad } = req.body; // Obtiene los datos del cuerpo de la solicitud
        const userId = req.user.userId; // Obtén el ID de usuario del token de autenticación
        console.log(req.user)
        console.log("Datos recibidos en la solicitud:");
        console.log("bookId:", bookId);
        console.log("cantidad:", cantidad);
        console.log("userId:", userId);

        // Inserta los datos en la base de datos
        const insertQuery = 'INSERT INTO carrito(id_cliente, id_de_libro, cantidad) VALUES ($1, $2, $3)';
        const result = await db.query(insertQuery, [userId, bookId, cantidad]);

        res.status(200).json({ message: 'Libro agregado al carrito exitosamente' });
    } catch (error) {
        console.error('Error al agregar libro al carrito:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


app.post('/api/addBook', verifyToken, upload.single('image'), async (req, res) => {
    try {
        const userId = req.token;
        const { titulo, autor, isbn, descripcion } = req.body;
        const image = req.file; // Access the uploaded file
        const imageName = image.filename; // Store the filename
        console.log(imageName);
        // Insert book data into the database, including the image filename or URL
        const insertQuery = `
            INSERT INTO libro (titulo, autor, isbn, descripcion, idusuario, coverimage)
            VALUES ($1, $2, $3, $4, $5, $6)`;
        const result = await db.query(insertQuery, [titulo, autor, isbn, descripcion, userId, imageName]); // Assuming filename is used to store the image
        console.log(result.rows);
        
        // Respond with success message
        res.status(200).json({ message: 'Book added successfully' });
    } catch (error) {
        console.error('Error adding book:', error);
        res.status(500).json({ error: 'Failed to add book' });
    }
});


app.delete('/api/deleteBook/:id', verifyToken, async (req, res)=>{
    try{
        const userId = req.user.userId;
        const bookId = req.params.id;
        console.log("user id: "+ userId);
        console.log("book id "+ bookId);

        const deleteBookQuery = `DELETE FROM libro where id_libro =$1 AND idusuario = $2`;
        await db.query(deleteBookQuery, [bookId, userId]);
        
         

        res.status(200).json({message: "so far so good!"})

    }catch(error){

        res.status(500).json({error: 'Couldnt delete book!'})
    }
    

});


app.post('/api/editBook', verifyToken, async (req, res)=>{
    try{
        const idUsuario =  req.user.userId;
        const {titulo, autor, isbn, precio, idLibro} = req.body;
        console.log("Id Usuario " + idUsuario);
        console.log({titulo, autor, isbn, precio, idLibro});

        const updateBookQuery = `update libro set titulo = $1, autor = $2, isbn = $3, precio = $4 where id_libro = $5 and idusuario = $6 `;

        await db.query(updateBookQuery, [titulo, autor, isbn, precio, idLibro, idUsuario])

        res.status(200).json({message: "So far so good"});

    }catch (error){

        res.status(500).json({error: "Book update failed"})

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
  