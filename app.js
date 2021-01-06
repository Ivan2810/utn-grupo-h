const express = require('express');
const mysql = require('mysql');
const util = require('util');

const app = express();
const port = 3000;
app.use(express.json()); //permite el mapeo de la peticion json a object js

// Conexion con mysql
const conexion = mysql.createConnection({
    host: 'localhost',
	user: 'root',
	//password: 'root',
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
        respuesta = await qy(query, [nombre]);

        res.send({'respuesta': respuesta.insertId});


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
        let query = 'SELECT * FROM producto WHERE categoria_id = ?';

        let respuesta = await qy(query, [req.params.id]);

        if (respuesta.length > 0) {
            throw new Error("categoria con libros asociados, no se puede eliminar");
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
        if (!req.body.nombre || !req.body.categoria_id) {
            throw new Error("faltan datos");
        }

        let query = 'SELECT * FROM categoria WHERE id = ?';
        let respuesta = await qy(query, [req.body.categoria_id]);

        if (respuesta.length == 0) {
            throw new Error("error inesperado");
        }

        query = 'SELECT * FROM producto WHERE nombre = ?';
        respuesta = await qy(query, [req.body.nombre.toUpperCase()]);

        if (respuesta.length > 0) {
            throw new Error("el email no se puede modificar");
        }

        let descripcion = '';
        if (req.body.descripcion) {
            descripcion = req.body.descripcion;
        }

        query = 'INSERT INTO producto (nombre, descripcion, categoria_id) VALUES (?, ?, ?)';
        respuesta = await qy(query, [req.body.nombre.toUpperCase(), descripcion, req.body.categoria_id]);

        res.send({'respuesta': respuesta.insertId});

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
       const query = 'SELECT * FROM producto WHERE id = ?';

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
        if (!req.body.nombre || !req.body.categoria_id) {
            throw new Error("No se enviaron los datos necesarios para hacer un update");
        }

        // Verifico que no se repita el nombre
        let query = 'SELECT * FROM producto WHERE nombre = ? AND id <> ?';

       let respuesta = await qy(query, [req.body.nombre.toUpperCase(), req.params.id]);

        if (respuesta.length > 0) {
            throw new Error('Ese nombre de producto ya existe');
        }

        // Verifico que la categoria exista
        query = 'SELECT * FROM categoria WHERE id = ?';
        respuesta = await qy(query, [req.body.categoria_id]);

        if (respuesta.length == 0) {
            throw new Error('No existe la categoria');
        }

        let descripcion = '';
        if(req.body.descripcion) {
            descripcion = req.body.descripcion;
        }
        // Hago el update
        query = 'UPDATE producto SET nombre = ?, descripcion = ?, categoria_id = ? WHERE id = ?';
        respuesta = await qy(query, [req.body.nombre, descripcion, req.body.categoria_id, req.params.id]);

        res.send({'respuesta': respuesta});
    }
   catch(e){
       console.error(e.message);
       res.status(413).send({"Error": e.message});
   }
});

app.delete('/persona/:id', async (req, res) =>{
    try {
        // Borro todos los items y luego el encabezado
        let query = 'DELETE FROM personaitems WHERE personaencabezado = ?';
        let respuesta = await qy(query, [req.params.id]);

        query = 'DELETE FROM personaencabezado WHERE id = ?';
        respuesta = await qy(query, [req.params.id]);

        res.send({"Se borro correctamente": respuesta});
    }
    catch(e){
        console.error(e.message);
        res.status(413).send({"Error": e.message});
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

/**
 * Listas de compras
 * 
 * Ruta -> /lista
 */
app.post('/libro', async (req, res) => {
    try {
       /*
       La estructura de lo que me van a mandar tiene tanto el encabezado
       como los items, seria:
           nombre: "Lista de ejemplo",
           items: [
               {
                   libro_id: 11,
                   cantidad: 11,
               },
               {
                   libro_id: 22,
                   cantidad: 11,
                   
               }
           ]
       Nosotros tenemos que:
       1. Guardar el nombre en la tabla listaencabezado
       2. Tomar el id que le asigno la base de datos a ese encabezado
       3. Guardar cada uno de los items incluyendo el id del encabezado
       verificando previamente que los libros existan
       */    

       if (!req.body.nombre || req.body.items.length == 0) {
           throw new Error('Existen errores que impiden guardar');
       }
       
       // Verifico que los ids de libros existan todos
       // Ref: https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/Array/some
       const existen = req.body.items.some(async item =>{
           const query = 'SELECT id FROM producto WHERE id = ?';
           const respuesta = await qy(query, item.libro_id);

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

       // Guardo el encabezado, no me importa que sea unico por eso
       // no compruebo que el nombre sea unico

       let query = 'INSERT INTO listaencabezado (nombre) VALUE (?)';
       let respuesta = await qy(query, [req.body.nombre]);

       const encabezado_id = respuesta.insertId;

       // Ref: https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/Array/map
       const items = req.body.items.map(item =>{
           i= {
               libro_id: item.libro_id,
               cantidad: item.cantidad,
               listaencabezado_id: encabezado_id
           }

           return i;
       });

       // Guardo los items
       // Ref: https://www.w3schools.com/nodejs/nodejs_mysql_insert.asp

       query = 'INSERT INTO listaitems (libro_id, cantidad, listaencabezado_id) VALUES ?';

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
 
app.get('/libros', async (req, res) =>{
    try {
      
       const query = 'SELECT * FROM listaencabezado';
       const respuesta = await qy(query);
       
       res.send({'respuesta': respuesta});

    }
    catch(e){
       console.error(e.message);
       res.status(413).send({"Error": e.message});
   }
});

app.get('/libros/:id', async (req, res) =>{
   try {
      // Devuelvo lista de libros

      let query = 'SELECT * FROM listaencabezado WHERE id = ?';
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

//put para cambiar
/*
app.put('/libros/:id', (req, res) =>{
   res.status(404).send({"Mensaje": "no se encontró la persona a la que se le quiere prestar el libro"});
});

app.put('/libros/:id', (req, res) =>{
    res.status(404).send({"Mensaje": "error inesperado"});
 });*/

app.delete('/libros/id', async (req, res) =>{
   try {
       // Borro todos los items y luego el encabezado
       let query = 'DELETE FROM listaitems WHERE listaencabezado = ?';
       let respuesta = await qy(query, [req.params.id]);

       query = 'DELETE FROM listaencabezado WHERE id = ?';
       respuesta = await qy(query, [req.params.id]);

       res.send({"Mensaje": "Ese libro no existe"});
   }
   catch(e){
       console.error(e.message);
       res.status(413).send({"Error": e.message});
   }
});



// Servidor
app.listen(port, ()=>{
    console.log('Servidor escuchando en el puerto ', port);
});
