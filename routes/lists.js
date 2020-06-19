const express = require('express')
const router = express.Router()
const passport = require('passport')
const Tweet = require('../models/tweet')
const User = require('../models/user')
const List = require('../models/list')

router.post('/create', passport.authenticate('jwt', {session: false}),( async (req,res) =>{
 
    const newList = {
        name: req.body.name,
        description: req.body.description,
        banner: req.body.banner,
        user: req.user._id,
    }
    try{
        let user = await User.findById(req.user._id)
        let list = await List.create(newList)
        user.lists.unshift(list)
        user.save()
        res.send({success: true, msg:'list created successfully', list: list})
    }catch(err){
        res.status(400).send({success: false, msg:'error creating list'})
        }  
    })
)

router.put('/:id/edit', passport.authenticate('jwt', {session: false}),( async (req,res) =>{
 
    const updateList = {
        name: req.body.name,
        description: req.body.description,
        banner: req.body.banner,
    }
    Object.keys(updateList).forEach(key => updateList[key] === undefined || updateList[key] === '' ? delete updateList[key]:null)
    try{
        let list = await List.findById(req.params.id)
        if(list.user.toString() == req.user._id){
            List.findByIdAndUpdate(req.params.id, updateList, { useFindAndModify: false })
            .then(l=>{
                res.send({success: true, msg: 'list has beend updated'})
            }).catch(err=>res.status(500).send({success: false, msg:'unknown server error'}))
        }else{
            res.status(401).json({msg:'Unauthorized'})
        }
    }catch(err){
        console.log(err)
        res.status(400).json({success: false, msg:'unknown server error'})
        }  
    })
)

router.delete('/:id/delete', passport.authenticate('jwt', {session: false}), async(req, res)=>{
    try{
        let list = await List.findById(req.params.id)
        console.log(list.user.toString())
        if(list.user.toString() == req.user._id){
            List.findByIdAndDelete(req.params.id)
            .then(()=>{ res.send({success: true, msg: 'tweet deleted'}) })
            .catch(()=>{ res.send({success: false, msg: 'Unknown server error'}) })
        }else{
            res.status(401).json({msg:'Unauthorized'})
        }
    }
    catch{
        res.send({success: false, msg: 'Unknown server error'})
    }
})

router.get('/:id', passport.authenticate('jwt', {session: false}), async(req,res)=>{
    try{
        const list = await List.findById(req.params.id).populate('user','name username profileImg').populate('users', 'username')
        let users = [] 
        for(let i = 0; i < list.users.length; i++){
            users.push(list.users[i]._id)
        }
        const listTweets = await Tweet.find().where('user').in(users).sort({_id: -1})
        .populate('user','username name _id profileImg').populate({path: 'parent',
         populate:{path: 'user', select: 'username profileImg name'}}).exec()
        res.send({success: true , list, listTweets})
    }catch(err){
        console.log(err)
        res.send({success: false, msg:'unknown server error'})
    }
})

router.post('/:username/:id', passport.authenticate('jwt', {session: false}),( async (req,res) =>{
    try{
        let user = await User.findOne({username: req.params.username})
        let list = await List.findById(req.params.id)
        if(list.users.includes(user._id)){
            var index = list.users.indexOf(user._id);
            if (index !== -1){ list.users.splice(index, 1) }
            list.save()
            res.send({success: true, msg:'user removed'})
        }else{
            list.users.push(user)
            res.send({success: true, msg:'user added'})
        }
        list.save()
    }catch(err){
        res.status(500).send({success: false, msg:'unknown server error'})
        }  
    })
)


module.exports = router