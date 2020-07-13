'use strict'
var Twitter = require('../models/modeltwit')
var bcrypt = require('bcrypt-nodejs')
var jwt = require('../services/jwt');
const { idUser } = require('../middleware/authenticated');


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

let AgregarTweet = (tweet,req,res) =>{
    var params= req.body;
    var tweet =JSON.parse(params.tweet)
     
        Twitter.findById({_id:req.user.sub},(err,newTweet)=>{
            if(err) res.status(500).send({message:'error a la horada de la ejecución'})
            if(!newTweet){res.status(404).send({message:'error en buscar un usuario'})} 
            if(newTweet){
                Twitter.findByIdAndUpdate(req.user.sub,{$push:{tweets:{ descripcion:tweet}}},(err,usuaro)=>{
                    if(err) return res.status(500).send({message:'error a la horada de la ejecución'})
                    if(!usuaro){return res.status(404).send({message:'error en publicar tweet'})} 
                    if(usuaro){res.status(200).send({tweet})}
                })
            }
        })
} 

let UpdateTweet=(tweet,req,res)=>{
    var params= req.body;
    Twitter.findById({_id:req.user.sub},(err,updateTweet)=>{
        console.log(updateTweet)
        if(err) return res.status(500).send({message:'error a la hora de la ejecución'})
        if(!updateTweet){
            return res.status(404).send({message:'error en buscar user'})
        }else{
            Twitter.findByIdAndUpdate(req.user.sub,{$set:{tweets:{descripcion:tweet}}},(err,modificado)=>{
                if(err) return res.status(500).send({message:'error en la ejecución'})
                if(!modificado){
                    return res.status(404).send({message:'error al modificar Tweet'})
                }else{
                    return res.status(200).send({tweet})
                }
            })
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

module.exports = {
    crearCuenta,
    AgregarTweet,
    login,
    UpdateTweet,
    view_tweets
    
} 