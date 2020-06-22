const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const passport = require('passport')
const bcrypt = require('bcrypt');
const User = require('../models/user')
const { Conversation, Message } = require('../models/chat')

//get user conversations
router.get('/conversations', passport.authenticate('jwt', {session: false}), async (req,res)=>{
    try{
        const conversations = await User.findOne({username: req.user.username},{conversations: 1})
        .populate({path:'conversations', select:'participants updatedAt', options: { sort: { 'updatedAt': -1 } }, populate:{path:'messages', select:'content sender', populate:{path: 'sender', model: 'User', select: 'username name profileImg'}}})
        .populate({path:'conversations', select:'participants updatedAt', options: { sort: { 'updatedAt': -1 } }, populate:{
            path: 'participants', select: 'username name profileImg'
        }})
        // conversations.notifications = []
        // conversations.save()
        res.send({conversations})

    }catch(error){
        console.log(error)
        res.status(500).json({success: false, msg: 'error getting conversations'})
    }
})

//get single conversation
router.get('/conversation', passport.authenticate('jwt', {session: false}), async (req,res)=>{
    try{
        const conversation =  await Conversation.findById(req.query.id).populate({path: 'messages' , populate:{path: 'sender', model: 'User', select: 'username name'}})
        if(!conversation){
            res.status(404).send({msg: 'Conversation not found'})
        }else{
            if(conversation.participants.includes(req.user._id)){
                res.send({conversation})
            }else{
                res.status(401).send({msg: 'Unauthorized access'})
            }
        }

    }catch(error){
        console.log(error)
        res.status(500).json({success: false, msg: 'error getting conversation'})
    }
})

//start
router.post('/conversation', passport.authenticate('jwt', {session: false}), async (req,res)=>{

    let user1 = req.user._id
    let user2 = req.body.id
    
    console.log(req.body)
    try{
        const findChat = await Conversation.find( { participants: { $all: [user1, user2] } } )
        if(findChat.length<1){
            let newConversation = await Conversation.create({participants:[user1, user2]})
            
            if(req.body.content){
                let firstmessage = {
                    sender: req.user._id,
                    content: req.body.content
                }
                let newMessage = await Message.create(firstmessage)
                newConversation.messages.push(newMessage)
            }

            let userA = await User.findById(req.user._id)
            let userB = await User.findById(req.body.id)
            newConversation.save()
            userA.conversations.unshift(newConversation)
            userA.save()
            userB.conversations.unshift(newConversation)
            userB.save()
            }
        if(findChat.length>0 && req.body.content){
            let newMsg = {
                sender: req.user._id,
                content: req.body.content
            }
            let addMsg = await Message.create(newMsg)
            findChat[0].messages.push(addMsg)
            findChat[0].save()
        }
        res.send({msg:'messsage sent'})
    }catch(error){
        console.log(error)
        res.status(500).json({success: false, msg: 'Unknown server error'})
    }
})


module.exports = router