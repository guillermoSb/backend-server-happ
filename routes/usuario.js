var express = require('express');
var bcrypt = require('bcryptjs');
var app = express();
var Usuario = require('../models/usuario')
var mdAuth = require('../middlewares/auth');
//=============================
// Obtener todos los usuarios
//=============================
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Usuario.find({},'id nombre email img role')
        .skip(desde)
        .limit(5)
        .exec(
            (errors, usuarios)=>{
                if (errors) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error en la base de datos.',
                        errors
                    });
                }
                Usuario.count({}, (err, conteo) => {
                    return res.status(200).json({
                        ok: true,
                        usuarios,
                        total: conteo
                    })
                })
            }
        )
    
});

//=============================
// Post de usuarios
//=============================

app.post('/',(req, res, next) => {
    var body = req.body;
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });
    usuario.save((errors, usuario)=>{
        if(errors) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario.',
                errors
            });
        }
        usuario.password = ":)"
        return res.status(201).json({
            ok: true,
            usuario
        })

    });
    
});


//=============================
// Actualizar Usuario
//=============================
app.put('/:id', mdAuth.verificaToken, (req,res) => {
    var id = req.params.id;
    var body = req.body;
    Usuario.findById(id, (errors, usuario) => {
        if(errors) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario.',
                errors
            });
        }
        if(!usuario){
            return res.status(400).json({
                ok: false,
                mensaje: `No existe un usuario con el id: ${id}`,
                errors:{
                    message: 'No exste un usuario con ese ID.'
                }
            });  
            
            
        }
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;
        usuario.save((errors, usuario) => {
            if(errors){
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario.',
                    errors
                });
            }
            usuario.password = ":)"
            return res.status(200).json({
                ok: true,
                usuario
            });
        });
    });
    

});

//=============================
// Borrar Usuario por el ID
//=============================

app.delete('/:id', mdAuth.verificaToken, (req, res)=>{
    var id = req.param.id;
    Usuario.findOneAndRemove(id, (errors, usuarioBorrado)=>{
        if(errors){
            return res.status(500).json({
                ok: false,
                errors,
                mensaje: 'Error al borrar el usuario'
            })
        }
        if(!usuarioBorrado){
            return res.status(400).json({
                ok: false,
                errors:{
                    message: 'No existe un usuario con ese id.'
                },
                mensaje: 'No existe un usuario con ese id'
            })
        }
        return res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        })
    })
})

module.exports = app;