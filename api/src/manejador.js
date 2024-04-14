const mysql = require('mysql2')
const querystring = require('querystring');
const jwt = require('jsonwebtoken');
const { parse } = require('path');
const { Console } = require('console');



/**
 * Funcion que sirve para manejar las solicitudes GET
 * @param {*} request 
 * @param {*} response 
 */
function manejarSolicitudGet(request,response,conexion,tablaUsuarios){

    //LLamado al metodo que me obtiene la url de la solicitud
    url=obtenerUrl(request);

    if (url.includes('busqueda?id=')) {
        //Llamada al metodo para extraer el id de la url para buscarlo
        idBusqueda=obtenerId(url);

        //Mostramos en el servidor el id del usuario que se desea eliminar
        console.log('Servidor: el id a buscar es '+idBusqueda);

        conexion.query('SELECT * FROM usuarios WHERE id = ?', [idBusqueda], (error, results, fields) => {
            if (error) {
              console.error('Error al buscar usuario en la base de datos:', error);
              response.writeHead(500, {'Content-Type': 'text/plain'});
              response.end('Error interno del servidor');
              return;
            }
      
            if (results.length === 0) {
              console.log("Servidor: Usuario no encontrado");
              response.writeHead(404, {'Content-Type': 'text/plain'});
              response.end('Usuario no encontrado');
              return;
            }
      
            const usuario = results[0];
            // Enviar el usuario como respuesta en el cuerpo de la solicitud HTTP
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(usuario));
        });

    
    }else if (url.includes('busqueda/todos')) {
       
        //Entra aca cuando la solicitud get contiene busqueda/todos
        conexion.query('SELECT * FROM usuarios', (error, results, fields) => {
            if (error) {
                console.error('Error al buscar usuario en la base de datos:', error);
                response.writeHead(500, {'Content-Type': 'text/plain'});
                response.end('Error interno del servidor');
                return;
              }
        
              if (results.length === 0) {
                response.writeHead(404, {'Content-Type': 'text/plain'});
                response.end('Usuarios no encontrados');
                return;
              }

              //Crea una lista con los usuarios
              let usuarios = '';
              results.forEach(usuario => {
              usuarios += `ID: ${usuario.id}, Nombre: ${usuario.nombre}, Email: ${usuario.email}`+'    ';
              });

               response.writeHead(200, {'Content-Type': 'text/plain'});
               response.end(JSON.stringify(usuarios));
        });


    }else if (url.includes('login')) {
        //Entra si se desea hacer login 

        let datos = '';

        // Manejar el evento 'data' para ir acumulando el cuerpo de la solicitud
        request.on('data', (chunk) => {
            datos += chunk;
        });

        // Manejar el evento 'end' para procesar los datos una vez que se haya completado la solicitud
        request.on('end', () => {
            // Aquí puedes hacer algo con los datos recibidos, como parsearlos si son JSON
            const cuerpo = JSON.parse(datos);

            // Por ejemplo, si recibes un objeto JSON con usuario y contraseña, puedes acceder a sus propiedades
            const email = cuerpo.email;
            const contrasena = cuerpo.contrasena;

            // Verificar si se proporcionaron email y contrasena
            if (!email || !contrasena) {
                //Entra si el usuario o contraseña estan ausentes(no existen)

                //El sevidor repsonde al cliente con el codigo 400 con un mensaje personalizado
                console.log('Server: No se pudo generar el token')
                response.writeHead(404, {'Content-Type': 'text/plain'})
                response.end('Server: Los atributos email y contrasena son obligatorios.')

            }else{
                //Realiza la consulta en la base de datos con las credenciales
                conexion.query('SELECT * FROM usuarios WHERE email = ? AND contrasena = ?', [email,contrasena], (error, results, fields) => {

                    if (error) {
                      console.error('Servidor: Error del servidor');
                    }
              
                    if (results.length === 0) {
                        console.log('Servidor: Usuario no encontrado');
                    }
            
                    // El usuario fue encontrado, results contendrá la información del usuario
                    const usuario = results[0];
                    
                    //Si el usuario no existe es porque no hay usuario con esas credenciales
                    if (!usuario) {
                        console.log('Server: No se pudo generar el token');
                        response.writeHead(404, {'Content-Type': 'text/plain'});
                        response.end('Problemas con las credenciales');
                    }else{
                        //Toma el id del usuario para ingresar la informacion al token
                        const idUsuario = usuario.id;

                         //Entra si encuentra las credenciales ingresadas por post
                        // Generar JWT con una vigencia de una hora
                        const token = jwt.sign({ email, idUsuario }, 'secreto', { expiresIn: '1h', issuer: 'ingesis.uniquindio.edu.co' });
    
    
                        // Devolver el token JWT como respuesta
                        console.log('Servidor: Token generado exitosamente')
                        response.writeHead(200, { 'Content-Type': 'application/json' });
                        response.end(JSON.stringify({ token })); 
                    }
                });
            }
        });
    
    }else{
          // Si la URL no es para buscar un usuario, devolver un error 404
          response.writeHead(404, {'Content-Type': 'text/plain'});
          response.end('Servidor: Problema con la url');
        }    
}

