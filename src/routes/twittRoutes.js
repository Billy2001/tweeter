'use strict'
var express=require('express')
var controllerTwit=require('../controller/controllerTwit')
var controllerDireccion=require('../controller/controladorDefunciones')
var md_auth=require('../middleware/authenticated')
var api=express.Router()
//Agregar Cuenta
api.post('/RutaUniversal',md_auth.ensureAuth,controllerDireccion.controlador)
module.exports=api;
