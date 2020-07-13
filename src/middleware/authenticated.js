'user strict'
var jwt = require("jwt-simple")
var moment = require("moment")
var secret = 'clave_secreta'

exports.ensureAuth = (req, res, next)=> {
    var params = req.body;
    var Datos = Object.values(params);
    var comand = Datos.toString().split(" ");
    if(!req.headers.authorization) {
    if(comand[0]==='register'){
        next();
    }else if(comand[0]=='login'){
        next();
    }else{
        return res.status(500).send({message:'tien que logearse de primero para realizar esta acción'})
    }
    }else{
        var token = req.headers.authorization.replace(/["']+/g, '');
        try {
            var payload = jwt.decode(token, secret, true);
            var idUser = payload.sub;
            module.exports.idUser = idUser;
            if (payload.exp <= moment().unix()) {
                return res.status(401).send({ message: 'Token expirado' });
            }
        } catch (ex) {
            return res.status(404).send({ message: 'El token no es válido' });
        }
        req.user = payload;
        console.log(payload.apodo);
        next();

    }
}
