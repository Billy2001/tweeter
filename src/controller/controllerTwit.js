'use strict'
var Twitter = require('../models/modeltwit')
var bcrypt = require('bcrypt-nodejs')
var jwt = require('../services/jwt');
const { idUser } = require('../middleware/authenticated');
const { findOne } = require('../models/modeltwit');


function crearCuenta(nombre,usuario,password, res) {
    var cuenta = new Twitter();

    if (nombre,usuario,password){
        cuenta.nombre = nombre;
        cuenta.apodo = usuario;
        Twitter.find({$or: [{usuario: cuenta.apodo},{nombre:cuenta.nombre}]}).exec((err,usuario) => {
            if (err) return res.status(500).send({ message: 'Error en la peticion' })
            if (usuario && usuario.length >= 1) {
                return res.status(500).send({ message: 'El empleado ya esta registrado' })
            } else {
                bcrypt.hash(password, null, null, (err, hash) => {
                    cuenta.password = hash;
                })
            }
            cuenta.save((err, cuentaGuardada) => {
                if (err) return res.status(500).send({ message: 'Error al guardar el empleado' })
                if (cuentaGuardada) {
                    return res.status(200).send({ cuentaGuardada })
                } else {
                    return res.status(404).send({ message: 'No se pudo guardar el empleado' })
                }
            })
        })
    } else {
        return res.status(200).send({ message: 'Rellene todos los campos' })
    }
}
 let login = (apodo,password,token,req,res) => {

    Twitter.findOne({apodo},(err,cuenta)=>{
        if(err){return res.status(500).send({message:'Error en su petición'})}
        if(cuenta){
            bcrypt.compare(password,cuenta.password,(err,listo)=>{
                if(err){
                    return res.status(400).send({message:'contraseña inconrrecta'})
                }else if (listo){
                    if(token = true){
                        return res.status(200).send({token:jwt.createToken(cuenta)});
                    }else{
                        cuenta.password=undefined;
                    }
                }else{
                    res.send({message:'Error en la contraseña',password})
                }
            })
        }else{
            res.send({message:'Error en el usuario,Aqui',apodo})
        }
    })
}

let AgregarTweet=(tweet,req,res)=>{
    Twitter.findById({_id:req.user.sub},(err,newTweet)=>{
        if(err) return res.status(500).send({message:'Error en la petición'})
        if(newTweet){
            Twitter.findByIdAndUpdate(req.user.sub,{$push:{tweets:{descripcion:tweet}}},(err,usuario)=>{
                if(err) return res.status(500).send({message:'Eror en la ejecución'})
                if(usuario){
                    return res.status(200).send({tweet})
                }else{
                    return res.status(404).send({message:'error al publicar tweet'})
                }
            })
        }else{
            return res.status(404).send({message:'Error al buscar el usuario'})
        }
    })
}

let view_tweets =(req,res)=>{
    Twitter.find({_id:req.user.sub},{"tweets":1,"apodo":1,"_id":0},(err,tweets)=>{
        if(err){return res.status(500).send({message:'Error en la petición'})}
        if(!tweets){
            return res.status(404).send({message:'Error en la petición'})
            
        }else{
            return res.status(200).send({tweets})
        }
    })
}
let EliminarTweet = (IdTweet, req, res) =>{
    Twitter.findById(req.user.sub, (err, apodo) => {

        if(err){
            res.status(500).send({message:'No se pudo realizar la petición'})
        }
        if (apodo) {
            Twitter.findOneAndUpdate({ 'tweets._id': IdTweet }, { $pull: { tweets: { _id: IdTweet } } }, { new: true }, (err, Eliminar) => {
                if (err) res.status(500).send({ message: 'Error en la petición' })                
                if (Eliminar) {
                    res.status(200).send({ Eliminar })
                }else{
                    return res.status(404).send({message:'Tweet no encontrado'})
                }
            })
        }else{
            return res.status(404).send({message:'Usuario no encontrado'})
        }
    })
}
let UpdateTweet = (IdTweet,descripcion,req,res) =>{
    
    Twitter.findById(req.user.sub,(err,apodo)=>{
        if(err){
            return res.status(500).send({message:'No se pudo encontrar el usuario'})
        }
        if(apodo){
            Twitter.findOneAndUpdate({'tweets._id':IdTweet},{'tweets.$.descripcion':descripcion},{new:true},(err,actualizar)=>{    
                if(err) res.status(500).send({message:'Error de petición'})     
                if(!actualizar) res.status(404).send({message:'Error general'})
                  
                if(actualizar){return res.status(200).send({actualizar})}
              
            })
        }else{  
            return res.status(404).send({message:'Usuario no encontrado'})
        }
    })
}  

module.exports = {
    crearCuenta,
    AgregarTweet,
    login,
    view_tweets,
    UpdateTweet,
    EliminarTweet
}

/**
 * sile(0,1)
 * join() Agregar va 
 */
