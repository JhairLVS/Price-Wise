const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const scraper = require('./scraper');

const app = express();
const port = 8080;

// Crear una pool de conexiones a la base de datos
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pricewise'
});

// Middleware para servir archivos estáticos y parsear JSON
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta para manejar las solicitudes de búsqueda
app.post('/search', async (req, res) => {
    const { query, site } = req.body;
    console.log(`Received search query: ${query} for site: ${site}`);
    try {
        const results = await scraper.scrapeAll(query);
        console.log('Scraping results:', results);

        // Guardar los resultados en la base de datos
        for (let result of results) {
            await pool.query(
                'INSERT INTO productos (Producto, Precio, Tienda, Link, Imagen, Fecha) VALUES (?, ?, ?, ?, ?, ?)',
                [result.title, result.price, result.store, result.link, result.image, new Date()]
            );
        }

        res.json(results);

    } catch (error) {
        console.error('Error during scraping:', error);
        res.status(500).send('An error occurred during scraping.');
    }
});

// Ruta para manejar la comparación de precios
app.post('/compare-prices', async (req, res) => {
    const { query, excludeStore } = req.body;
    console.log(`Comparing prices for query: ${query}, excluding store: ${excludeStore}`);
    try {
        const results = await scraper.scrapeAll(query);
        const comparisons = results.filter(item => item.store !== excludeStore);
        console.log('Price comparison results:', comparisons);

        res.json(comparisons);
    } catch (error) {
        console.error('Error during price comparison:', error);
        res.status(500).send('An error occurred during price comparison.');
    }
});

// Ruta para manejar el registro de usuarios
app.post('/registro', async (req, res) => {
    const { username, email, password, telefono } = req.body;

    try {
        // Verificar si el nombre de usuario ya está en uso
        const [existingUsers] = await pool.query('SELECT * FROM usuarios WHERE username = ?', [username]);
        if (existingUsers.length > 0) {
            return res.status(400).send('El nombre de usuario ya está en uso.');
        }

        // Verificar si el correo electrónico ya está en uso
        const [existingEmails] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (existingEmails.length > 0) {
            return res.status(400).send('El correo electrónico ya está registrado.');
        }

        // Encriptar la contraseña antes de guardarla en la base de datos
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar el nuevo usuario en la base de datos
        const sql = 'INSERT INTO usuarios (username, email, password, telefono) VALUES (?, ?, ?, ?)';
        await pool.query(sql, [username, email, hashedPassword, telefono]);

        res.redirect('/inicio-sesion'); // Redirigir al usuario a la página de inicio de sesión
    } catch (error) {
        console.error('Error durante el registro:', error);
        res.status(500).send('Error durante el registro.');
    }
});

// Ruta para manejar el inicio de sesión
app.post('/inicio-sesion', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Obtener el usuario de la base de datos por nombre de usuario
        const [users] = await pool.query('SELECT * FROM usuarios WHERE username = ?', [username]);
        if (users.length === 0) {
            return res.status(404).send('Usuario no encontrado.');
        }

        // Verificar la contraseña
        const user = users[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).send('Credenciales incorrectas.');
        }

        console.log('Inicio de sesión exitoso');
        res.status(200).send('Inicio de sesión exitoso'); // Inicio de sesión exitoso
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).send('Error al iniciar sesión.');
    }
});

// Ruta para guardar el producto seleccionado en la tabla 'eleccion'
app.post('/guardar-eleccion', async (req, res) => {
    const { title, price, store, link, image } = req.body;
    const fecha = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const sql = `
        INSERT INTO elección (Producto, Precio, Tienda, Link, Imagen, Fecha)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    try {
        await pool.query(sql, [title, price, store, link, image, fecha]);
        console.log('Producto guardado en la tabla de elección');
        res.status(200).send('Producto guardado en la tabla de elección');
    } catch (error) {
        console.error('Error al guardar el producto en la tabla de elección:', error);
        res.status(500).send('Error al guardar el producto en la tabla de elección');
    }
});

// Ruta para guardar el producto más barato en la tabla 'lowest'
app.post('/guardar-precio-bajo', async (req, res) => {
    const { title, price, store, link, image } = req.body;
    const fecha = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const sql = `
        INSERT INTO lowest (Producto, Precio, Tienda, Link, Imagen, Fecha)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    try {
        await pool.query(sql, [title, price, store, link, image, fecha]);
        console.log('Producto más barato guardado en la tabla de lowest');
        res.sendStatus(200);
    } catch (error) {
        console.error('Error al guardar el producto más barato en la tabla de lowest:', error);
        res.status(500).send('Error al guardar el producto más barato en la tabla de lowest');
    }
});

