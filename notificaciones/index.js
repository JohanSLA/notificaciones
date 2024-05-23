//Importamos el modulo http que viene con node.js el cual me per
const http=require('http');
const nodemailer=require('nodemailer');

//Definimos el puerto de escucha del servidor
const port = 85;

const handleResquest = (request,response) => {

    //Informa por consola que acaban de hacer una solicitud a este servicio
    console.log('Servidor Notificaciones: El servicio Health acaba de hacer una solicitud');

    //LLamado al metodo que me obtiene la url de la solicitud
    url=obtenerUrl(request);

    //Entra si se necesita revisar todos los servicios antes de notificar 
    if (url.includes('todos')) {

        let body = '';

        // Recolectar datos del cuerpo de la solicitud
        request.on('data', chunk => {
            body += chunk.toString(); // Convertir el buffer a string
        });

        request.on('end', () => {
            try {
                const services = JSON.parse(body); // Parsear el JSON
                //Obtiene los servicios caidos
                serviciosCaidos = obtenerServiciosDown(services);
                notificarUsuario(serviciosCaidos);

                // Configurar el encabezado de la respuesta
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ errorServices }));
            } catch (e) {
                response.writeHead(400, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
    













        //Obtiene los servicios caidos
       // serviciosCaidos = obtenerServiciosDown(request.body);

        //Notifica los usuarios sobre los servicios Down
       // notificarUsuario(serviciosCaidos);
      
    //Entra si se necesita revisar un servicio en especifico antes de notificar    
    }else{
        
    }

      
}

//Creamos el servidor http con la funcion handleResquest como argumento
const server =http.createServer(handleResquest);


//Configuramos el servidor para que escuche por ese puerto
server.listen(port,() => {
    console.log('Server notification:' +' Servidor escuchando por el puerto '+port);
    console.log('Servidor de notificaciones a la escucha por la url: http://localhost:'+port);
})



/**
 * Funcion que me obtiene todos los servicios que estan Down y los guarda en un array
 * @param {*} request 
 * @param {*} body 
 */
function obtenerServiciosDown(services) {
    // Filtrar los servicios que tienen la propiedad 'error' y mapear para obtener sus nombres
    return services
        .filter(service => service.error) // Filtrar servicios con la propiedad 'error'
        .map(service => service.serviceName); // Obtener el nombre del servicio
    
}


/**
 * Funcion que notifica al usuario sobre los servicios que estan caidos
 * @param {*} serviciosCaidos 
 */
function notificarUsuario(serviciosCaidos) {

    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'christop.blanda@ethereal.email',
            pass: 'ear7RNvs2KPEd7wca8'
        }
    });

    // async..await is not allowed in global scope, must use a wrapper
async function main() {
    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: '"Health 👻" <healt.@ethereal.email>', // sender address
      to: "christop.blanda@ethereal.email", // list of receivers
      subject: "Health notification ✔", // Subject line
      text: serviciosCaidos, // plain text body
    });
  
    console.log("Message sent: %s", info.messageId);
    // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
  }
  
  main().catch(console.error);
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