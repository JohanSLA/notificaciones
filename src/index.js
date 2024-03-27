/**
 * Clase por donde iniciara el proyecto (Archivo por donde arrancara el proyecto)
 */

//Importamos el modulo http que viene con node.js el cual me per
const http=require('http');
//Importamos el modulo mysql para usar funciones con mysql
const mysql=require('mysql2');

//Definimos el puerto de escucha del servidor
const port = 8080;

//Funcion la cual me manejara las solicitudes http(Aca entrare cada que use una url en el navegador por el puerto 8080)
const handleResquest = (request,response) => {
    //request.url toma la url que ingresamos en el navegador
    switch (request.url) {
        case '/':
            response.end('Bienvenido a la pagina');
            break;
        case '/nosotros':
            response.end ('Entro a la opcion de nosotros')
        break;
    
        default:
            response.end ('Error 404 recurso no encontrado')
            break;
    }
}

//Creamos el servidor http con la funcion handleResquest como argumento
const server =http.createServer(handleResquest);


//Configuramos el servidor para que escuche por ese puerto
server.listen(port,() => {
    console.log('Server:' +' Servidor escuchando por el puerto '+port)
    console.log('Servidor a la escucha por la url: http://localhost:'+port)
})

//Llamado al metodo para conectarse a la base de datos que estara en el localhost y a la escucha por el puerto 3306
conexionDb();

//Funcion que se usa para conectarme a la base de datos que estara el el localhost
function conexionDb() {

    const dbconfig ={
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'apiDb'
    }

    let conexion;
      
    conexion=mysql.createConnection(dbconfig);
    
    conexion.connect((err) => {
        if(err){
            console.log('[db err]', err)
            setTimeout(conMysql,200);
        }else{
            console.log('Server:'+' DB conectada!');
        }
    })

    conexion.on('error', err => {
        console.log('[db err]', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST'){
            conexionDb();
        }else{
            throw err;
        }
    })
  }

