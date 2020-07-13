'use strict'
var controllerFunciones= require('./controllerTwit');
const { AgregarTweet } = require('./controllerTwit');

module.exports.controlador=(req,res)=>{
    
    var params= req.body;
    var num=params.controlador;
    var comandsTotal=params.controlador;
    var array=comandsTotal.split(' ');
    var comandsTotal = array[0].toLowerCase();
    var a, b, c;
    [a, b, c]= [array[1], array[2], array[3]];
    
    switch(comandsTotal){
        case 'register':
           controllerFunciones.crearCuenta(a,b,c,res) /*Ingresar Nombre apodo contraseña */
        break;
        case 'login':
            controllerFunciones.login(a,b,c,req,res) /*apodo contraseña */
        break;
        case 'tweet':
            controllerFunciones.AgregarTweet(array[1],req,res)/* tweet*/
        break;
        case
            'edit':
            controllerFunciones.UpdateTweet(a,req,res)/*new Tweet */
        break;  
        case 'view_tweet':
            controllerFunciones.view_tweets(req,res)/*basio*/
        break;
        default:
            res.status(500).send({mesagge:'Error comando'});
    }
}