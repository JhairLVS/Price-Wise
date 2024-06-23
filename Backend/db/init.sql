CREATE DATABASE IF NOT EXISTS price_wise_db;

USE price_wise_db;

CREATE TABLE IF NOT EXISTS usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS promociones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    link TEXT NOT NULL,
    image TEXT NOT NULL,
    store VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS cuadro_comparativo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    link TEXT NOT NULL,
    image TEXT NOT NULL,
    store VARCHAR(255) NOT NULL
    FOREIGN KEY (product_id) REFERENCES promociones(id)
);

CREATE TABLE IF NOT EXISTS precio_final (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    link TEXT NOT NULL,
    image TEXT NOT NULL,
    store VARCHAR(255) NOT NULL
    FOREIGN KEY (product_id) REFERENCES promociones(id)
);
