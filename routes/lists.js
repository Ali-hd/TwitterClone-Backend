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
    Object.keys(updateUser).forEach(key => updateUser[key] === undefined || updateUser[key] === '' ? delete updateUser[key]:null)
    try{
        let list = List.findById(req.params.id)
        if(list.user.toString() == req.user._id){
            List.findByIdAndUpdate(req.params.id, updateList, { useFindAndModify: false })
            .then(l=>{
                res.send({success: true, msg: 'list has beend updated'})
            }).catch(err=>res.status(500).send({success: false, msg:'unknown server error'}))
        }else{
            res.status(401).json({msg:'Unauthorized'})
        }
    }catch(err){
        res.status(400).json({success: false, msg:'unknown server error'})
        }  
    })
)

router.delete('/:id/delete', passport.authenticate('jwt', {session: false}), async(req, res)=>{
    try{
        let list = await List.findById(req.params.id)
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


module.exports = router