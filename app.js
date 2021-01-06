const express = require('express');
const mysql = require('mysql');
const util = require('util');
const cors = require('cors');

const app = express();
const port = 3000;
app.use(express.json()); //permite el mapeo de la peticion json a object js
app.use(cors());

// Conexion con mysql
const conexion = mysql.createConnection({
    host: 'localhost',
	user: 'root',
	password: '',
	database: 'biblioteca'
});

conexion.connect((error)=>{
    if(error) {
        throw error;
    }

    console.log('Conexion con la base de datos mysql establecida');
});

const qy = util.promisify(conexion.query).bind(conexion); // permite el uso de asyn-await en la conexion mysql


// Desarrollo de la logica de la biblioteca
//Del github de Lorena
/**
 * Categoria de libros
 * GET para devolver todas las categorias
 * GET id para devolver uno solo
 * POST guardar una categoria nueva
 * PUT para modificar una categoria existente
 * DELETE para borrar una categoria existente
 * 
 * Ruta -> /categoria
 */
 
 /**
 CATEGORIA
 *POST '/categoria' recibe: {nombre: string} retorna: status: 200, {id: numerico, nombre: string} - status: 413, {mensaje: <descripcion del error>} que puede ser: "faltan datos", "ese nombre de categoria ya existe", "error inesperado"
 *GET '/categoria' retorna: status 200  y [{id:numerico, nombre:string}]  - status: 413 y []
 *GET '/categoria/:id' retorna: status 200 y {id: numerico, nombre:string} - status: 413, {mensaje: <descripcion del error>} que puede ser: "error inesperado", "categoria no encontrada"
 *DELETE '/categoria/:id' retorna: status 200 y {mensaje: "se borro correctamente"} - status: 413, {mensaje: <descripcion del error>} que puese ser: "error inesperado", "categoria con libros asociados, no se puede eliminar", "no existe la categoria indicada"
 *No se debe implementar el PUT
 */
 
 app.post('/categoria', async (req, res) => {
    try {
        // Valido que me manden correctamente la info
        if (!req.body.nombre) {
            throw new Error('faltan datos');
        }

        // Verifico que no exista previamente esa categoria
        let query = 'SELECT id FROM categoria WHERE nombre = ?';

        let respuesta = await qy(query, [req.body.nombre.toUpperCase()]);

        if (respuesta.length > 0) { 
            throw new Error('Esa categoria ya existe');
        }

        // Guardo la nueva categoria
        query = 'INSERT INTO categoria (nombre) VALUE (?)';
        respuesta = await qy(query, [req.body.nombre.toUpperCase()]);

        res.send({'respuesta': respuesta});


    }   
    catch(e){
        console.error(e.message);
        res.status(413).send({"Error": e.message});
    }
 });


 app.get('/categoria', async (req, res) => {
    try {
        const query = 'SELECT * FROM categoria';
        
        const respuesta = await qy(query);

        res.send({"respuesta": respuesta});

    }
    catch(e){
        console.error(e.message);
        res.status(413).send({"Error": e.message});
    }
 });

 app.get('/categoria/:id', async (req, res) => {
    try {
        const query = 'SELECT * FROM categoria WHERE id = ?';

        const respuesta = await qy(query, [req.params.id]);
        console.log(respuesta);

        res.send({"respuesta": respuesta});
    }
    catch(e){
        console.error(e.message);
        res.status(413).send({"categoria no encontrada": e.message});
    }
 });


 app.delete('/categoria/:id', async (req, res) => {
     try {
        let query = 'SELECT * FROM libro WHERE categoria_id = ?';

        let respuesta = await qy(query, [req.params.id]);

        if (respuesta.length > 0) {
            throw new Error("categoria con libros asociados, no se puede eliminar");
        }

        query = 'SELECT * FROM categoria WHERE id = ?';

        respuesta = await qy(query, [req.params.id]);
        

        // valido que la categoria solicitada exista previamente
        if (respuesta.length == 0) { 
            throw new Error('No existe la categoria indicada');
        }

        query = 'DELETE FROM categoria WHERE id = ?';

        respuesta = await qy(query, [req.params.id]);

        res.send({"se borro correctamente":respuesta});

     }
     catch(e){
        console.error(e.message);
        res.status(413).send({"Error": e.message});
    }
 });





