const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener usuarios
router.get('/', (req, res) => {
    db.query('SELECT * FROM usuarios', (err, results) => {
        if (err) return res.status(500).json(err);

        res.json(results);
    });
});


// Registrar usuario
router.post('/', (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({
            mensaje: 'Todos los campos son obligatorios'
        });
    }
    // Comprobar si ya existe
    const sqlBuscar = `
        SELECT * FROM usuarios
        WHERE username = ? OR email = ?
    `;
    db.query(sqlBuscar, [username, email], (err, results) => {
        if (err) {
            return res.status(500).json({
                mensaje: 'Error al consultar la base de datos',
                error: err
            });
        }

        if (results.length > 0) {
            return res.status(409).json({
                mensaje: 'El nombre de usuario o correo ya está registrado'
            });
        }

        // establecer admin como false e insertar otros datos
        const sqlInsertar = `
            INSERT INTO usuarios (username, email, password, admin)
            VALUES (?, ?, ?, 0)
        `;

        db.query(
            sqlInsertar,
            [username, email, password],
            (err, result) => {
                if (err) {
                    return res.status(500).json({
                        mensaje: 'Error al registrar el usuario',
                        error: err
                    });
                }

                res.status(201).json({
                    mensaje: 'Usuario registrado correctamente',
                    idusuarios: result.insertId
                });
            }
        );
    });
});

// Iniciar sesion
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({
            mensaje: 'Usuario y contraseña son obligatorios'
        });
    }
    const sql = `
        SELECT idusuarios, username, email, password, admin
        FROM usuarios
        WHERE (username = ? OR email = ?)
        AND password = ?
    `;
    db.query(
        sql,
        [username, username, password],
        (err, results) => {
            if (err) {
                return res.status(500).json({
                    mensaje: 'Error al consultar la base de datos'
                });
            }
            if (results.length === 0) {
                return res.status(401).json({
                    mensaje: 'Usuario o contraseña incorrectos'
                });
            }
            const usuario = results[0];
            res.json(usuario);
        }
    );
});
module.exports = router;