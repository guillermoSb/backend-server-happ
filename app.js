// Require - Importar librerias
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
// Init variables

// Importar Rutas

var appRoutes = require('./routes/app');

var app = express();

// Middleware del cors
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS")
    next();
});
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
 

// Conexion a la Db
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', {useNewUrlParser: true} ,(err, res) => {
    if(err) {
        throw err;
    }
    console.log('Base de datos con la app: \x1b[32m%s\x1b[0m', '0NLINE');

});

// Rutas

app.use(require('./routes/index'));


// Escuchar peticiones

app.listen(3000, () => {
    console.log('Express Server corriendo en el puerto 3000: \x1b[32m%s\x1b[0m', '0NLINE');
});

