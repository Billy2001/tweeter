'use strict'
var mongoose = require('mongoose')
var Schema= mongoose.Schema;

var TwitterSchema =Schema({
    nombre:String,
    apodo:String,
    password:String,
    tweets:[
        {
            descripcion:{type:String,require:true}
        }
    ],
    follow:[
        {
            seguidos:{type:String,require:true}
        }
    ],
    follower:[
        {
            seguidores:{type:String,require:true}
        }
    ]
})
module.exports=mongoose.model('twitter',TwitterSchema);