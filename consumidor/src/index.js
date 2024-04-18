const amqp = require('amqplib');

    const protocol='amqp'
    const hostname=process.env.hostRabbit || 'rabbitmq'
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
        const status ="logged in";

        try {

            //Hace la conexion con rabbitmq 
            const conn = await amqp.connect(rabbitSettings);
            console.log('consumidor: rabbitmq conectado')

            //crea el canal
            const channel = await conn.createChannel();
            console.log('consumidor: canal creado')

            //crea la cola
            //Si no hay una cola employees, la crea
            const res = await channel.assertQueue(queue);
            console.log('consumidor: cola creada')

            console.log(`A la espera de mensajes de ${status}`);

            channel.consume(queue, message => {
                let user =  JSON.parse(message.content.toString());
                console.log(`usuario recibido ${user.email}`);
                console.log(user);

                //Entra si es un mensaje destinado al consumidor
                if (user.status == status) {
                    channel.ack(message);
                    console.log('Borrando mensaje de la cola...\n')

                //Entra si no es un mensaje destinado a mi consumidor
                }else{
                    console.log('Este no es un mensaje para este consumidor, por tanto no se puede eliminar')
                }
            })
            

        } catch (error) {
            console.log('Servidor: '+error)
        }
    }
