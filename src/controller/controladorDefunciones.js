'use strict'
var controllerFunciones= require('./controllerTwit');

module.exports.controlador=(req,res)=>{
    let regex= new RegExp(comandsTotal,'i')
    var params= req.body;
    var num=params.controlador;
    var comandsTotal=params.controlador;
    var array=comandsTotal.split(' ');
    var comandsTotal = array[0].toLowerCase();
    
    
    switch(comandsTotal){
        case 'register':
           controllerFunciones.crearCuenta(array[1],array[2],array[3],res) /* Nombre apodo contraseña */
        break;
        case 'login':
            controllerFunciones.login(array[1],array[2],array[3],req,res) /*apodo contraseña */
        break;
        case 'add_tweet': 
            let a =array.slice(1);
            let b = a.join(' ')
            
            controllerFunciones.AgregarTweet(b,req,res)/* tweet*/
        break;
        case
            'edit_tweet': 
            let c =array.slice(2);
            let e = c.join(' ') 
            controllerFunciones.UpdateTweet(array[1],e,req,res)/*id Tweet */
        break;  
        case 'delete_tweet':
            controllerFunciones.EliminarTweet(array[1],req,res)/*IdTweet */
        break;
        case 'view_tweet':
            controllerFunciones.view_tweets(array[1],req,res)/*Apodo*/
        break; 
        case 'follow':
            controllerFunciones.folow(array[1],req,res)/*Apodo*/
        break;
        case 'unfollow':
            controllerFunciones.unfollow(array[1],req,res)/*Apodo */
        break;
        case 'profile':
            controllerFunciones.profile(array[1],req,res)/*Apodo */
        break;
        case'like':
            
            controllerFunciones.like(array[1],req,res)/*IdTweet */
        break;
        case 'reply_tweet':
            let x =array.slice(2);
            let y = x.join(' ')
            controllerFunciones.responderTweet(array[1],y,req,res)/*IdTweet Respuesta */
        break;
        default:
            res.status(500).send({mesagge:'Error comando'});
    }
}