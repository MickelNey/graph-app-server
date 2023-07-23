const {Schema, model, ObjectId} = require('mongoose')

const Clusterboard = new Schema({
    data: {type: Array, required: true},
    name: {type: String, required: true},
    user: {type: ObjectId, ref: 'User'}
}) 

module.exports = model('Clusterboard', Clusterboard)


