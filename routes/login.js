var express = require('express');
var bcrypt = require('bcryptjs');
var app = express();
var Usuario = require('../models/usuario')
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;
//=============================
// Login del usuario
//=============================
app.post('/', (req, res)=>{
    var body = req.body;
    Usuario.findOne({email: body.email}, (errors, usuarioDB) => {
        if(errors){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar Usuario',
                errors
            })
        }
        if(!usuarioDB){
            return res.status(500).json({
                ok: false,
                mensaje: 'Credenciales Incorrectas - email',
                errors
            })
        }
        if(!bcrypt.compareSync(body.password, usuarioDB.password)){
            return res.status(500).json({
                ok: false,
                mensaje: 'Credenciales Incorrectas - password',
                errors
            })
        }
        //Crear un token
        usuarioDB.password = ':)';
        var token = jwt.sign({usuario: usuarioDB}, SEED, {expiresIn: 14400})
        return res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token,
            id: usuarioDB.id
            
        })
    });
});
module.exports = app;