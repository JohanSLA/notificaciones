/**
 * Clase por donde iniciara el proyecto (Archivo por donde arrancara el proyecto)
 */

//Importamos el modulo http que viene con node.js el cual me per
const http=require('http');
//Importamos el modulo mysql para usar funciones con mysql
const mysql=require('mysql2');

//Importamos la libreria necesara para manejar los mensajes
const amqp = require("amqplib");

//Importamos las funciones necesarias para manejar las solicitudes que estan en el modulo manejador.js 
const {manejarSolicitudGet,manejarSolicitudPost,manejarSolicitudPatch,manejarSolicitudPut,
    manejarSolicitudDelete}=require('./manejador.js');



//Definimos el nombre que se asinara a la tabla de usuarios
const tablaUsuarios='usuarios'

// Estado de disponibilidad del servicio
let isReady = false;


//Definimos el puerto de escucha del servidor
const port = 8080;

//Definimos la version del servicio
const versionServicio=process.env.version || '1.0.1';

//Registra el tiempo de inicio del servicio
const inicioServicio =  new Date();

//Llamado al metodo para conectarse a la base de datos que estara en el localhost y a la escucha por el puerto 3306
//Lleva el isReady ya que el servicio estara listo cuando el servidor haga conexion con la base de datos, en caso contrario
//no estara listo

const conexion = conexionDb(isReady);


//Funcion la cual me manejara las solicitudes http(Aca entrare cada que use una url en el navegador por el puerto 8080)
const handleResquest = (request,response) => {
    
    //Obtenemos el metodo que se esta usando en la solicitud(GET,PUT,...)
    const metodoPeticion=request.method

    //Imprime por consola el metodo que se esta usando en la solicitud
    console.log('Servidor: El usuario acaba de hacer una solicitud '+metodoPeticion);

    switch (metodoPeticion) {
        case 'GET':
            manejarSolicitudGet(request,response,conexion,versionServicio,inicioServicio,isReady)
            break;
        
        case 'POST':
            manejarSolicitudPost(request,response,conexion,tablaUsuarios)
            break;

        case 'PUT':
            manejarSolicitudPut(request,response,conexion)
            break;
        
        case 'PATCH':
            manejarSolicitudPatch(request,response,conexion)
            break;

        case 'DELETE':
            manejarSolicitudDelete(request,response,conexion)
    
        default:
            break;
    }

    
}

//Creamos el servidor http con la funcion handleResquest como argumento
const server =http.createServer(handleResquest);


//Configuramos el servidor para que escuche por ese puerto
server.listen(port,() => {
    console.log('Server:' +' Servidor escuchando por el puerto '+port);
    console.log('Servidor a la escucha por la url: http://localhost:'+port);
})



//Funcion que se usa para conectarme a la base de datos que estara el el localhost
function conexionDb() {

    const host=process.env.host || 'localhost'
    const user=process.env.user || 'root'
    const password=process.env.password || 'root'
    const database=process.env.database || 'apiDb'

    const dbconfig ={
        host: host,
        user: user,
        password: password,
        database: database
    }

    let conexion;
     
    
    try {
        //Si al intentar hacer la conexion ocurre un erro
        conexion=mysql.createConnection(dbconfig);
    
    conexion.connect((err) => {
        if(err){
            console.log('[db err]', err)

            //Pone a ejecutar el codigo despues de 5000 milisegundos=5 segundos
            //Este codigo se ejecuta hasta que se haga una conexión efectiva a la base de datos
            setTimeout(conexionDb,5000);

        }else{
            //Cambia el estado del servicio a "listo" dado que se realizo la conexión con la base de datos
            isReady=true;
            console.log('Server:'+' DB conectada!');
        }
    })
    } catch (error) {
        conexionDb(isReady);
    }
    return conexion;
}





