'use strict'
var Twitter = require('../models/modeltwit')
var bcrypt = require('bcrypt-nodejs')
var jwt = require('../services/jwt');
const { idUser, apodo } = require('../middleware/authenticated');
const { findOne, findOneAndDelete, findById } = require('../models/modeltwit');
const api = require('../routes/twittRoutes');


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

let view_tweets =(apodo,req,res)=>{
    Twitter.find({'apodo':apodo},{'tweets':1,'_id':0},(err,verTweets)=>{
        if(err){
            return res.status(500).send({message:'Error en la petición'})
        }
        if(verTweets){
            return res.status(200).send({verTweets})
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
            return res.status(500).send({message:'Error en la petición de buscar usuario'})
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
let folow =(seguidos,req,res)=>{
    Twitter.findById(req.user.sub,(err,apodo)=>{
        
        if(err){
            return res.status(500).send({message:'error en la petición al encontrar el usuario'})
        }

        if(apodo){
            Twitter.findByIdAndUpdate(req.user.sub,{$push:{follow:{seguidos}}},(err,seguidor)=>{
                if(err){
                    return res.status(500).send({message:'No se pudo realizar la operación'})
                }
                if(seguidor){
                    Twitter.findOneAndUpdate({'apodo':seguidos},{$push:{follower:{seguidores:req.user.apodo}}},(err,seguido)=>{
                        if(err){
                            return res.status(500).send({message:'Error al intentar seguir al usuario'})
                        }
                        if(seguido){
                            return res.status(200).send({seguido})
                        }

                    })
                }else{
                    return res.status(404).send({message:'no se pudo guardar el usuario'},{seguidos})
                }
            })
        }else{
            return res.status(404).send({message:'no se pudo encontrar el usuario'},{seguidos})
        }
    })
}
let unfollow=(dejarDeSeguir,req,res)=>{
    Twitter.findById(req.user.sub,(err,apodo)=>{
        if(err){
            return res.status(500).send({message:'No se pudo realizar la operación'})
        }
        if(apodo){
            Twitter.findOneAndUpdate({'follow.seguidos':dejarDeSeguir},{$pull:{follow:{seguidos:dejarDeSeguir}}},{new:true},(err,eliminarSeguidor)=>{
                if(err){
                    return res.status(500).send({message:'No se pudo realizar la petición'})
                }
                if(eliminarSeguidor){
                    Twitter.findOne({'apodo':dejarDeSeguir},(err,eliminarseguido)=>{
                        if(err){
                            return res.status(500).send({message:'No se pudo realizar la busquda del seguido'})
                        }
                        
                        if(eliminarseguido){
                            Twitter.findOneAndUpdate({'follower.seguidores':req.user.apodo},{$pull:{follower:{seguidores:req.user.apodo}}},{new:true},(err,seguidoEliminado)=>{
                                if(err){
                                    return res.status(500).send({message:'No se pudo realizar la accion de eliminar el seguido'})
                                }
                                
                                if(seguidoEliminado){
                                    return res.status(200).send({eliminarseguido})
                                }else{
                                    return res.status(404).send({message:'No se pudo eliminar el seguido'})
                                }
                            })
                        }
                    })
                }else{
                    return res.status(404).send({message:'Nos se pudo dejar de seguir'})
                }
            })
        }else{
            return res.status(404).send({message:'No se pudo encontra el usuario'})
        }
        
    })
}
let profile=(apodo,req,res)=>{
    Twitter.findOne({'apodo':apodo},(err,perfil)=>{
        if(err){
            return res.status(500).send({message:'No se pudo hacer la petición'})
        }
        if(perfil){
            return res.status(200).send({perfil})
        }else{
            return res.status(404).send({message:'No se pudo encontrar el perfil'})
        }
    })
}


let like=(idTweet,req,res)=>{
    let apodo=req.user.apodo;
    let likedado = true;
    Twitter.findOne({'tweets._id':idTweet},(err,existenciaTweet)=>{
        if(err){

            return res.status(500).send({message:'No se pudo realizar la peticion'})
        }
            
        if(existenciaTweet){
            Twitter.findOne({'_id':req.user.sub},{follow:{$elemMatch:{seguidos:existenciaTweet.apodo}}},(err,comproFollow)=>{
                if(err){
                    return res.status(500).send({message:'Error en la petición'})
                }else if (comproFollow.follow.length === 0) 
                    { return res.status(404).send({ message:'Solo seguidores pueden darle like a este tweet'}) 
                } else if (comproFollow.follow.length === 1) {  
                    Twitter.findOne({'tweets._id':idTweet},(err,tweetEncontrado)=>{
                        if(err){
                            return res.status(500).send({message:'No se pudo realizr'})
                        }
                        if(tweetEncontrado){
                                    Twitter.findOne({'tweets._id':idTweet},{tweets:{$elemMatch:{_id:idTweet}}},{'tweets.$.NameLike':1},(err,listo)=>{
                                        
                                        if(err){
                                            return res.status(500).send({message:'No se pudo realizar la petición'})
                                        }      
                                            for (let x = 0; x < listo.tweets[0].NameLike.length; x++) {
                                                if (listo.tweets[0].NameLike[x] === req.user.apodo) {
                                                    console.log(likedado)
                                                    likedado = false
                                                        Twitter.updateOne({'tweets._id':idTweet},{$inc:{['tweets.$.like']:-1}},(err,listo2)=>{
                                                            if (err) return res.status(500).send({message: 'Error en la petición dada'}) 
                                                            if (!listo2) {
                                                                return res.status(404).send({message: 'Error to send your opinion'})
                                                            }else{
                                                                Twitter.findOneAndUpdate({'tweets._id':idTweet},{$pull:{'tweets.$.NameLike':apodo}},(err,likeDado)=>{
                                                                    if(err){
                                                                        return res.status(500).send({message:'No se pudo realizar la operación'})
                                                                    }
                                                                    return res.status(200).send({like: likeDado})
                                                                })
                                                            }
                                                        })
                                                    
                                                    return res.status(500).send({message: 'A dejado de darle like al tweet'})
                                                }                                                                                                                                                                              
                                            }
                                            if (likedado === true) {
                                                Twitter.updateOne({'tweets._id':idTweet},{$inc:{['tweets.$.like']:1}},(err,listo2)=>{
                                                    console.log(err)
                                                    if (err) return res.status(500).send({message: 'Error en la petición dada'})
                                                    if (!listo2) {
                                                        return res.status(404).send({message: 'Error to send your opinion'})
                                                    }else{
                                                        Twitter.findOneAndUpdate({'tweets._id':idTweet},{$push:{'tweets.$.NameLike':apodo}},(err,likeDado2)=>{
                                                            if(err){
                                                                return res.status(500).send({message:'No se pudo realizar la operación'})
                                                            }
                                                            return res.status(200).send({like: likeDado2})
                                                        })
                                                    }
                                                    
                                                })
                                            }
                                            
                                    })
                                
                                
                            
                        }
                    })
                    
                }                                          
              
            })
        }else{
            return res.status(404).send({message:'Nos se pudo encontrar tweet'})
        }
    })
}
let responderTweet=(IdTweet,Respuesta,req,res)=>{
 
    Twitter.findById(req.user.sub,(err,usuarioEncontrado)=>{
        if(err){
            return res.status(404).send({message:'No se pudo realizar la petición'})
        }
        if(usuarioEncontrado){
            Twitter.findOneAndUpdate({ 'tweets._id': IdTweet },{$push:{'tweets.$.respuestasTweet':Respuesta}},(err,RespuestaIngresada)=>{
                if(err){
                    return res.status(404).send({message:'No se pudo realizar la petición'})
                }
                if(RespuestaIngresada){
                    return res.status(200).send({usuarioEncontrado})
                }
            })
        }
    })
}



module.exports = {
    crearCuenta,
    AgregarTweet,
    login,
    view_tweets,
    UpdateTweet,
    EliminarTweet,
    folow,
    unfollow,
    profile,
    like,
    responderTweet,
    
}

