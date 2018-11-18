var express = require('express');
var fileupload = require('express-fileupload');
var app = express();
var fs = require('fs');

// Middleware
app.use(fileupload());

//Models
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

//=============================
// Upload de imagenes
//=============================

app.put('/:tipo/:id', (req, res, next) => {
    var tipo = req.params.tipo;
    var id = req.params.id;
    //tipos de coleccion
    var tipos = ['hospital', 'medico', 'usuario'];
    if(tipos.indexOf(tipo) < 0 ){
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo no valido.',
            errors: {
                mensaje: 'Solo puede subir hospital, medico, usuario.'
            }
        });
    }
    if(!req.files){
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada.',
            errors: {
                mensaje: 'No selecciono ni una imagen.'
            }
        });
    }
    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extencionArchivo = nombreCortado[nombreCortado.length - 1];
    // solo estas extenciones aceptamos
    var extencionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    if(extencionesValidas.indexOf(extencionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extencion no valida.',
            errors: {
                mensaje: 'Los archivos validos son jpg, png, gif, jpeg.'
            }
        });
    }
    // Nombre del archivo personalizado
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extencionArchivo}`;
    // Mover el archivo a un path.
    var path = `./uploads/${tipo}/${nombreArchivo}`;
    archivo.mv(path, err => {
        if(err){

            return res.status(400).json({
                ok: false,
                mensaje: 'Error al mover el archivo.',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);
    })
    
});


function subirPorTipo(tipo, id, nombreArchivo, res){
    if(tipo === 'usuario') {
        Usuario.findById(id, (err, usuario) => {
            if(err) {
                
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al buscar usuario',
                    errors: err
                })
            }
            if (!usuario) {
                var pathUnlink = './uploads/usuario/' + nombreArchivo;
                fs.unlink(pathUnlink);
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al buscar usuario.',
                    errors: {
                        mensaje: 'No existe ese usuario.'
                    }
                }) 
            }
            var pathViejo = './uploads/usuario/' + usuario.img;
            if(fs.existsSync(pathViejo)){
                fs.unlink(pathViejo);
            }
            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {
                if(err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar usuario',
                        errors: err
                    })
                }
                usuario.password = ":)"
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen del usuario actualizada',
                    usuario: usuarioActualizado
                });
            });
        });
    }
    if(tipo === 'medico') {
        Medico.findById(id, (err, medico) => {
            if(err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al buscar medico',
                    errors: err
                })
            }
            if (!medico) {
                var pathUnlink = './uploads/medico/' + nombreArchivo;
                fs.unlink(pathUnlink);
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al buscar medico.',
                    errors: {
                        mensaje: 'No existe ese medico.'
                    }
                }) 
            }
            var pathViejo = './uploads/medico/' + medico.img;
            if(fs.existsSync(pathViejo)){
                fs.unlink(pathViejo);
            }
            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {
                if(err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar medico',
                        errors: err
                    })
                }
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen del medico actualizada',
                    medico: medicoActualizado
                });
            });
        });
    }
    if(tipo === 'hospital') {
        Hospital.findById(id, (err, hospital) => {
            if(err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al buscar hospital',
                    errors: err
                })
            }
            if (!hospital) {
                var pathUnlink = './uploads/hospital/' + nombreArchivo;
                fs.unlink(pathUnlink);
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al buscar hospital.',
                    errors: {
                        mensaje: 'No existe ese hospital.'
                    }
                }) 
            }
            var pathViejo = './uploads/hospital/' + hospital.img;
            if(fs.existsSync(pathViejo)){
                fs.unlink(pathViejo);
            }
            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {
                if(err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar hospital',
                        errors: err
                    })
                }
                
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen del hospital actualizada',
                    hospital: hospitalActualizado
                });
            });
        });
    }

}

module.exports = app;