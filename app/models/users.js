'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
    name:{ type: String},
    cnic:{type: Number},
    polls:{type:[String]}
});

module.exports = mongoose.model('User', User);
