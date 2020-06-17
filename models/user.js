const mongoose = require('mongoose')
const Schema = mongoose.Schema


const userSchema = new Schema({
    username:{
        default: "",
        required: true,
        unique: true,
        type: String
    },
    name:{
        default: "",
        required: true,
        type: String
    },
    email:{
        required: true,
        type: String,
        unique: true
    },
    password:{
        required: true,
        type: String,
    },
    description:{
        default: "",
        required: false , 
        type: String
    },
    profileImg:{
        default: "https://i.imgur.com/iV7Sdgm.jpg",
        required: false , 
        type: String
    },
    banner:{
        default: "https://i.imgur.com/CAFy1oY.jpg",
        required: false,
        type: String
    },
    location:{
        default: "",
        required: false , 
        type: String
    },
    following:[{ 
        type:Schema.Types.ObjectId,
        ref:'User'
    }],
    followers:[{ 
        type:Schema.Types.ObjectId,
        ref:'User'
    }],
    tweets:[{ 
        type:Schema.Types.ObjectId,
        ref:'Tweet'
    }],
    retweets:[{ 
        type:Schema.Types.ObjectId,
        ref:'Tweet'
    }],
    likes:[{ 
        type:Schema.Types.ObjectId,
        ref:'Tweet'
    }],
    bookmarks:[{
        type:Schema.Types.ObjectId,
        ref:'Tweet'
    }],
    lists:[{
        type:Schema.Types.ObjectId,
        ref:'Tweet'
    }],
    notifications:{
        required: false,
        default: [],
        type: Array
    }

},{timestamps: true},)

const User = mongoose.model('User',userSchema)
module.exports = User