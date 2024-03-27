# inicio_Api
Aplicacion la cual contiene un archivo Dockerfile el cual tiene lo necesario para desplegar una base de datos mysql en localhost y a la escucha por el puerto 3306, esta db contiene una tabla usuarios con 4 columnas. 

Esta aplicacion tambien tiene lo necesario para recibir solicititudes http por el puerto 8080.

Para desplegar la base de datos seguimos los siguientes pasos:
1- nos dirijimos al directorio donde esta el dockerfile (src/db)
2- con el comando docker build -t db creamos la imagen
3- con el comando docker run -d -p 3306:3306 --name db db subimos el contenedor con el nombre db que se ejecutara como un demonio (segundo plano) y estara a la escucha por el pueeto 3306 de la maquina y 3306 del contenedor