// Ruta para eliminar un producto por ID
app.delete('/productos/:id', async (req, res) => {
    const { id } = req.params;

    const sql = `
        DELETE FROM productos WHERE id = ?
    `;

    try {
        const [result] = await pool.query(sql, [id]);
        if (result.affectedRows === 0) {
            return res.status(404).send('Producto no encontrado.');
        }
        res.sendStatus(200); // Eliminado con éxito
    } catch (error) {
        console.error('Error al eliminar el producto:', error);
        res.status(500).send('Error al eliminar el producto.');
    }
});

// Ruta para actualizar un producto por ID
app.put('/productos/:id', async (req, res) => {
    const { id } = req.params;
    const { Producto, Precio, Tienda, Link, Imagen } = req.body;

    const sql = `
        UPDATE productos
        SET Producto = ?, Precio = ?, Tienda = ?, Link = ?, Imagen = ?
        WHERE id = ?
    `;

    try {
        const [result] = await pool.query(sql, [Producto, Precio, Tienda, Link, Imagen, id]);
        if (result.affectedRows === 0) {
            return res.status(404).send('Producto no encontrado.');
        }
        res.sendStatus(200); // Actualizado con éxito
    } catch (error) {
        console.error('Error al actualizar el producto:', error);
        res.status(500).send('Error al actualizar el producto.');
    }
});

// Ruta para eliminar un usuario por ID
app.delete('/usuarios/:id', async (req, res) => {
    const { id } = req.params;

    const sql = `
        DELETE FROM usuarios WHERE id = ?
    `;

    try {
        const [result] = await pool.query(sql, [id]);
        if (result.affectedRows === 0) {
            return res.status(404).send('Usuario no encontrado.');
        }
        res.sendStatus(200); // Eliminado con éxito
    } catch (error) {
        console.error('Error al eliminar el usuario:', error);
        res.status(500).send('Error al eliminar el usuario.');
    }
});

// Ruta para actualizar un usuario por ID
app.put('/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    const { username, email, telefono } = req.body;

    const sql = `
        UPDATE usuarios
        SET username = ?, email = ?, telefono = ?
        WHERE id = ?
    `;

    try {
        const [result] = await pool.query(sql, [username, email, telefono, id]);
        if (result.affectedRows === 0) {
            return res.status(404).send('Usuario no encontrado.');
        }
        res.sendStatus(200); // Actualizado con éxito
    } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        res.status(500).send('Error al actualizar el usuario.');
    }
});

// Ruta para eliminar una elección por ID
app.delete('/eleccion/:id', async (req, res) => {
    const { id } = req.params;

    const sql = `
        DELETE FROM elección WHERE id = ?
    `;

    try {
        const [result] = await pool.query(sql, [id]);
        if (result.affectedRows === 0) {
            return res.status(404).send('Elección no encontrada.');
        }
        res.sendStatus(200); // Eliminado con éxito
    } catch (error) {
        console.error('Error al eliminar la elección:', error);
        res.status(500).send('Error al eliminar la elección.');
    }
});

// Ruta para actualizar una elección por ID
app.put('/eleccion/:id', async (req, res) => {
    const { id } = req.params;
    const { Producto, Precio, Tienda, Link, Imagen } = req.body;

    const sql = `
        UPDATE elección
        SET Producto = ?, Precio = ?, Tienda = ?, Link = ?, Imagen = ?
        WHERE id = ?
    `;

    try {
        const [result] = await pool.query(sql, [Producto, Precio, Tienda, Link, Imagen, id]);
        if (result.affectedRows === 0) {
            return res.status(404).send('Elección no encontrada.');
        }
        res.sendStatus(200); // Actualizado con éxito
    } catch (error) {
        console.error('Error al actualizar la elección:', error);
        res.status(500).send('Error al actualizar la elección.');
    }
});

// Ruta para eliminar un registro de lowest por ID
app.delete('/lowest/:id', async (req, res) => {
    const { id } = req.params;

    const sql = `
        DELETE FROM lowest WHERE id = ?
    `;

    try {
        const [result] = await pool.query(sql, [id]);
        if (result.affectedRows === 0) {
            return res.status(404).send('Registro no encontrado.');
        }
        res.sendStatus(200); // Eliminado con éxito
    } catch (error) {
        console.error('Error al eliminar el registro:', error);
        res.status(500).send('Error al eliminar el registro.');
    }
});

// Ruta para actualizar un registro de lowest por ID
app.put('/lowest/:id', async (req, res) => {
    const { id } = req.params;
    const { Producto, Precio, Tienda, Link, Imagen } = req.body;

    const sql = `
        UPDATE lowest
        SET Producto = ?, Precio = ?, Tienda = ?, Link = ?, Imagen = ?
        WHERE id = ?
    `;

    try {
        const [result] = await pool.query(sql, [Producto, Precio, Tienda, Link, Imagen, id]);
        if (result.affectedRows === 0) {
            return res.status(404).send('Registro no encontrado.');
        }
        res.sendStatus(200); // Actualizado con éxito
    } catch (error) {
        console.error('Error al actualizar el registro:', error);
        res.status(500).send('Error al actualizar el registro.');
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
