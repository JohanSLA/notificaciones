# Utiliza la imagen oficial de MySQL desde Docker Hub
FROM mysql:latest

# Establece la contraseña de root para el contenedor MySQL (cámbiala según tus necesidades)
ENV MYSQL_ROOT_PASSWORD=root

# Copiamos el script SQL para inicializar la base de datos a la hora de usar la imagen
COPY init.sql /docker-entrypoint-initdb.d/

#Expone por el puerto 3306 (mysql esta a la escucha por ese puerto)
EXPOSE 3306