const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const passport = require('passport')
const bcrypt = require('bcrypt');
const User = require('../models/user')

router.post('/login', function(req,res,next){
    passport.authenticate('local',{session:false},(err,user,info)=>{
        if (err || !user) {
            return res.status(400).json({
                msg: info ? info.message : 'Login failed',
                user   : user
            });
        }

        req.login(user,{session:false},(err)=>{
            if(err){
                res.send(err)
            }
            
            let userData = { id:user._id , admin : user.admin, username:user.username }
            const token = jwt.sign(userData,process.env.JWT_SECRET,{expiresIn: 60 * 60 * 120});

            return res.json({token, user});
        });
    })(req, res);
})

router.post('/register', function(req,res,next){

    const newUser = {
    username: req.body.username,
    name: req.body.name,
    email : req.body.email,
    password : req.body.password,
    }

    User.findOne({username: req.body.username})
            .then(user=>{
                if(!user){
                    User.findOne({email:req.body.email})
                    .then(user=>{
                        if(!user){
                            bcrypt.hash(req.body.password , 10 ,(err, hash)=>{
                                newUser.password = hash
                                User.create(newUser)
                                .then(() => res.json({msg: 'created successfully'}))
                                .catch(err =>res.send(err))
                            })
                        }else{ res.json({msg:'email already used'})}
                    }).catch(err=>res.send(err))
                }else{
                    res.json({msg:'username already exist'})
                }
            }).catch(err=>res.send(err))
    })

    router.get('/user', passport.authenticate('jwt', {session: false}), async (req,res)=>{
        try{
            const user = await User.findOne({username: req.user.username},{profileImg: 1, likes: 1, following: 1, bookmarks: 1, username: 1, retweets: 1, name: 1})
            res.send({success: true, account: user})
            
        }catch(error){
            res.status(500).json({success: false, msg: 'error getting account'})
        }
    })

module.exports = router