const http = require('http');
const axios = require('axios');

// Almacena la información de los microservicios a monitorear.
const services = {};

// Registra un nuevo microservicio para monitorear.
function registerService({ name, endpoint, frequency, emails }) {
    services[name] = { endpoint, frequency, emails, status: 'unknown' };
}

// Verifica la salud de un microservicio.
async function checkServiceHealth(name) {
    const service = services[name];
    if (!service) {
        throw new Error(`Service '${name}' not found`);
    }
    try {

        //Prueba
        console.log(service.endpoint)


        const response = await axios.get(service.endpoint);

        service.status = response.data.status || 'healthy';

        return response.data;

    } catch (error) {
        service.status = 'unhealthy';
        return service.status;
    }
    
}


// Verifica la salud de todos los microservicios registrados.
async function checkAllServicesHealth() {
    const results = {};
    for (const name in services) {
        const status = await checkServiceHealth(name);
        results[name] = status;
    }
    return results;
}

// Crea un servidor HTTP simple.
const server = http.createServer(async (req, res) => {
    // Manejar la ruta /register.
    if (req.url === '/registrar' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const data = JSON.parse(body);
            registerService(data);
            console.log('Servidor Health: Servicio registrado con exito\n')
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Servicio '+data.name+ ' registrado con exito' }));
        });
    }

    // Manejar la ruta /health.
    else if (req.url === '/health' && req.method === 'GET') {
        const results = await checkAllServicesHealth();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(results));
    }

    // Manejar la ruta /health/{microservicio}.
    else if (req.url.startsWith('/health/') && req.method === 'GET') {
        const name = req.url.split('/')[2];
        try {
            const status = await checkServiceHealth(name);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ name, status }));
        } catch (error) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    }

    // Si la ruta no coincide, devuelve un error 404.
    else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
});

// Inicia el servidor en el puerto 3000.
server.listen(3000, () => {
    console.log('\nServidor Health: Health Monitor server corriendo en el puerto 3000\n');
});