/**
*PERSONA
*POST '/persona' recibe: {nombre: string, apellido: string, alias: string, email: string} retorna: status: 200, {id: numerico, nombre: string, apellido: string, alias: string, email: string} - status: 413, {mensaje: <descripcion del error>} que puede ser: "faltan datos", "el email ya se encuentra registrado", "error inesperado"
*GET '/persona' retorna status 200 y [{id: numerico, nombre: string, apellido: string, alias: string, email; string}] o bien status 413 y []
*GET '/persona/:id' retorna status 200 y {id: numerico, nombre: string, apellido: string, alias: string, email; string} - status 413 , {mensaje: <descripcion del error>} "error inesperado", "no se encuentra esa persona"
*PUT '/persona/:id' recibe: {nombre: string, apellido: string, alias: string, email: string} el email no se puede modificar. retorna status 200 y el objeto modificado o bien status 413, {mensaje: <descripcion del error>} "error inesperado", "no se encuentra esa persona"
*DELETE '/persona/:id' retorna: 200 y {mensaje: "se borro correctamente"} o bien 413, {mensaje: <descripcion del error>} "error inesperado", "no existe esa persona", "esa persona tiene libros asociados, no se puede eliminar"
*/
 /**
  * Productos
  * 
  * Ruta -> /producto
  */

 app.post('/persona', async(req, res) => {
    try {
        if (!req.body.nombre || !req.body.apellido || !req.body.alias|| !req.body.email) {
            throw new Error("faltan datos");
        }

        let query = 'SELECT id FROM persona WHERE email = ?';
        let respuesta = await qy(query, [req.body.email.toLowerCase]);

        if (respuesta.length > 0) {
            throw new Error("El email ya se encuetra registrado");
        }

        // Guardo la nueva persona
        query = "INSERT INTO persona (nombre,apellido,alias,email) VALUES (?,?,?,?)";
        respuesta = await qy(query, [req.body.nombre,req.body.apellido,req.body.alias,req.body.email]);
	
		
        // res.send({'respuesta': respuesta.insertId});//solo responde el id 
		res.send({'Registro insertado': {"Nombre":req.body.nombre,"Apellido":req.body.apellido,"Alias":req.body.alias,"Email":req.body.email}});//responde todo
     }
    catch(e){
            console.error(e.message);
            res.status(413).send({"Error": e.message});
        }
     });


 app.get('/persona', async (req, res) => {
     try {
        const query = 'SELECT * FROM persona';

        const respuesta = await qy(query);
        res.send({'respuesta': respuesta});
     }
    catch(e){
        console.error(e.message);
        res.status(413).send({"Error": e.message});
    }
 });

 app.get('/persona/:id', async (req, res) => {
    try {
       const query = 'SELECT * FROM persona WHERE id = ?';

       const respuesta = await qy(query, [req.params.id]);
       res.send({'respuesta': respuesta}); 
    }
   catch(e){
       console.error(e.message);
       res.status(413).send({"Error": e.message});
   }
});

app.put('/persona/:id', async (req, res) => {
    try {
        if (!req.body.nombre || !req.body.apellido || !req.body.alias|| !req.body.email) {
            throw new Error("El email no se puede modificar");
        }

        // Verifico que no se repita el nombre, lo cambiamos por EMAIL.
        let query = 'SELECT * FROM persona WHERE email = ? AND id <> ?';

        let respuesta = await qy(query, [req.body.nombre.toUpperCase(), req.params.id]);

        if (respuesta.length > 0) {
            throw new Error('Error inesperado');
        }
    }
   catch(e){
       console.error(e.message);
       res.status(413).send({"Error": e.message});
   }
});