/**
 * mMetodo que extrae el id de la url
 * @param {*} url 
 */
function obtenerId(url) {
    
    // Utilizamos la expresión regular para obtener el valor después del '='
    const id = url.match(/(?<=\=)(.*?)(?=\&|$)/)[0];
    return id;
}

/**
 * funcion que obtiene la url de una solicitud get http
 * @param {*} re 
 */
function obtenerUrl(request){
    if (request.error) {
        console.log('servidor: problema en con la url de la solicitud get')
    }else{
        return request.url;
    }
}


/**
 * Funcion que sirve para manejar las solicitudes POST
 * @param {*} request 
 * @param {*} response 
 */
function manejarSolicitudPost(request,response,conexion,tablaUsuarios){


    //LLamado al metodo que me obtiene la url de la solicitud
    url=obtenerUrl(request);

    if (url.includes('agregar')) {
    
        let body = '';
        request.on('data', chunk => {
            body += chunk.toString(); // Convertir el buffer a string
        });
        request.on('end', () => {

            //Aqui queda alojada toda la informacion ingresada al body
            const parsedBody = JSON.parse(body); // Parsear el cuerpo como JSON
            
            //Verifica si el cuerpo tiene todos los datos necesarios
            if (parsedBody.id!=null && parsedBody.nombre!='' && parsedBody.email!='' && parsedBody.contrasena!='') {
                
                //Ingresa el usuario en la Base de datos
                conexion.query('INSERT INTO usuarios SET ?', parsedBody, (error, resultado) => {
                    if (error) {
                        console.error('Servidor: Error al insertar el registro ', error);
                        response.writeHead(400, {'Content-Type': 'text/plain'});
                        response.end('Error en el cuerpo de la solicitud');
                        return;
                    }
                    console.log('Servidor: Registro insertado con éxito en la base de datos');
                    response.writeHead(200, {'Content-Type': 'text/plain'});
                    response.end('Usuario registrado con exito');

                });
            }else{
                //Muestra el error por consola del servidor
                console.log('Servidor: Error, verifique los datos ingresados en el cuerpo de la solicitud');

                //Mustra la respuesta al usuario
                response.writeHead(404, {'Content-Type': 'text/plain'});
                response.end('Problema con el cuerpo de la solicitud');
            }
            
        });
    
    }

    

}


/**
 * Funcion que sirve para manejar las solicitudes PUT
 * Actualiza los usuarios, se indica un id por la url de la solicitud
 * @param {*} request 
 * @param {*} response 
 */
function manejarSolicitudPut(request,response,conexion){

   //LLamado al metodo que me obtiene la url de la solicitud
   url=obtenerUrl(request);


    if (url.includes('actualizar')) {

        let verificacionToken = false;
            
        let body = '';
        request.on('data', chunk => {
            body += chunk.toString(); // Convertir el buffer a string
        });
                
        
        request.on('end', () => {

            //Aqui queda alojada toda la informacion ingresada al body
            const parsedBody = JSON.parse(body); // Parsear el cuerpo como JSON

            //Obtiene el id del body(Cuerpo) de la solicitud
            idUsuario=parsedBody.id;
            
            //Llama al metodo para hacer verificaciones del token
            verificacionToken=verificarToken(idUsuario,request);
             
            if (verificacionToken === true) {
                //Ingresa el usuario en la Base de datos
                conexion.query('UPDATE usuarios SET ? WHERE id = ?', [parsedBody,parsedBody.id], (error, resultado) => {
                    if (error) {
                        console.error('Servidor: Error al actualizar el registro ', error);
                        response.writeHead(400, {'Content-Type': 'text/plain'});
                        response.end('Error en el cuerpo de la solicitud');
                        return;
                    }

                    if (resultado.affectedRows === 0) {
                        console.log('Servidor: No se encontró ningún usuario con el ID proporcionado');
                        response.writeHead(404, {'Content-Type': 'text/plain'});
                        response.end('No se encontro un usuario registrado con ese id');
                        return;
                    }else{
                        console.log('Servidor: Registro actualizado con éxito en la base de datos');
                        response.writeHead(200, {'Content-Type': 'text/plain'});
                        response.end('Usuario actualizado con exito');
                    }
                });
            }else{
                console.log('Servidor: Lo sentimos, verifique su atenticación');
                response.writeHead(400, {'Content-Type': 'text/plain'});
                response.end('Lo sentimos,verifique su atenticación y que el id sea valido');
            }  
        });
    }   
}

