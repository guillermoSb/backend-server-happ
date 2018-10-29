// Require - Importar librerias

var express = require('express');
var mongoose = require('mongoose');
// Init variables

var app = express();

// Conexion a la Db
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if(err) {
        throw err;
    }
    console.log('Base de datos con la app: \x1b[32m%s\x1b[0m', '0NLINE');

});

// Rutas

app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente.'
    });
});

// Escuchar peticiones

app.listen(3000, () => {
    console.log('Express Server corriendo en el puerto 3000: \x1b[32m%s\x1b[0m', '0NLINE');
});
