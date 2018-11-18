var express = require('express');
var app = express();
var mdAuth = require('../middlewares/auth');
var Medico = require('../models/medico')
var Hospital = require('../models/hospital')

//=============================
// Get de medicos
//=============================
app.get('/', (req, res)=>{
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Medico.find({})
    .skip(desde)
    .limit(5)
    .populate('usuario', 'nombre email')
    .populate('hospital')
    .exec((errors, medicos) => {
        if(errors){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al cargar los medicos.',
                errors
            })
        }
        Medico.count({}, (err, conteo) => {
            return res.status(200).json({
                ok: true,
                medicos,
                total: conteo
            })
        })
       
    })
})
//=============================
// Post de medicos
//=============================
app.post('/' , mdAuth.verificaToken ,(req, res)=>{
    var body = req.body;
    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario.usuario._id,
        hospital: body.hospital
    })
    Hospital.findById(body.hospital, (errors, hospital)=>{
        if(errors){
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al buscar el hospital, asegurate de usar el ID adecuado',
                errors
            })
        }
        if(!hospital){
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese ID',
                errors
            })
        }

        medico.save((errors, medicoGuardado)=>{
            if(errors){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al crear el medico',
                    errors
                })
            }
            return res.status(201).json({
                ok: true,
                medico: medicoGuardado
            })
        })
    })
})

//=============================
// Put de Medicos
//=============================

app.put('/:id', mdAuth.verificaToken, (req, res) => {
    var body = req.body;
    var id = req.params.id;
    Medico.findByIdAndUpdate(id, {nombre: body.nombre, hospital: body.hospital}, {new: true}, (errors, medicoGuardado) => {
        if(errors){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar a ese medico',
                errors
            })
        }
        if(!medicoGuardado){
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese ID'
            })
        }
        return res.status(200).json({
            ok: true,
            medico: medicoGuardado
        })
    })
})

//=============================
// Delete de Medicos
//=============================

app.delete('/:id', mdAuth.verificaToken, (req, res)=>{
    var id = req.param.id;
    Medico.findOneAndRemove(id, (errors, medicoBorrado)=>{
        if(errors){
            return res.status(500).json({
                ok: false,
                errors,
                mensaje: 'Error al borrar el medico'
            })
        }
        if(!medicoBorrado){
            return res.status(400).json({
                ok: false,
                errors:{
                    message: 'No existe un medico con ese id.'
                },
                mensaje: `No existe un medico con el ID: ${id}`
            })
        }
        return res.status(200).json({
            ok: true,
            medico: medicoBorrado
        })
    })
})
module.exports = app;