/**
 * Funcion que me obtiene el id del cuerpo de la solicitud
 * @param {*} request 
 */
function obtenerIdCuerpo(request) {
    

}

/**
 * Funcion que sirve para manejar las solicitudes PATCH
 * @param {*} request 
 * @param {*} response 
 */
function manejarSolicitudPatch(request,response,conexion){
    
}


/**
 * Funcion que sirve para manejar las solicitudes DELETE
 * Esta funcion elimina el usuario , el id se espcifica en la url de la solictud y solo el usuaurio se puede eliminar por si mismo
 * @param {*} request 
 * @param {*} response 
 */
function manejarSolicitudDelete(request,response,conexion){
    //LLamado al metodo que me obtiene la url de la solicitud
    url=obtenerUrl(request);

    if (url.includes('/eliminar?id=')) {
     
        //Extrae el id de la url
        idUsuario=obtenerId(url);

        //Declaracion de la variable que verificara el token
        //verificara que el id de la persona a eliminar concuerde con la del token
        let verificacionToken = false;

        //Llamado al metodo que verifica el id a eliminar con el token
        verificacionToken = verificarToken(idUsuario,request);

        if (verificacionToken === true) {
            conexion.query('DELETE FROM usuarios WHERE id = ?' ,idUsuario, (error, resultado) => {
                if (error) {
                    console.error('Servidor: Error al eliminar el registro ', error);
                    response.writeHead(400, {'Content-Type': 'text/plain'});
                    response.end('Error en el cuerpo de la solicitud');
                    return;
                }
                console.log('Servidor: Registro eliminado con éxito en la base de datos');
                response.writeHead(200, {'Content-Type': 'text/plain'});
                response.end('Usuario eliminado con exito');
    
            });
        }else{
            console.log('Servidor: Lo sentimos, verifique su atenticación o que no este eliminando otro usuario que no sea usted');
            response.writeHead(400, {'Content-Type': 'text/plain'});
            response.end('Lo sentimos,verifique su atenticación o que no este eliminando otro usuario que no sea usted');
        }  
    }

}

/**
 * Funcion que me permite verificar si el id del usuario es el mismo al del token 
 * @param {*} idUsuario 
 * @param {*} request 
 */
function verificarToken(idUsuario,request){

    //Declaracion e inicializacion de la variable a retornar al final de la verificación
    let estadoRetornar=false;

    // Obtener el token de la cabecera Authorization
    const token = request.headers.authorization

    // Verificar y decodificar el token JWT
    jwt.verify(token, 'secreto', (err, decoded) => {
        if (err) {
            estadoRetornar= false;
        }


        if (!token) {
            estadoRetornar= false;
        }else{


            try {
                // Verificar el emisor y la vigencia del token
                //decode.iss extrae el emisor del token
                //decode.idUsuario extrae el id del usuario del token
                //parseInt(idUsuario) convierte en int el valor ya que el metodo lo arroja como string
                if (decoded.iss !== 'ingesis.uniquindio.edu.co' || decoded.idUsuario !== parseInt(idUsuario) || Date.now() >= decoded.exp * 1000) {
                    console.log('Servidor: token no valido o expirado')
                    estadoRetornar=false;
                }else{
                    // Si todo está bien, responder con éxito
                    console.log('Servidor: El usuario tiene permitido eliminar el usuario')
                    estadoRetornar=true;
                    return estadoRetornar;
                } 
            } catch (error) {
                estadoRetornar=false;
                console.log('Servidor: token no valido o expirado');
            }
            
        }
        
    });

    //Retorna el estado de la verificación
    return estadoRetornar;
}

//Exportacion de las funciones del modulo
module.exports = { manejarSolicitudGet,manejarSolicitudPost,manejarSolicitudPatch,manejarSolicitudPut,manejarSolicitudDelete };