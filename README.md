# inicio_Api

Aplicacion la cual contiene un archivo DockerFile el cual tiene lo necesario para desplegar una base de datos mysql en localhost y a la escucha por el puerto 3306, esta db contiene una tabla usuarios con 4 columnas las cuales son:id,nombre,email y contraseña.

Esta app tambien tiene un dockerFile el cual contiene lo basico para desplegar un servidor web http que esta a la escucha por el localhost:8080 y el cual recibe solicitudes http relacionadas con un CRUD para usuarios 

## pasos para desplegar las aplicaciones individualmente

1- nos dirijimos al directorio donde esta el dockerfile (src/db) en el caso de querer desplegar la base de datos o (src/api) para despleglar el servidor web
2- con el comando docker build -t Nombre_imagen . creamos la imagen y se le asigna el nombre de Nombre_imagen
3- con el comando docker run -d -p 3306:3306 --name Nombre_imagen Nombre_contenedor subimos el contenedor con el nombre Nombre_contenedor que se ejecutara como un demonio (segundo plano) y estara a la escucha por el puerto 3306 de la maquina y 3306 del contenedor

## pasos para desplegar el docker-compose

1- nos situamos en la carpeta principal del proyecto
2- ejecutamos el comando docker-compose up 
3- los contenedores se orquestaran automaticamente

Nota: el servidor se reiniciara varias veces hasta que la base de datos este lista, esto se debe a que es necesario verificar la salud desde el docker-compose para ejecutar un contenedor despues de que uno en especifico este listo
