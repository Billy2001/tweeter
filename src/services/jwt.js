'use strict'

var jwt = require("jwt-simple")
var moment = require("moment")
var secret = 'clave_secreta'

exports.createToken= function(cuenta){
    var payload={
        sub: cuenta._id,
        nombre: cuenta.nombre,
        apodo: cuenta.apodo,
        iat: moment().unix(),
        exp: moment().day(30,'day').unix()
    }
    return jwt.encode(payload,secret)
}