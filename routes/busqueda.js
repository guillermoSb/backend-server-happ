var express = require('express');
var app = express();
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');



//=============================
// Busqueda por coleccion
//=============================
app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {
    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');
    if(tabla === 'hospital') {
        console.log('TABLA DE HOSPITALES')
        return buscarHospitales(busqueda, regex).then(hospitales => {
            return res.status(200).json({
                ok : true,
                hospitales
            })
        })
        .catch(error => {
            return res.status(400).json({
                error
            })
        })
    }
    if(tabla === 'medico') {
        return buscarMedicos(busqueda, regex).then(medicos => {
            res.status(200).json({
                ok : true,
                medicos
            })
        })
        .catch(error => {
            return res.status(400).json({
                error
            })
        })
    }
    if(tabla === 'usuario') {
        return buscarUsuarios(busqueda, regex).then(usuarios => {
            res.status(200).json({
                ok : true,
                usuarios
            })
        })
        .catch(error => {
            return res.status(400).json({
                error
            })
        })
    }
    return res.status(400).json({
        ok: false,
        mensaje: 'Los unicos campos de busqueda son hospital, medico, usuario.',
        errors: {
            mensaje: 'Tipo de busqueda no valido.'
        }
    })
    // Para agilizar esta cosa, se pudo haber usado un switch con propiedades computadas de objetos [tablas]

});

//=============================
// Busqueda en todo
//=============================

app.get('/todo/:busqueda', (req, res, next) => {
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');
    Promise.all([
        buscarHospitales(busqueda, regex), 
        buscarMedicos(busqueda,regex),
        buscarUsuarios(busqueda, regex)
        ])
        .then(respuestas=>{
            res.status(200).json({
                ok : true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            })
        })
   
});

function buscarHospitales(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({nombre: regex})
        .populate('usuario', 'nombre email')
        .exec((err, hospitales) => {
            if (err) {
                console.log(err);
                reject('Error al cargar hospitales');
            }else{
                resolve(hospitales);
            }
        })

    })
}
function buscarMedicos(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Medico.find({nombre: regex})
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {
            if (err) {
                reject('Error al cargar medicos');
            }else{
                resolve(medicos);
            }
        })

    })
}
function buscarUsuarios(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, '')
            .or([{'nombre': regex}, {'email': regex}])
            .exec( (err, usuarios) => {
                if(err) {
                    reject('Error al cargar usuarios');

                }else{
                    resolve(usuarios)
                }

            })

    })
}
module.exports = app;