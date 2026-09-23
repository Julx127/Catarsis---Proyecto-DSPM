const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();
require('./db'); 

const app = express();
app.use(cors());
app.use(express.json());



// importar rutas
const rutasEtiquetas = require('./rutas/etiquetas');
app.use('/etiquetas', rutasEtiquetas);

const rutasInteracciones_obras = require('./rutas/interacciones_obras');
app.use('/interacciones_obras', rutasInteracciones_obras);

const rutasInteracciones_posteos = require('./rutas/interacciones_posteos');
app.use('/interacciones_posteos', rutasInteracciones_posteos);

const rutasObras = require('./rutas/obras');
app.use('/obras', rutasObras);

const rutasPosteos_etiquetas = require('./rutas/posteos_etiquetas');
app.use('/posteos_etiquetas', rutasPosteos_etiquetas);

const rutasPosteos = require('./rutas/posteos');
app.use('/posteos', rutasPosteos);

const rutasProducciones = require('./rutas/producciones');
app.use('/producciones', rutasProducciones);

const rutasResenias = require('./rutas/resenias');
app.use('/resenias', rutasResenias);

const rutasUsuarios = require('./rutas/usuarios');
app.use('/usuarios', rutasUsuarios);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
