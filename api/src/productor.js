const amqp = require('amqplib');

//Funcion que hace la conexion al sistema de mensajeria rabbitmq
function conexionRabbit(msgs) {

    const protocol='amqp'
    const hostname=process.env.hostName || 'rabbitmq'
    const username=process.env.username || 'guest'
    const password=process.env.passwordRabbit || 'guest'
    const vhost=process.env.vHost || '/'


    const rabbitSettings = {
        protocol: protocol,
        hostname: hostname,
        port: 5672,
        username: username,
        password: password,
        vhost: vhost,
        authMechanism: ['PLAIN','AMQPLAIN','EXTERNAL']
    }

    connect();

    async function connect(){

        //cola
        const queue = "users";

        try {

            //Hace la conexion con rabbitmq 
            const conn = await amqp.connect(rabbitSettings);
            console.log('Servidor: rabbitmq conectado')

            //crea el canal
            const channel = await conn.createChannel();
            console.log('Servidor: canal creado')

            //crea la cola
            //Si no hay una cola employees, la crea
            const res = await channel.assertQueue(queue);
            console.log('Servidor: cola creada')

            //Envia el mensaje a la cola
            for(let msg in msgs){
                await channel.sendToQueue(queue, Buffer.from(JSON.stringify(msgs[msg])));
                console.log(`Servidor: mensaje enviado a la cola ${queue}`);
            }

            

        } catch (error) {
            console.log('Holi')
            console.log('Servidor: '+error)
        }
    }
}

module.exports = {conexionRabbit};