app.delete('/persona/:id', async (req, res) =>{
    try {
        // Borro todos los items y luego el encabezado
        let query = 'DELETE * FROM persona WHERE id = ?';
        let respuesta = await qy(query, [req.params.id]);

        query = 'DELETE FROM persona WHERE id = ?';
        respuesta = await qy(query, [req.params.id]);

        res.send({"Se borro correctamente": respuesta});
    }
    catch(e){
        console.error(e.message);
        res.status(413).send({"Error inesperado": e.message});
    }
});

/**
*LIBRO
*POST '/libro' recibe: {nombre:string, descripcion:string, categoria_id:numero, persona_id:numero/null} devuelve 200 y {id: numero, nombre:string, descripcion:string, categoria_id:numero, persona_id:numero/null} o bien status 413,  {mensaje: <descripcion del error>} que puede ser "error inesperado", "ese libro ya existe", "nombre y categoria son datos obligatorios", "no existe la categoria indicada", "no existe la persona indicada"
*GET '/libro' devuelve 200 y [{id: numero, nombre:string, descripcion:string, categoria_id:numero, persona_id:numero/null}] o bien 413, {mensaje: <descripcion del error>} "error inesperado"
*GET '/libro/:id' devuelve 200 {id: numero, nombre:string, descripcion:string, categoria_id:numero, persona_id:numero/null} y status 413, {mensaje: <descripcion del error>} "error inesperado", "no se encuentra ese libro"*PUT '/libro/:id' y {id: numero, nombre:string, descripcion:string, categoria_id:numero, persona_id:numero/null} devuelve status 200 y {id: numero, nombre:string, descripcion:string, categoria_id:numero, persona_id:numero/null} modificado o bien status 413, {mensaje: <descripcion del error>} "error inesperado",  "solo se puede modificar la descripcion del libro
*PUT '/libro/prestar/:id' y {id:numero, persona_id:numero} devuelve 200 y {mensaje: "se presto correctamente"} o bien status 413, {mensaje: <descripcion del error>} "error inesperado", "el libro ya se encuentra prestado, no se puede prestar hasta que no se devuelva", "no se encontro el libro", "no se encontro la persona a la que se quiere prestar el libro"
*PUT '/libro/devolver/:id' y {} devuelve 200 y {mensaje: "se realizo la devolucion correctamente"} o bien status 413, {mensaje: <descripcion del error>} "error inesperado", "ese libro no estaba prestado!", "ese libro no existe"
*DELETE '/libro/:id' devuelve 200 y {mensaje: "se borro correctamente"}  o bien status 413, {mensaje: <descripcion del error>} "error inesperado", "no se encuentra ese libro", "ese libro esta prestado no se puede borrar"
*/

app.post('/libro', async (req, res) => {
    try {
       if (!req.body.nombre ||!req.body.descripcion||!req.body.categoria_id ||!req.body.persona_id == 0) {
           throw new Error('Ese libro ya existe');
       }
       
       // Verifico que los ids de libros existan todos
       // Ref: https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/Array/some
       const existen = req.body.libro.some(async libro =>{
           const query = 'SELECT id FROM libro WHERE id = ?';
           const respuesta = await qy(query, libro.libro_id);
  //No estamos segudo de las lineas 275 a 277
           if (respuesta.length == 0) {
               return false;
           }
           else {
               return true;
           }
       });

       if (!existen) {
           throw new Error('No existe la categoría indicada')
       }

       // Guardo el libro, no me importa que sea unico por eso
       // no compruebo que el nombre sea unico

       let query = 'INSERT INTO libro_id (nombre) VALUE (?)';
       let respuesta = await qy(query, [req.body.nombre]);

       const libro_id = respuesta.insertId;

       // Ref: https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/Array/map
       const items = req.body.items.map(item =>{
           i= {
               libro_id: item.libro_id,
               descripcion: item.descripcion,
               nombre_id: categoria_id
           }

           return i;
       });

       // Guardo los items
       // Ref: https://www.w3schools.com/nodejs/nodejs_mysql_insert.asp

       query = 'INSERT INTO libro (libro_id, descripcion, nombre_id, categoria_id) VALUES ?';

       const values = items.map(item=>Object.values(item));

       respuesta = await qy(query, [values]);

       console.log(respuesta);
       res.send({'respuesta':respuesta});

    }
   catch(e){
      console.error(e.message);
      res.status(413).send({"Error": e.message});
  }
});
 
