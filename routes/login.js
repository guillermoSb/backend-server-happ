var express = require('express');
var bcrypt = require('bcryptjs');
var app = express();
var Usuario = require('../models/usuario')
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

var CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
//google
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

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



//=============================
// Login de Google
//=============================

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        google: true,
        email: payload.email,
        img: payload.picture
    }
}
  

app.post('/google', async(req, res) => {
    var token = req.body.token;
    var googleUser = await verify(token)
                    .catch(e => {
                        return res.status(403).json({
                            ok: false,
                            mensaje: 'Token no valido'
                        })
                    })
    Usuario.findOne({email: googleUser.email}, (errors, usuarioDB) => {
        if(errors) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar Usuario',
                errors
            })
        }
        if(usuarioDB) {
            if(usuarioDB.google = false) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Debe usar su autenticacion normal.',
                    
                }) 
            } else {
                usuarioDB.password = ':)';
                usuarioDB.google = true;
                var token = jwt.sign({usuario: usuarioDB}, SEED, {expiresIn: 14400})
                return res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token,
                    id: usuarioDB.id
            
                });
            }
        } else {
            var usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.img = googleUser.img;
            usuario.email = googleUser.email;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioDB) => {
                if(err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al guardar el usuario.',
                        errors: err
                        
                    }) 
                }
                var token = jwt.sign({usuario: usuarioDB}, SEED, {expiresIn: 14400})
                return res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token,
                    id: usuarioDB.id
            
                });
            })
        }
    })
    
})
module.exports = app;