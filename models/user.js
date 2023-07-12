const mongoose = require('mongoose');
 const userSchema = new mongoose.Schema({
    name:{
        type: 'string',
    },

    connectionId:{
        type: 'string',
    }

 })

 const user = mongoose.model('user', userSchema);
 module.exports = user;
