const express = require('express')
const router = express.Router()
const passport = require('passport')
const Tweet = require('../models/tweet')
const User = require('../models/user')
const Hashtag = require('../models/hashtag')


router.get('/', async(req,res)=>{
    try{
        let hashtags = await Hashtag.find().sort({"count": -1}).exec()
        res.send({success: true, trends: hashtags})
    }catch(err){
        console.log(err)
        res.status(500).send({success: false, msg:'unknown server error'})
    }
})

router.get('/:hashtag', async(req,res)=>{
    let param = '#' + req.params.hashtag
    try{
        let hashtag = await Hashtag.findOne({content: param}).populate({path:'tweets', populate:{path:'user', select:'username profileImg name'}})
        .populate({path:'tweets', populate:{path:'parent', populate:{path:'user', model:'User', select:'username profileImg name'}}})
        res.send({success: true, tagTweets: hashtag})
    }catch(err){
        console.log(err)
        res.status(500).send({success: false, msg:'unknown server error'})
    }
})

router.post('/', async (req,res)=>{    
    //will ignore username param
    //should be get req but get doesnt accept body
    try{
        let result = await Tweet.find({ $or:[{description: new RegExp(req.body.description, 'i')},{username: new RegExp(req.body.description, 'i')},{name: new RegExp(req.body.description, 'i')}]}).populate('user','profileImg name username').populate({path: 'parent', populate:{path:'user', model:'User', select:'username profileImg name'}}).limit(10).exec()
        res.status(200).send({success: true, result})
    }catch(err){
        console.log(err)
        res.status(500).json({success: false, msg: 'Unknown server error'})
    }
})

module.exports = router