const {Schema, model, ObjectId} = require('mongoose')

const User = new Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true, unique: true},
    fileCount: {type: Number, default: 9},
    usedCount: {type: Number, default: 0},
    files: [{type: ObjectId, ref: 'File'}]
}) 

module.exports = model('User', User)


