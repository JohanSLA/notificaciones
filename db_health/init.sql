-- crea la base de datos en caso de no existir con el nombre servicesHealth
CREATE DATABASE IF NOT EXISTS servicesHealth;

-- Comando para indicar que se quiere usar esa base de datos
USE servicesHealth;

-- Crear la tabla services_register en caso de que no exista con esos atributos
CREATE TABLE IF NOT EXISTS services_register (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    endpoint VARCHAR(200) NOT NULL,
    frequency INT NOT NULL,
    emails VARCHAR(100) NOT NULL
);