app.get('/libro', async (req, res) =>{
    try {
      
       const query = 'SELECT * FROM libro';
       const respuesta = await qy(query);
       
       res.send({'respuesta': respuesta});

    }
    catch(e){
       console.error(e.message);
       res.status(413).send({"Error": e.message});
   }
});

app.get('/libro/:id', async (req, res) =>{
   try {
      // Devuelvo lista de libros

      let query = 'SELECT * FROM libro WHERE id = ?';
      let respuesta = await qy(query, [req.params.id]);
      
      if (respuesta.length == 0) { //Error inesperado
           throw new Error('No se encuentra ese libro');
      }
      

      const libro = {
          encabezado: encabezado,
          items: respuesta
      }

      res.send({'respuesta': libro});

   }
   catch(e){
      console.error(e.message);
      res.status(413).send({"Error": e.message});
  }
});


app.put('/libro/:id', async (req, res)=>{
    try {
       
       if (req.body.nombre != null || req.body.categoria_id != null || req.body.descripcion == null) {
           throw new Error("Solo se puede modificar la descripcion del libro");
       }

       
       let query = 'SELECT * FROM libro WHERE  id = ?';

       let respuesta = await qy(query, [req.params.id]);

       if (respuesta.length == 0) {
           throw new Error("No se encontro el libro");
       }

       console.log('podes seguir');
       
       id = respuesta[0].id;
       nombre = respuesta[0].nombre;
       descripcion = req.body.descripcion;
       categoria_id = respuesta[0].categoria_id;
       persona_id = respuesta[0].persona_id;

    
       query = 'UPDATE libro SET descripcion = ? WHERE id = ?';

       respuesta = await qy(query, [descripcion,req.params.id]);

    
       res.send({'Registro actualizado': {"Id":req.params.id,"Nombre":nombre,"Descripcion":descripcion,"Categoria ID":categoria_id,"Persona ID":persona_id}});

    }
    catch(e){
       console.error(e.message);
       res.status(413).send({"Error": e.message});
       res.status(413).send("Error Inesperado");
   }
});


app.put('/libro/prestar/:id', async (req, res)=>{
    try {
       
       let query = 'SELECT * FROM libro WHERE  id = ?';

       let respuesta = await qy(query, [req.params.id]);

       if (respuesta.length == 0) {
           throw new Error("No se encontro el libro");
       }

       if (respuesta[0].persona_id != null ) {
            throw new Error("El libro ya se encuentra prestado, no se puede prestar hasta que no se devuelva");
        }


        query = 'SELECT * FROM persona WHERE  id = ?';

        respuesta = await qy(query, [req.body.persona_id]);

        if (respuesta.length == 0 ) {
            throw new Error("no se encontro la persona a la que se quiere prestar el libro");
        }

        persona_id = req.body.persona_id;

    
       query = 'UPDATE libro SET persona_id = ? WHERE id = ?';

       respuesta = await qy(query, [persona_id,req.params.id]);
    
       res.send('Se presto correctamente');

    }
    catch(e){
       console.error(e.message);
       res.status(413).send({"Error": e.message});
    //    res.status(413).send("Error Inesperado");
   }
});


app.put('/libro/devolver/:id', async (req, res)=>{
    try {
       
       let query = 'SELECT * FROM libro WHERE  id = ?';

       let respuesta = await qy(query, [req.params.id]);

       if (respuesta.length == 0) {
           throw new Error("Ese libro no existe");
       }

       if (respuesta[0].persona_id == null ) {
            throw new Error("Ese libro no estaba prestado");
        }
    
       query = 'UPDATE libro SET persona_id = null WHERE id = ?';

       respuesta = await qy(query, [req.params.id]);
    
       res.send('Se presto correctamente');

    }
    catch(e){
       console.error(e.message);
       res.status(413).send({"Error": e.message});
    //    res.status(413).send("Error Inesperado");
   }
});


// Servidor
app.listen(port, ()=>{
    console.log('Servidor escuchando en el puerto ', port);
});
