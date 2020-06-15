const express = require('express')
const router = express.Router()
const passport = require('passport')
const jwt = require('jsonwebtoken')
const Tweet = require('../models/tweet')
const User = require('../models/user')

const upload = require('../imgUpload')
const singleUpload = upload.single('image')

router.post('/upload', function(req,res){
    console.log('upload', req.body)
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
            var index2 = tweet.likes.indexOf(req.user._id)
            if (index2 !== -1){ tweet.likes.splice(index2, 1) }
            user.save()
            tweet.save()
            res.send({msg: 'unliked'})
        }else{
            let tweet = await Tweet.findById(req.params.id)
            tweet.likes.push(req.user._id)
            user.likes.unshift(tweet)
            user.save()
            tweet.save()
            res.send({success: true, msg: 'liked'})
        }
    }catch(error){
        console.error(error);
        res.status(400).json({msg:'error'})
    }
})

router.post('/:id/bookmark', passport.authenticate('jwt', {session: false}), async(req,res)=>{
    
    try{
        let user = await User.findById(req.user._id)
        if(user.bookmarks.includes(req.params.id)){
            var index = user.bookmarks.indexOf(req.params.id);
            if (index !== -1){ user.bookmarks.splice(index, 1) }
            user.save()
            res.send({msg: 'removed from bookmarks'})
        }else{
            user.bookmarks.unshift(req.params.id)
            user.save()
            res.send({success: true, msg: 'bookmarked'})
        }
    }catch(error){
        console.error(error);
        res.status(500).json({msg:'unknown server error'})
    }
})

router.get('/', async(req, res)=>{
    try{
        let tweets = await Tweet.find().populate('user','username name _id profileImg').sort({ _id: -1 })
        res.send({success: true, tweets})
    }catch{
        res.send({success: false, msg:'unknown server error'})
    }
})

router.get('/:id', async(req,res)=>{
    try{
        const tweet = await Tweet.findById(req.params.id).populate()
        tweet.save()
        res.send({success: true , tweet})
    }catch{
        res.send({success: false, msg:'unknown server error'})
    }
})

module.exports = router