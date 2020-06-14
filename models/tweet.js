const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tweetSchema = new Schema({
    description:{
        required: true,
        default: "",
        type:String
    },
    images:{
        required: true,
        default: [],
        type: Array
    },
    likes:[{
        type: Schema.Types.ObjectId,
        ref: 'Likes'
    }],
    parent:[{
        type: Schema.Types.ObjectId,
        ref: 'Reply'
    }],
    retweets:[{
        type: Schema.Types.ObjectId,
        ref: 'Retweets'
    }],
    comments:[{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    user:{
        required: true,
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
},{timestamps: true})

const Tweet = mongoose.model('Tweet',tweetSchema)
module.exports = Tweet