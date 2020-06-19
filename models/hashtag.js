const mongoose = require('mongoose')
const Schema = mongoose.Schema

const HashtagSchema = new Schema({
    content:{
        required: true,
        type:String
    },
    count: {
        type:Number,
        default: 0
    },
    tweets:[{
        type: Schema.Types.ObjectId,
        ref: 'Tweet'
    }]
},{timestamps: true})

const Hashtag = mongoose.model('Hashtag',HashtagSchema)
module.exports = Hashtag