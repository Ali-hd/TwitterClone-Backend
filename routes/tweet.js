const express = require('express')
const router = express.Router()
const passport = require('passport')
const jwt = require('jsonwebtoken')
const Tweet = require('../models/tweet')
const User = require('../models/user')

const upload = require('../imgUpload')
const Hashtag = require('../models/hashtag')
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
        parent: req.body.parent ? req.body.parent : null,
        username: req.user.username,
        name: req.user.name
    }

    let hashtags = req.body.hashtags
    
    try{
        let user = await User.findById(req.user._id)
        let tweet = await Tweet.create(newTweet)
        user.tweets.unshift(tweet)
        user.save()
        let parent
        if(req.body.parent){
            parent = await Tweet.findById(req.body.parent).populate('user','username name profileImg')
            parent.replies.unshift(tweet)
            parent.save()
        }

        let hash 
        let newHash
        if(hashtags)
        for(let i=0; i<hashtags.length;i++){
            hash = await Hashtag.findOne({content: hashtags[i]})
            if(!hash){
                newHash = { content: hashtags[i] }
                hash = await Hashtag.create(newHash)
            }
            hash.tweets.unshift(tweet)
            hash.count = hash.count + 1
            hash.save()
        }

        //because mongodb responses are not normal objects
        let popTweet = tweet.toObject()
        popTweet.user = {username: user.username, name: user.name, profileImg: user.profileImg, _id: user._id }
        if(parent){popTweet.parent = parent}
        res.json({success: true, msg:'tweet created successfully', tweet: popTweet})
    }catch(err){
        console.log(err)
        res.status(400).json({success: false, msg:'error creating tweet'})
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
        res.status(500).json({msg:'unknown server error'})
    }
})

router.get('/', async(req, res)=>{
    try{
        let tweets = await Tweet.find().populate('user','username name profileImg').sort({ _id: -1 }).populate({path: 'parent', populate:{path: 'user', select: 'username profileImg name'}}).populate({path: 'retweet', model: 'Tweet', populate:{path: 'user', select: 'username profileImg name'}}).populate({path: 'parent', populate:{path: 'parent', modal: 'Tweet', select: 'username'}})
        res.send({success: true, tweets})
    }catch(err){
        console.log(err)
        res.send({success: false, msg:'unknown server error'})
    }
})

router.get('/:id', async(req,res)=>{
    try{
        const tweet = await Tweet.findById(req.params.id).populate({path:'user', select:'username profileImg name'}).populate({path: 'replies', populate:{path:'user', model:'User', select: 'username profileImg name'}})
        tweet.save()
        res.send({success: true , tweet})
    }catch(err){
        console.log(err)
        res.send({success: false, msg:'unknown server error'})
    }
})

router.post('/:id/retweet', passport.authenticate('jwt', {session: false}), async(req,res)=>{
    
    try{
        let user = await User.findById(req.user._id)
        let tweet = await Tweet.findById(req.params.id)

        if(user.retweets.includes(req.params.id)){
            //delete user tweet retweet
            if(req.body.retweetId){ await Tweet.findOneAndDelete({_id: req.body.retweetId}) }
            await Tweet.findOneAndDelete({retweet: req.params.id})

            //push to retweets just to check in frontend if user retweeted or not
            var index = user.retweets.indexOf(req.params.id);
            if (index !== -1){ user.retweets.splice(index, 1) }
            var index2 = user.tweets.indexOf(req.params.id);
            if (index2 !== -1){ user.tweets.splice(index2, 1) }
            var index3 = tweet.retweets.indexOf(req.user._id);
            if (index3 !== -1){ tweet.retweets.splice(index3, 1) } 
            user.save()
            tweet.save()
            res.send({success: true, msg: 'undo retweet'})
        }else{

            let newRetweet = {
                user: req.user._id,
                retweet: tweet._id,
                username: req.user.username,
                name: req.user.name,
                description: `${"retweeted from " + tweet._id}`
            }

            let retweet = await Tweet.create(newRetweet)
            user.retweets.unshift(req.params.id)
            user.tweets.unshift(retweet)
            tweet.retweets.unshift(req.user._id)
            user.save()
            tweet.save()
            res.send({success: true, msg: 'retweeted'})
        }
    }catch(error){;
        console.log(error)
        res.status(500).json({msg:'unknown server error'})
    }
})

router.delete('/:id/delete', passport.authenticate('jwt', {session: false}), async(req, res)=>{
    try{
        let tweet = await Tweet.findById(req.params.id)
        if(tweet.user.toString() == req.user._id){
            Tweet.findByIdAndDelete(req.params.id)
            .then(()=>{
                res.send({success: true, msg: 'tweet deleted'})
            })
            .catch(()=>{
                res.send({success: false, msg: 'Unknown server error'})
            })
        }else{
            res.status(401).json({msg:'Unauthorized'})
        }
    }
    catch{
        res.send({success: false, msg: 'Unknown server error'})
    }
})


module.exports = router