-- crea la base de datos en caso de no existir con el nombre apiDb
CREATE DATABASE IF NOT EXISTS apiDb;

-- Comando para indicar que se quiere usar esa base de datos
USE apiDb;

-- Crear la tabla usuarios en caso de que no exista con esos atributos
CREATE TABLE IF NOT EXISTS usuarios (
    id INT PRIMARY KEY,
    nombre VARCHAR(100),
    email VARCHAR(100),
    contrasena VARCHAR(100)
);









