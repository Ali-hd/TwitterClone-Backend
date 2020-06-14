const express = require('express')
const router = express.Router()
const passport = require('passport')
const jwt = require('jsonwebtoken')
const Tweet = require('../models/tweet')
const User = require('../models/user')

const upload = require('../imgUpload')
const singleUpload = upload.single('image')

router.post('/upload', function(req,res){
    singleUpload(req,res, function(err){
        if(err){
            res.status(422).send({error:err.message})
        }else{
            return res.json({'imageUrl':req.file.location});
        }
    });  
});

router.post('/create', passport.authenticate('jwt', {session: false}),( async (req,res) =>{
 
    const newTweet = {
        description: req.body.description,
        images: req.body.images,
        user: req.user._id,
    }
    try{
        let user = await User.findById(req.user._id)
        let tweet = await Tweet.create(newTweet)
        user.tweets.unshift(tweet)
        user.save()
        res.json({msg:'tweet created successfully'})
    }catch(err){
        console.log(err)
        res.status(400).json({msg:'error creating tweet'})
    }
        
})
)

router.post('/:id/like', passport.authenticate('jwt', {session: false}), async(req,res)=>{
    
    try{
        let user = await User.findById(req.user._id)
        if(user.likes.includes(req.params.id)){
            var index = user.likes.indexOf(req.params.id);
            if (index !== -1){ user.likes.splice(index, 1) }
            let tweet = await Tweet.findById(req.params.id)
            tweet.likes = tweet.likes - 1
            user.save()
            tweet.save()
            res.send({msg: 'unliked'})
        }else{
            let tweet = await Tweet.findById(req.params.id)
            tweet.likes = tweet.likes + 1
            user.liked.unshift(tweet)
            user.save()
            tweet.save()
            res.send({success: true, msg: 'liked'})
        }
    }catch(error){
        console.error(error);
        res.status(400).json({msg:'error'})
    }
})