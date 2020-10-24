const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    username: {
        type:String,
        required: true,
        unique: true
    },
    favoriteGenre: String

})

module.exports = mongoose.model('User', schema)