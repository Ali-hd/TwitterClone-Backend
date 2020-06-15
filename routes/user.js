const express = require('express')
const router = express.Router()
const passport = require('passport')
const jwt = require('jsonwebtoken')
const User = require('../models/user')


router.get('/:username', async (req,res)=>{
    let decoded
    //in case token is expired
    try{
        const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : undefined
        decoded = token ? jwt.verify(token, process.env.JWT_SECRET) : {id:null}
    }catch(err){
        // console.log(err)
        decoded = {id:null}
    }
        
    try{
        let user
        if(decoded && decoded.username == req.params.username || decoded && decoded.admin){
            if(req.query.type == 'liked'){
                user = await User.findOne({username:req.params.username},{password:0, posts:0}).populate('likes')
            }else{
                user = await User.findOne({username:req.params.username},{password:0}).populate('posts')
            }
            //if user = null then "user not found"
            res.send({success: true, user})
        }else{
            user = await User.findOne({username:req.params.username},{email:0,password:0}).populate('tweets')
            res.send({success: true, user})
        }
    }catch(err){
        console.log(err)
        res.status(500).json({success: false, msg: 'error finding user'})
    }
})

router.post('/:username/follow', passport.authenticate('jwt', {session: false}), async (req,res)=>{
    try{
        const user = await User.findById(req.user._id)
        const followUser = await User.findOne({username:req.params.username})

        user.following.unshift(followUser)
        user.save()
        followUser.followers.unshift(user)
        followUser.save()

        res.json({success: true, msg:'followed successfully'})
    }catch(error){
        res.status(500).json({success: false, msg: 'error following user'})
    }
})


module.exports = router