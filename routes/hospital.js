var express = require('express');
var app = express();
var mdAuth = require('../middlewares/auth');
var mongoose= require('mongoose');
var Hospital = require('../models/hospital')

//=============================
// Get de hospitales
//=============================
app.get('/' ,(req, res)=>{
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Hospital.find({}, 'nombre usuario img')
    .populate('usuario', 'nombre email')
    .exec(
        (errors, hospitales) => {
            if(errors){
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error en la base de datos.',
                    errors
                })

            }     
            Hospital.count({}, (err, conteo) => {
                return res.status(200).json({
                    ok: true,
                    hospitales,
                    total: conteo
                })
            })
        }
    )
})
//=============================
// Obtener por ID
//=============================
app.get('/:id',(req, res) => {
    var id = req.params.id;
    Hospital.findById(id)
    .populate('usuario', 'nombre img email')
    .exec((err, hospital) => {
        if(err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }
        if(!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese id',
                errors: {
                    mensaje: 'No se pudo encontrar un hospital con ese id'
                }
            });
        }
        return res.status(200).json({
            ok: true,
            hospital
        })
    })
})
//=============================
// Post de hospitales
//=============================
app.post('/', mdAuth.verificaToken, (req, res) => {
    var body = req.body;
    var usuario = req.usuario
    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: usuario.usuario._id
    });
    hospital.save((errors, hospitalGuardado) => {
        if(errors){
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el hospital.',
                errors
            })
        }
        return res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        })
    });
   
})

//=============================
// Put de hospitales
//=============================
app.put('/:id', mdAuth.verificaToken, (req, res) => {
    var body = req.body;
    var id = req.params.id;
    var usuario = req.usuario

    Hospital.findByIdAndUpdate(id, {nombre: body.nombre, usuario: usuario.usuario._id},{new: true} ,(errors, hospital) =>{
        if(errors){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el hospital.',
                errors
            })
            
        }
        if(!hospital){
            return res.status(400).json({
                ok: false,
                mensaje: `No existe un hospital con el ID: ${id}`,
                errors
            })
        }
        return res.status(200).json({
            ok: true,
            hospital
        })
    })
    
   
});

//=============================
// Delete de hospital
//=============================

app.delete('/:id', mdAuth.verificaToken, (req, res)=>{
    var id = req.param.id;
    Hospital.findOneAndRemove(id, (errors, hospitalBorrado)=>{
        if(errors){
            return res.status(500).json({
                ok: false,
                errors,
                mensaje: 'Error al borrar el hospital'
            })
        }
        if(!hospitalBorrado){
            return res.status(400).json({
                ok: false,
                errors:{
                    message: 'No existe un hospital con ese id.'
                },
                mensaje: `No existe un hospital con el ID: ${id}`
            })
        }
        return res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        })
    })
})


module.exports = app;