require('dotenv').config();
const express = require("express")
const app = express()
const mongoose = require("mongoose")
const cors = require('cors')
const passport = require('passport')
const methodOverride = require('method-override') 
require('./passport');

var authRout = require('./routes/auth')
var userRout = require('./routes/user')
var tweetRout = require('./routes/tweet')

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.set('trust proxy', true)
app.use(cors())
app.use(passport.initialize())

mongoose.set('useCreateIndex', true)
app.use(methodOverride('_method'))

app.get('/',async(req, res) =>{
    res.json("hello twitter")
   });

app.use('/auth',authRout)
app.use('/tweet',tweetRout)
app.use('/user', userRout)


const connect = mongoose.connect(
    process.env.DB_AUTH, {useNewUrlParser:true, useUnifiedTopology: true})
.then(console.log('MongoDB Connected!'))
.catch(err=>console.log(err))

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`server is running on port ${PORT}`))

module.exports = app;